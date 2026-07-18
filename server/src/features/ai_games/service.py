import random
from http import HTTPStatus
from time import time
from uuid import uuid4

from firebase_admin import db as firebase_db
from pydantic import ValidationError

from core.countries import get_countries, get_countries_with_borders
from core.firebase import FIREBASE_SERVER_TIMESTAMP, get_firebase_app
from core.http import ApiError
from features.ai_games.ai_move_selector import choose_ai_move
from features.ai_games.models import (
    AiGameHistoryMoveRecord,
    AiGameMoveActor,
    AiGameRecord,
    AiGameResult,
    AiGamesSortBy,
    AiGamesSummary,
    AiGameTurn,
    CreateAiGameInput,
    CreateAiGameMoveInput,
    OrderBy,
    RealtimeAiGameRecord,
)
from features.ai_games.queue import enqueue_ai_game_move, enqueue_ai_game_timeout
from features.ai_games.repository import AiGamesRepository
from features.users.repository import UsersRepository


class AiGamesService:
    PLAYER_TURN_TIMEOUT_MS = 60_000

    def __init__(
        self,
        ai_games_repository: AiGamesRepository | None = None,
        users_repository: UsersRepository | None = None,
    ):
        self.ai_games_repository = ai_games_repository or AiGamesRepository()
        self.users_repository = users_repository or UsersRepository()

    def _get_ai_games_ref(self):
        return firebase_db.reference("aiGames", app=get_firebase_app())

    def get_ai_games(
        self, user_id: str, limit: int, sort_by: AiGamesSortBy, order_by: OrderBy
    ) -> AiGamesSummary:
        return self.ai_games_repository.get_user_summary(user_id, limit, sort_by, order_by)

    def _get_game_ref(self, game_id: str):
        return self._get_ai_games_ref().child(game_id)

    def _build_history_moves(
        self,
        realtime_ai_game: RealtimeAiGameRecord,
        final_move: AiGameHistoryMoveRecord | None = None,
    ) -> list[AiGameHistoryMoveRecord]:
        history_moves = [
            AiGameHistoryMoveRecord(
                id=f"{realtime_ai_game.id}:0",
                gameId=realtime_ai_game.id,
                moveIndex=0,
                country=realtime_ai_game.start,
                actor="start",
                userId=None,
            )
        ]
        sorted_moves = sorted(
            realtime_ai_game.moves.items(),
            key=lambda item: (item[1].created_at, item[0]),
        )

        for move_index, (move_id, move) in enumerate(sorted_moves, start=1):
            history_moves.append(
                AiGameHistoryMoveRecord(
                    id=move_id,
                    gameId=realtime_ai_game.id,
                    moveIndex=move_index,
                    country=move.country,
                    actor=move.actor,
                    userId=realtime_ai_game.user_id if move.actor == "player" else None,
                )
            )

        if final_move is not None:
            history_moves.append(final_move)

        return history_moves

    def _finish_game(
        self,
        result: AiGameResult,
        realtime_ai_game: RealtimeAiGameRecord,
        final_move: AiGameHistoryMoveRecord | None = None,
    ) -> bool:
        return self.ai_games_repository.finish_game(
            realtime_ai_game.id,
            result,
            self._build_history_moves(realtime_ai_game, final_move),
        )

    def _build_final_move(
        self,
        realtime_ai_game: RealtimeAiGameRecord,
        move_id: str,
        country_code: str,
        actor: AiGameMoveActor,
    ) -> AiGameHistoryMoveRecord:
        # Firebase returns unresolved server-timestamp placeholders after a terminal transaction,
        # so we append the last move from inputs that has already been validated.
        return AiGameHistoryMoveRecord(
            id=move_id,
            gameId=realtime_ai_game.id,
            moveIndex=len(realtime_ai_game.moves) + 1,
            country=country_code,
            actor=actor,
            userId=realtime_ai_game.user_id if actor == "player" else None,
        )

    def _compute_available_moves(
        self, country_code: str, used_countries: list[str]
    ) -> list[str]:
        countries = get_countries()
        borders = countries[country_code]["borders"]
        used_country_codes = set(used_countries)

        return [
            border_code
            for border_code in borders
            if border_code not in used_country_codes
        ]

    def _build_available_moves_field(
        self, available_moves: list[str]
    ) -> dict[str, list[str]]:
        # Realtime database doesn't allow empty arrays, so we omit the field if there are no available moves
        if not available_moves:
            return {}

        return {"availableMoves": available_moves}

    def _append_move(
        self,
        realtime_ai_game: RealtimeAiGameRecord,
        *,
        country_code: str,
        actor: AiGameMoveActor,
        move_key: str,
    ) -> tuple[dict[str, object], AiGameResult | None]:
        next_turn: AiGameTurn = "ai" if actor == "player" else "player"
        used_countries = [*realtime_ai_game.used_countries, country_code]
        available_moves = self._compute_available_moves(country_code, used_countries)
        terminal_result: AiGameResult | None = None

        # Check if the game has reached a terminal state based on the available moves and the next turn
        if not available_moves:
            terminal_result = "win" if next_turn == "ai" else "lose"

        moves = {
            move_id: move.model_dump(by_alias=True, mode="json")
            for move_id, move in realtime_ai_game.moves.items()
        }
        moves[move_key] = {
            "country": country_code,
            "actor": actor,
            "createdAt": FIREBASE_SERVER_TIMESTAMP,
        }

        return (
            {
                "id": realtime_ai_game.id,
                "userId": realtime_ai_game.user_id,
                "difficulty": realtime_ai_game.difficulty,
                "turn": next_turn,
                "start": realtime_ai_game.start,
                "country": country_code,
                **self._build_available_moves_field(available_moves),
                "usedCountries": used_countries,
                "moves": moves,
                "createdAt": realtime_ai_game.created_at,
                "updatedAt": FIREBASE_SERVER_TIMESTAMP,
            },
            terminal_result,
        )

    def _require_owned_ai_game(self, user_id: str, game_id: str) -> None:
        ai_game = self.ai_games_repository.get_by_id(game_id)
        if ai_game is None or ai_game.user_id != user_id:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="ai_game_not_found",
                message="Ai game was not found.",
            )

    def _apply_timeout_loss(
        self, realtime_ai_game: RealtimeAiGameRecord
    ) -> dict[str, object]:
        return {
            "id": realtime_ai_game.id,
            "userId": realtime_ai_game.user_id,
            "difficulty": realtime_ai_game.difficulty,
            "turn": "player",
            "start": realtime_ai_game.start,
            "country": realtime_ai_game.country,
            "usedCountries": realtime_ai_game.used_countries,
            "moves": {
                move_id: move.model_dump(by_alias=True, mode="json")
                for move_id, move in realtime_ai_game.moves.items()
            },
            "createdAt": realtime_ai_game.created_at,
            "updatedAt": FIREBASE_SERVER_TIMESTAMP,
        }

    def _build_initial_realtime_ai_game(
        self, ai_game: AiGameRecord
    ) -> tuple[dict[str, object], RealtimeAiGameRecord]:
        country_code = random.choice(get_countries_with_borders())
        starting_turn: AiGameTurn = random.choice(("player", "ai"))
        available_moves = self._compute_available_moves(country_code, [country_code])
        timestamp_ms = int(time() * 1000)

        payload = {
            "id": ai_game.id,
            "userId": ai_game.user_id,
            "difficulty": ai_game.difficulty,
            "turn": starting_turn,
            "start": country_code,
            "country": country_code,
            **self._build_available_moves_field(available_moves),
            "usedCountries": [country_code],
            "moves": {},
            "createdAt": FIREBASE_SERVER_TIMESTAMP,
            "updatedAt": FIREBASE_SERVER_TIMESTAMP,
        }
        realtime_ai_game = RealtimeAiGameRecord.model_validate(
            {
                **payload,
                "createdAt": timestamp_ms,
                "updatedAt": timestamp_ms,
            }
        )

        return payload, realtime_ai_game

    def create_ai_game(
        self, user_id: str, payload: dict[str, object]
    ) -> tuple[RealtimeAiGameRecord, int]:
        try:
            create_ai_game_input = CreateAiGameInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="difficulty is required.",
            ) from error

        user = self.users_repository.get_by_id(user_id)

        # Create a record for anonymous user if the user does not exist in PostgreSQL
        if user is None:
            self.users_repository.create(user_id, "Guest", None)

        # Update incomplete games and save a new game record into PostgreSQL
        created_ai_game = (
            self.ai_games_repository.create_after_cancelling_incomplete_games(
                str(uuid4()), user_id, create_ai_game_input.difficulty
            )
        )
        realtime_payload, realtime_ai_game = self._build_initial_realtime_ai_game(
            created_ai_game
        )

        # Save game session into Firebase Realtime Database
        self._get_game_ref(created_ai_game.id).set(realtime_payload)

        if realtime_ai_game.turn == "ai" and realtime_ai_game.available_moves:
            enqueue_ai_game_move(created_ai_game.id)
        elif realtime_ai_game.turn == "player" and realtime_ai_game.available_moves:
            enqueue_ai_game_timeout(created_ai_game.id)

        return realtime_ai_game, HTTPStatus.CREATED

    def create_ai_game_move(
        self, user_id: str, game_id: str, payload: dict[str, object]
    ) -> None:
        self._require_owned_ai_game(user_id, game_id)

        try:
            create_move_input = CreateAiGameMoveInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="countryCode is required.",
            ) from error

        game_ref = self._get_game_ref(game_id)
        move_key = uuid4().hex

        terminal_result: AiGameResult | None = None
        terminal_realtime_game: RealtimeAiGameRecord | None = None
        final_move: AiGameHistoryMoveRecord | None = None

        def apply_player_move(current_value: dict[str, object] | None):
            nonlocal final_move, terminal_realtime_game, terminal_result

            if current_value is None:
                raise ApiError(
                    status_code=HTTPStatus.NOT_FOUND,
                    code="ai_game_not_found",
                    message="Ai game was not found.",
                )

            realtime_ai_game = RealtimeAiGameRecord.model_validate(current_value)
            if realtime_ai_game.turn != "player":
                raise ApiError(
                    status_code=HTTPStatus.BAD_REQUEST,
                    code="invalid_request_body",
                    message="It is not the player's turn.",
                )
            if create_move_input.country_code not in realtime_ai_game.available_moves:
                raise ApiError(
                    status_code=HTTPStatus.BAD_REQUEST,
                    code="invalid_request_body",
                    message="countryCode must be one of the available moves.",
                )

            updated_game, next_terminal_result = self._append_move(
                realtime_ai_game,
                country_code=create_move_input.country_code,
                actor="player",
                move_key=move_key,
            )
            terminal_result = next_terminal_result
            if terminal_result is not None:
                terminal_realtime_game = realtime_ai_game
                final_move = self._build_final_move(
                    realtime_ai_game,
                    move_key,
                    create_move_input.country_code,
                    "player",
                )

            return updated_game

        game_ref.transaction(apply_player_move)

        if terminal_result is not None:
            if terminal_realtime_game is not None:
                self._finish_game(terminal_result, terminal_realtime_game, final_move)
            return

        enqueue_ai_game_move(game_id)

    def process_ai_game_timeout(self, game_id: str) -> None:
        ai_game = self.ai_games_repository.get_by_id(game_id)
        if ai_game is None or ai_game.result is not None:
            return

        game_ref = self._get_game_ref(game_id)
        current_time_ms = int(time() * 1000)
        did_timeout = False
        final_realtime_game: RealtimeAiGameRecord | None = None

        def apply_timeout(current_value: dict[str, object] | None):
            nonlocal did_timeout, final_realtime_game

            if current_value is None:
                return current_value

            realtime_ai_game = RealtimeAiGameRecord.model_validate(current_value)

            # If the player has already made a move or the game has already been finished, skip handling the timeout
            if realtime_ai_game.turn != "player" or not realtime_ai_game.available_moves:
                return current_value

            if current_time_ms < realtime_ai_game.updated_at + self.PLAYER_TURN_TIMEOUT_MS:
                return current_value

            did_timeout = True
            final_realtime_game = realtime_ai_game
            return self._apply_timeout_loss(realtime_ai_game)

        game_ref.transaction(apply_timeout)

        if did_timeout and final_realtime_game is not None:
            self._finish_game("lose", final_realtime_game)

    def process_ai_game_move(self, game_id: str) -> None:
        ai_game = self.ai_games_repository.get_by_id(game_id)
        if ai_game is None or ai_game.result is not None:
            return

        game_ref = self._get_game_ref(game_id)
        move_key = uuid4().hex

        terminal_result: AiGameResult | None = None
        terminal_realtime_game: RealtimeAiGameRecord | None = None
        final_move: AiGameHistoryMoveRecord | None = None
        should_enqueue_timeout = False

        def apply_ai_move(current_value: dict[str, object] | None):
            nonlocal final_move, terminal_realtime_game, terminal_result, should_enqueue_timeout

            if current_value is None:
                return current_value

            realtime_ai_game = RealtimeAiGameRecord.model_validate(current_value)
            if realtime_ai_game.turn != "ai":
                return current_value

            if not realtime_ai_game.available_moves:
                terminal_result = "win"
                terminal_realtime_game = realtime_ai_game
                return current_value

            country_code = choose_ai_move(realtime_ai_game)
            updated_game, next_terminal_result = self._append_move(
                realtime_ai_game,
                country_code=country_code,
                actor="ai",
                move_key=move_key,
            )
            terminal_result = next_terminal_result
            if terminal_result is not None:
                terminal_realtime_game = realtime_ai_game
                final_move = self._build_final_move(
                    realtime_ai_game,
                    move_key,
                    country_code,
                    "ai",
                )
            else:
                should_enqueue_timeout = True

            return updated_game

        game_ref.transaction(apply_ai_move)

        if terminal_result is not None:
            if terminal_realtime_game is not None:
                self._finish_game(terminal_result, terminal_realtime_game, final_move)
            return

        # Send a message to SQS to handle timeout for the player's turn if the game continues
        if should_enqueue_timeout:
            enqueue_ai_game_timeout(game_id)

    def delete_expired_ai_games(self) -> int:
        deleted_game_ids = self.ai_games_repository.delete_expired_games()
        if deleted_game_ids:
            self._get_ai_games_ref().update({game_id: None for game_id in deleted_game_ids})

        return len(deleted_game_ids)
