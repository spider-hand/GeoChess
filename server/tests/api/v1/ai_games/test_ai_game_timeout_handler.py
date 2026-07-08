import json
from unittest.mock import MagicMock, patch

from api.v1.ai_games.timeout import handler
from core.http import ApiError
from tests.factories.http_events import make_api_gateway_event


def make_event(game_id="game-123", authenticated_uid="user-123"):
    return make_api_gateway_event(
        route_key="POST /api/v1/ai-games/{gameId}/timeout",
        raw_path=f"/api/v1/ai-games/{game_id}/timeout",
        method="POST",
        path_parameters={"gameId": game_id},
        authenticated_uid=authenticated_uid,
    )


def test_timeout_ai_game_returns_204_without_body():
    with patch.object(handler._ai_games_service, "timeout_ai_game", return_value=None):
        response = handler.timeout_ai_game(make_event(), MagicMock())

    assert response["statusCode"] == 204
    assert response["body"] == ""


def test_timeout_ai_game_returns_400_on_service_error():
    with patch.object(
        handler._ai_games_service,
        "timeout_ai_game",
        side_effect=ApiError(
            400, "invalid_request_body", "The timeout has not expired yet."
        ),
    ):
        response = handler.timeout_ai_game(make_event(), MagicMock())

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["code"] == "invalid_request_body"
