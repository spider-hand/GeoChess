import json
from unittest.mock import MagicMock, patch

from api.v1.ai_games import handler
from features.ai_games.models import RealtimeAiGameRecord
from tests.factories.http_events import make_api_gateway_event


def make_event(body=None, game_id="game-123", authenticated_uid="user-123"):
    return make_api_gateway_event(
        route_key="POST /api/v1/ai-games",
        raw_path="/api/v1/ai-games",
        method="POST",
        body=body,
        path_parameters={"gameId": game_id},
        authenticated_uid=authenticated_uid,
    )


def make_realtime_ai_game():
    return RealtimeAiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "turn": "player",
            "start": "BB",
            "country": "BB",
            "availableMoves": ["CC"],
            "usedCountries": ["BB"],
            "moves": {},
            "createdAt": 1751155200000,
            "updatedAt": 1751155200000,
        }
    )


def test_create_ai_game_returns_201():
    with patch.object(
        handler._ai_games_service, "create_ai_game", return_value=(make_realtime_ai_game(), 201)
    ):
        response = handler.create_ai_game(
            make_event(body={"difficulty": "medium"}), MagicMock()
        )

    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["difficulty"] == "medium"
    assert body["turn"] == "player"
    assert body["start"] == "BB"
    assert body["availableMoves"] == ["CC"]
