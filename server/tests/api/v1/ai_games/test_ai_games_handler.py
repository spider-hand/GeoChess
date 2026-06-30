import json
from unittest.mock import MagicMock, patch

from api.v1.ai_games import handler
from core.http import ApiError
from features.ai_games.models import AiGameRecord, RealtimeAiGameRecord


def make_event(body=None, game_id="game-123", authenticated_uid="user-123"):
    return {
        "pathParameters": {"gameId": game_id},
        "requestContext": {
            "authorizer": {
                "lambda": {
                    "uid": authenticated_uid,
                }
            }
        },
        "body": json.dumps(body) if body is not None else None,
    }


def make_ai_game(result=None):
    return AiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "result": result,
            "createdAt": "2026-06-29T00:00:00Z",
            "updatedAt": "2026-06-29T00:00:00Z",
        }
    )


def make_realtime_ai_game():
    return RealtimeAiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "turn": 1,
            "country": "BB",
            "borders": ["CC"],
            "usedCountries": ["BB"],
            "moves": [],
            "createdAt": "2026-06-29T00:00:00Z",
            "updatedAt": "2026-06-29T00:00:00Z",
        }
    )


def test_get_ai_game_returns_200_for_owner():
    with patch.object(handler._ai_games_service, "get_ai_game", return_value=make_ai_game()):
        response = handler.get_ai_game(make_event(), MagicMock())

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["id"] == "game-123"


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
    assert body["turn"] == 1
    assert body["country"] == "BB"
    assert body["usedCountries"] == ["BB"]


def test_get_ai_game_returns_404_for_other_users_game():
    with patch.object(
        handler._ai_games_service,
        "get_ai_game",
        side_effect=ApiError(404, "ai_game_not_found", "Ai game was not found."),
    ):
        response = handler.get_ai_game(make_event(authenticated_uid="other-user"), MagicMock())

    assert response["statusCode"] == 404
    body = json.loads(response["body"])
    assert body["code"] == "ai_game_not_found"


def test_handler_returns_400_when_game_id_is_missing():
    response = handler.get_ai_game(
        {
            "pathParameters": {},
            "requestContext": {"authorizer": {"lambda": {"uid": "user-123"}}},
        },
        MagicMock(),
    )

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["code"] == "missing_game_id"
