from http import HTTPStatus
from uuid import uuid4

from pydantic import ValidationError

from core.http import ApiError
from features.ai_games.models import AiGameRecord, CreateAiGameInput
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

    def create_ai_game(
        self, user_id: str, payload: dict[str, object]
    ) -> tuple[AiGameRecord, int]:
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

        created_ai_game = self.ai_games_repository.create_after_cancelling_incomplete_games(
            str(uuid4()), user_id, create_ai_game_input.difficulty
        )
        return created_ai_game, HTTPStatus.CREATED
