from unittest.mock import MagicMock

import pytest

from core.http import ApiError
from features.ai_games.models import AiGameRecord
from features.ai_games.service import AiGamesService


def make_ai_game(user_id="user-123", result=None):
    return AiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": user_id,
            "difficulty": "medium",
            "result": result,
            "createdAt": "2026-06-29T00:00:00Z",
            "updatedAt": "2026-06-29T00:00:00Z",
        }
    )


def test_get_ai_game_returns_404_when_game_belongs_to_other_user():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game(user_id="other-user")
    service = AiGamesService(ai_games_repository=ai_games_repository)

    with pytest.raises(ApiError) as error:
        service.get_ai_game("user-123", "game-123")

    assert error.value.status_code == 404
    assert error.value.code == "ai_game_not_found"


def test_create_ai_game_returns_404_when_user_does_not_exist():
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = None
    service = AiGamesService(users_repository=users_repository)

    with pytest.raises(ApiError) as error:
        service.create_ai_game("user-123", {"difficulty": "medium"})

    assert error.value.status_code == 404
    assert error.value.code == "user_not_found"


def test_create_ai_game_returns_400_for_unexpected_fields():
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = MagicMock()
    service = AiGamesService(users_repository=users_repository)

    with pytest.raises(ApiError) as error:
        service.create_ai_game("user-123", {"difficulty": "medium", "result": "cancelled"})

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"


def test_create_ai_game_cancels_existing_incomplete_games_before_create():
    ai_games_repository = MagicMock()
    ai_games_repository.create_after_cancelling_incomplete_games.return_value = make_ai_game()
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = MagicMock()
    service = AiGamesService(
        ai_games_repository=ai_games_repository,
        users_repository=users_repository,
    )

    result, status_code = service.create_ai_game("user-123", {"difficulty": "medium"})

    assert result == ai_games_repository.create_after_cancelling_incomplete_games.return_value
    assert status_code == 201
    ai_games_repository.create_after_cancelling_incomplete_games.assert_called_once()
