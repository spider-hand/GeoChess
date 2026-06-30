import random
from http import HTTPStatus
from uuid import uuid4

from firebase_admin import db as firebase_db
from pydantic import ValidationError

from core.countries import get_countries, get_countries_with_borders
from core.firebase import get_firebase_app
from core.http import ApiError
from features.ai_games.models import AiGameRecord, AiGameTurn, CreateAiGameInput, RealtimeAiGameRecord
from features.ai_games.repository import AiGamesRepository
from features.users.repository import UsersRepository


class AiGamesService:
    def __init__(
        self,
        ai_games_repository: AiGamesRepository | None = None,
        users_repository: UsersRepository | None = None,
    ):
        self.ai_games_repository = ai_games_repository or AiGamesRepository()
        self.users_repository = users_repository or UsersRepository()

    def get_ai_game(self, user_id: str, game_id: str) -> AiGameRecord:
        ai_game = self.ai_games_repository.get_by_id(game_id)
        if ai_game is None or ai_game.user_id != user_id:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="ai_game_not_found",
                message="Ai game was not found.",
            )

        return ai_game

    def _build_initial_realtime_ai_game(self, ai_game: AiGameRecord) -> RealtimeAiGameRecord:
        countries = get_countries()
        eligible_country_codes = get_countries_with_borders()

        country_code = random.choice(eligible_country_codes)
        country = countries[country_code]
        starting_turn: AiGameTurn = random.choice((0, 1))

        return RealtimeAiGameRecord.model_validate(
            {
                "id": ai_game.id,
                "userId": ai_game.user_id,
                "difficulty": ai_game.difficulty,
                "turn": starting_turn,
                "country": country_code,
                "borders": country["borders"],
                "usedCountries": [country_code],
                "moves": [],
                "createdAt": ai_game.created_at,
                "updatedAt": ai_game.updated_at,
            }
        )

    def create_ai_game(
        self, user_id: str, payload: dict[str, object]
    ) -> tuple[RealtimeAiGameRecord, int]:
        user = self.users_repository.get_by_id(user_id)
        if user is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )

        try:
            create_ai_game_input = CreateAiGameInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="difficulty is required.",
            ) from error

        # Update incomplete games and save a new game record into PostgreSQL
        created_ai_game = self.ai_games_repository.create_after_cancelling_incomplete_games(
            str(uuid4()), user_id, create_ai_game_input.difficulty
        )

        # Save game session into Firebase Realtime Database
        realtime_ai_game = self._build_initial_realtime_ai_game(created_ai_game)

        firebase_db.reference("aiGames", app=get_firebase_app()).child(
            created_ai_game.id
        ).set(realtime_ai_game.model_dump(by_alias=True, mode="json"))

        return realtime_ai_game, HTTPStatus.CREATED

    def delete_expired_ai_games(self) -> int:
        return self.ai_games_repository.delete_expired_games()
