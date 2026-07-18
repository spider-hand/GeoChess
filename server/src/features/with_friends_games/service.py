import random
from http import HTTPStatus
from time import time
from uuid import uuid4

from firebase_admin import db as firebase_db
from pydantic import ValidationError

from core.countries import get_countries, get_countries_with_borders
from core.firebase import FIREBASE_SERVER_TIMESTAMP, get_firebase_app
from core.http import ApiError
from features.users.repository import UsersRepository
from features.with_friends_games.models import (
    CreateWithFriendsGameJoinInput,
    CreateWithFriendsGameMoveInput,
    RealtimeWithFriendsGameRecord,
    WithFriendsGameMoveActor,
    WithFriendsGameRecord,
    WithFriendsGameResult,
    WithFriendsGameTurn,
)
from features.with_friends_games.queue import (
    enqueue_with_friends_game_start,
    enqueue_with_friends_game_timeout,
)
from features.with_friends_games.repository import WithFriendsGamesRepository


class WithFriendsGamesService:
    PLAYER_TURN_TIMEOUT_MS = 60_000

    def __init__(
        self,
        with_friends_games_repository: WithFriendsGamesRepository | None = None,
        users_repository: UsersRepository | None = None,
    ):
        self.with_friends_games_repository = (
            with_friends_games_repository or WithFriendsGamesRepository()
        )
        self.users_repository = users_repository or UsersRepository()

    def _get_with_friends_games_ref(self):
        return firebase_db.reference("withFriendsGames", app=get_firebase_app())

    def _get_room_keys_ref(self):
        return firebase_db.reference("withFriendsGameRoomKeys", app=get_firebase_app())

    def _get_root_ref(self):
        return firebase_db.reference("/", app=get_firebase_app())

    def _get_game_ref(self, game_id: str):
        return self._get_with_friends_games_ref().child(game_id)

    def _get_room_key_ref(self, room_key: str):
        return self._get_room_keys_ref().child(room_key)

    def _finish_game(
        self,
        result: WithFriendsGameResult,
        realtime_game: RealtimeWithFriendsGameRecord,
    ) -> bool:
        return self.with_friends_games_repository.finish_game(realtime_game.id, result)

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

    def _get_other_turn(self, turn: WithFriendsGameTurn) -> WithFriendsGameTurn:
        return "player2" if turn == "player1" else "player1"

    def _get_result_for_winner(
        self, winner: WithFriendsGameTurn
    ) -> WithFriendsGameResult:
        return "player1_win" if winner == "player1" else "player2_win"

    def _append_move(
        self,
        realtime_game: RealtimeWithFriendsGameRecord,
        *,
        country_code: str,
        actor: WithFriendsGameMoveActor,
        move_key: str,
    ) -> tuple[dict[str, object], WithFriendsGameResult | None]:
        next_turn = self._get_other_turn(actor)
        used_countries = [*realtime_game.used_countries, country_code]
        available_moves = self._compute_available_moves(country_code, used_countries)
        terminal_result: WithFriendsGameResult | None = None

        # Check if the game has reached a terminal state based on the available moves and the next turn
        if not available_moves:
            terminal_result = self._get_result_for_winner(actor)

        moves = {
            move_id: move.model_dump(by_alias=True, mode="json")
            for move_id, move in realtime_game.moves.items()
        }
        moves[move_key] = {
            "country": country_code,
            "actor": actor,
            "createdAt": FIREBASE_SERVER_TIMESTAMP,
        }

        return (
            {
                "id": realtime_game.id,
                "player1UserId": realtime_game.player1_user_id,
                "player2UserId": realtime_game.player2_user_id,
                "participants": realtime_game.participants,
                "status": "finished" if terminal_result is not None else "active",
                "turn": next_turn,
                "start": realtime_game.start,
                "country": country_code,
                **self._build_available_moves_field(available_moves),
                "usedCountries": used_countries,
                "moves": moves,
                "createdAt": realtime_game.created_at,
                "updatedAt": FIREBASE_SERVER_TIMESTAMP,
            },
            terminal_result,
        )

    def _apply_timeout_loss(
        self, realtime_game: RealtimeWithFriendsGameRecord
    ) -> dict[str, object]:
        return {
            "id": realtime_game.id,
            "player1UserId": realtime_game.player1_user_id,
            "player2UserId": realtime_game.player2_user_id,
            "participants": realtime_game.participants,
            "status": "finished",
            "turn": realtime_game.turn,
            "start": realtime_game.start,
            "country": realtime_game.country,
            "usedCountries": realtime_game.used_countries,
            "moves": {
                move_id: move.model_dump(by_alias=True, mode="json")
                for move_id, move in realtime_game.moves.items()
            },
            "createdAt": realtime_game.created_at,
            "updatedAt": FIREBASE_SERVER_TIMESTAMP,
        }

    def _build_initial_realtime_game(
        self, with_friends_game: WithFriendsGameRecord, room_key: str
    ) -> tuple[dict[str, object], RealtimeWithFriendsGameRecord]:
        country_code = random.choice(get_countries_with_borders())
        available_moves = self._compute_available_moves(country_code, [country_code])
        timestamp_ms = int(time() * 1000)

        payload = {
            "id": with_friends_game.id,
            "roomKey": room_key,
            "player1UserId": with_friends_game.player1_user_id,
            "participants": {
                "player1": with_friends_game.player1_user_id,
            },
            "status": "waiting",
            "turn": "player1",
            "start": country_code,
            "country": country_code,
            **self._build_available_moves_field(available_moves),
            "usedCountries": [country_code],
            "moves": {},
            "createdAt": FIREBASE_SERVER_TIMESTAMP,
            "updatedAt": FIREBASE_SERVER_TIMESTAMP,
        }
        realtime_game = RealtimeWithFriendsGameRecord.model_validate(
            {
                **payload,
                "createdAt": timestamp_ms,
                "updatedAt": timestamp_ms,
            }
        )

        return payload, realtime_game

    def _generate_room_key(self) -> str:
        return f"{random.randint(0, 999999):06d}"

    def _create_room(self, user_id: str) -> tuple[WithFriendsGameRecord, str]:
        created_game = self.with_friends_games_repository.create(str(uuid4()), user_id)

        for _ in range(10):
            room_key = self._generate_room_key()
            claimed_game_id = self._get_room_key_ref(room_key).transaction(
                lambda current_value: (
                    created_game.id if current_value is None else current_value
                )
            )
            if claimed_game_id == created_game.id:
                return created_game, room_key

        raise RuntimeError("Failed to generate a unique room key.")

    def create_with_friends_game(
        self, user_id: str
    ) -> tuple[WithFriendsGameRecord, str, int]:
        if self.users_repository.get_by_id(user_id) is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )

        created_game, room_key = self._create_room(user_id)
        realtime_payload, _ = self._build_initial_realtime_game(created_game, room_key)
        self._get_game_ref(created_game.id).set(realtime_payload)

        return created_game, room_key, HTTPStatus.CREATED

    def join_with_friends_game(self, user_id: str, payload: dict[str, object]) -> str:
        try:
            join_input = CreateWithFriendsGameJoinInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="roomKey is required.",
            ) from error

        game_id = self._get_room_key_ref(join_input.room_key).get()
        with_friends_game = (
            self.with_friends_games_repository.get_by_id(game_id)
            if isinstance(game_id, str)
            else None
        )
        if with_friends_game is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="with_friends_game_not_found",
                message="With-friends game was not found.",
            )

        if user_id in (
            with_friends_game.player1_user_id,
            with_friends_game.player2_user_id,
        ):
            return with_friends_game.id

        if with_friends_game.player2_user_id is not None:
            raise ApiError(
                status_code=HTTPStatus.CONFLICT,
                code="with_friends_game_full",
                message="This room is already full.",
            )

        assigned = self.with_friends_games_repository.assign_player2(
            with_friends_game.id, user_id
        )
        if not assigned:
            raise ApiError(
                status_code=HTTPStatus.CONFLICT,
                code="with_friends_game_full",
                message="This room is already full.",
            )

        game_ref = self._get_game_ref(with_friends_game.id)

        def apply_join(current_value: dict[str, object] | None):
            if current_value is None:
                return current_value

            realtime_game = RealtimeWithFriendsGameRecord.model_validate(current_value)
            if realtime_game.player2_user_id is not None:
                return current_value

            return {
                "id": realtime_game.id,
                "player1UserId": realtime_game.player1_user_id,
                "player2UserId": user_id,
                "participants": {
                    **realtime_game.participants,
                    "player2": user_id,
                },
                "status": "starting",
                "turn": realtime_game.turn,
                "start": realtime_game.start,
                "country": realtime_game.country,
                **self._build_available_moves_field(realtime_game.available_moves),
                "usedCountries": realtime_game.used_countries,
                "moves": {
                    move_id: move.model_dump(by_alias=True, mode="json")
                    for move_id, move in realtime_game.moves.items()
                },
                "createdAt": realtime_game.created_at,
                "updatedAt": FIREBASE_SERVER_TIMESTAMP,
            }

        game_ref.transaction(apply_join)

        # Send a message to SQS to start the game after a short delay
        enqueue_with_friends_game_start(with_friends_game.id)

        return with_friends_game.id

    def _require_participant(
        self, user_id: str, game_id: str
    ) -> tuple[WithFriendsGameRecord, WithFriendsGameTurn]:
        with_friends_game = self.with_friends_games_repository.get_by_id(game_id)
        if with_friends_game is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="with_friends_game_not_found",
                message="With-friends game was not found.",
            )

        if with_friends_game.player1_user_id == user_id:
            return with_friends_game, "player1"

        if with_friends_game.player2_user_id == user_id:
            return with_friends_game, "player2"

        raise ApiError(
            status_code=HTTPStatus.FORBIDDEN,
            code="forbidden",
            message="You do not have access to this resource.",
        )

    def create_with_friends_game_move(
        self, user_id: str, game_id: str, payload: dict[str, object]
    ) -> None:
        with_friends_game, actor = self._require_participant(user_id, game_id)
        if with_friends_game.result is not None:
            return

        try:
            create_move_input = CreateWithFriendsGameMoveInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="countryCode is required.",
            ) from error

        game_ref = self._get_game_ref(game_id)
        move_key = uuid4().hex

        terminal_result: WithFriendsGameResult | None = None
        terminal_realtime_game: RealtimeWithFriendsGameRecord | None = None
        should_enqueue_timeout = False

        def apply_move(current_value: dict[str, object] | None):
            nonlocal terminal_realtime_game, terminal_result, should_enqueue_timeout

            if current_value is None:
                raise ApiError(
                    status_code=HTTPStatus.NOT_FOUND,
                    code="with_friends_game_not_found",
                    message="With-friends game was not found.",
                )

            realtime_game = RealtimeWithFriendsGameRecord.model_validate(current_value)
            if realtime_game.status != "active":
                raise ApiError(
                    status_code=HTTPStatus.BAD_REQUEST,
                    code="invalid_request_body",
                    message="The game has not started yet.",
                )
            if realtime_game.turn != actor:
                raise ApiError(
                    status_code=HTTPStatus.BAD_REQUEST,
                    code="invalid_request_body",
                    message="It is not your turn.",
                )
            if create_move_input.country_code not in realtime_game.available_moves:
                raise ApiError(
                    status_code=HTTPStatus.BAD_REQUEST,
                    code="invalid_request_body",
                    message="countryCode must be one of the available moves.",
                )

            updated_game, next_terminal_result = self._append_move(
                realtime_game,
                country_code=create_move_input.country_code,
                actor=actor,
                move_key=move_key,
            )
            terminal_result = next_terminal_result

            if terminal_result is not None:
                terminal_realtime_game = realtime_game
            else:
                should_enqueue_timeout = True

            return updated_game

        game_ref.transaction(apply_move)

        if terminal_result is not None:
            if terminal_realtime_game is not None:
                self._finish_game(terminal_result, terminal_realtime_game)
            return

        # Send a message to SQS to handle timeout for the player who moves next if the game continues
        if should_enqueue_timeout:
            enqueue_with_friends_game_timeout(game_id)

    def process_with_friends_game_start(self, game_id: str) -> None:
        with_friends_game = self.with_friends_games_repository.get_by_id(game_id)
        if with_friends_game is None or with_friends_game.result is not None:
            return

        should_enqueue_timeout = False

        def apply_start(current_value: dict[str, object] | None):
            nonlocal should_enqueue_timeout

            if current_value is None:
                return current_value

            realtime_game = RealtimeWithFriendsGameRecord.model_validate(current_value)
            if realtime_game.status != "starting" or realtime_game.player2_user_id is None:
                return current_value

            should_enqueue_timeout = True
            return {
                "id": realtime_game.id,
                "player1UserId": realtime_game.player1_user_id,
                "player2UserId": realtime_game.player2_user_id,
                "participants": realtime_game.participants,
                "status": "active",
                "turn": random.choice(("player1", "player2")),
                "start": realtime_game.start,
                "country": realtime_game.country,
                **self._build_available_moves_field(realtime_game.available_moves),
                "usedCountries": realtime_game.used_countries,
                "moves": {
                    move_id: move.model_dump(by_alias=True, mode="json")
                    for move_id, move in realtime_game.moves.items()
                },
                "createdAt": realtime_game.created_at,
                "updatedAt": FIREBASE_SERVER_TIMESTAMP,
            }

        self._get_game_ref(game_id).transaction(apply_start)

        # Send a message to SQS to handle timeout for the player who does the first move if the game has started
        if should_enqueue_timeout:
            enqueue_with_friends_game_timeout(game_id)

    def process_with_friends_game_timeout(self, game_id: str) -> None:
        with_friends_game = self.with_friends_games_repository.get_by_id(game_id)
        if with_friends_game is None or with_friends_game.result is not None:
            return

        game_ref = self._get_game_ref(game_id)
        current_time_ms = int(time() * 1000)
        did_timeout = False
        final_realtime_game: RealtimeWithFriendsGameRecord | None = None
        timed_out_turn: WithFriendsGameTurn | None = None

        def apply_timeout(current_value: dict[str, object] | None):
            nonlocal did_timeout, final_realtime_game, timed_out_turn

            if current_value is None:
                return current_value

            realtime_game = RealtimeWithFriendsGameRecord.model_validate(current_value)

            # If the player has already made a move or the game has already been finished, skip handling the timeout
            if realtime_game.status != "active" or not realtime_game.available_moves:
                return current_value

            if current_time_ms < realtime_game.updated_at + self.PLAYER_TURN_TIMEOUT_MS:
                return current_value

            did_timeout = True
            final_realtime_game = realtime_game
            timed_out_turn = realtime_game.turn
            return self._apply_timeout_loss(realtime_game)

        game_ref.transaction(apply_timeout)

        if did_timeout and final_realtime_game is not None and timed_out_turn is not None:
            self._finish_game(
                self._get_result_for_winner(self._get_other_turn(timed_out_turn)),
                final_realtime_game,
            )

    def delete_expired_with_friends_games(self) -> int:
        deleted_game_ids = self.with_friends_games_repository.get_expired_game_ids()
        if deleted_game_ids:
            deleted_game_id_set = set(deleted_game_ids)
            room_key_index = self._get_room_keys_ref().get()
            updates = {
                f"withFriendsGames/{game_id}": None for game_id in deleted_game_ids
            }
            if isinstance(room_key_index, dict):
                updates.update(
                    {
                        f"withFriendsGameRoomKeys/{room_key}": None
                        for room_key, game_id in room_key_index.items()
                        if game_id in deleted_game_id_set
                    }
                )
            self._get_root_ref().update(updates)

        return len(deleted_game_ids)
