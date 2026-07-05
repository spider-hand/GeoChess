import json
from unittest.mock import MagicMock, patch

from api.v1.ai_games.moves import handler
from core.http import ApiError
from tests.factories.http_events import make_api_gateway_event


def make_event(body=None, game_id="game-123", authenticated_uid="user-123"):
    return make_api_gateway_event(
        route_key="POST /api/v1/ai-games/{gameId}/moves",
        raw_path=f"/api/v1/ai-games/{game_id}/moves",
        method="POST",
        body=body,
        path_parameters={"gameId": game_id},
        authenticated_uid=authenticated_uid,
    )


def test_create_ai_game_move_returns_202_without_body():
    with patch.object(handler._ai_games_service, "create_ai_game_move", return_value=None):
        response = handler.create_ai_game_move(
            make_event(body={"countryCode": "CC"}), MagicMock()
        )

    assert response["statusCode"] == 202
    assert response["body"] == ""


def test_create_ai_game_move_returns_400_on_service_error():
    with patch.object(
        handler._ai_games_service,
        "create_ai_game_move",
        side_effect=ApiError(400, "invalid_request_body", "countryCode is required."),
    ):
        response = handler.create_ai_game_move(
            make_event(body={"countryCode": "CC"}), MagicMock()
        )

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["code"] == "invalid_request_body"
