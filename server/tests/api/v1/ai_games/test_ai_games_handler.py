import json
from unittest.mock import MagicMock, patch

from api.v1.ai_games import handler
from features.ai_games.models import AiGameRecord, RealtimeAiGameRecord
from tests.factories.http_events import make_api_gateway_event


def make_event(
    body=None, game_id="game-123", authenticated_uid="user-123", method="POST"
):
    return make_api_gateway_event(
        route_key=f"{method} /api/v1/ai-games",
        raw_path="/api/v1/ai-games",
        method=method,
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


def make_ai_game():
    return AiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "result": "win",
            "createdAt": "2026-07-18T00:00:00Z",
            "updatedAt": "2026-07-18T00:01:00Z",
        }
    )


def test_get_ai_games_returns_a_list_of_completed_games():
    with patch.object(handler._ai_games_service, "get_ai_games", return_value=[make_ai_game()]):
        response = handler.get_ai_games(make_event(method="GET"), MagicMock())

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body == [
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "result": "win",
            "createdAt": "2026-07-18T00:00:00Z",
            "updatedAt": "2026-07-18T00:01:00Z",
        }
    ]


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
