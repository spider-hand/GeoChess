import json
from unittest.mock import MagicMock, patch

from api.v1.with_friends_games import handler
from features.with_friends_games.models import (
    WithFriendsGameHistoryRecord,
    WithFriendsGameStatsRecord,
)
from tests.factories.http_events import make_api_gateway_event


def make_event(method="GET", path="/api/v1/with-friends-games"):
    return make_api_gateway_event(
        route_key=f"{method} {path}", raw_path=path, method=method
    )


def test_get_with_friends_games_returns_completed_games():
    game = WithFriendsGameHistoryRecord.model_validate(
        {
            "id": "game-123",
            "opponentDisplayName": "Deleted User",
            "result": "win",
            "expired": True,
            "createdAt": "2026-07-18T00:00:00Z",
            "updatedAt": "2026-07-18T00:01:00Z",
        }
    )
    event = make_event()

    with patch.object(
        handler._with_friends_games_service,
        "get_with_friends_games",
        return_value=[game],
    ) as get_with_friends_games:
        response = handler.get_with_friends_games(event, MagicMock())

    assert response["statusCode"] == 200
    assert json.loads(response["body"])[0]["opponentDisplayName"] == "Deleted User"
    get_with_friends_games.assert_called_once_with("user-123", 20, "updated_at", "desc")


def test_get_with_friends_games_rejects_invalid_list_parameters():
    event = make_event()
    event["queryStringParameters"] = {"limit": "0"}

    response = handler.get_with_friends_games(event, MagicMock())

    assert response["statusCode"] == 400
    assert json.loads(response["body"])["code"] == "invalid_limit"


def test_get_with_friends_game_stats_returns_top_friends():
    stat = WithFriendsGameStatsRecord.model_validate(
        {"displayName": "Ada Lovelace", "wins": 3, "losses": 2}
    )

    with patch.object(
        handler._with_friends_games_service,
        "get_with_friends_game_stats",
        return_value=[stat],
    ) as get_with_friends_game_stats:
        response = handler.get_with_friends_game_stats(
            make_event(path="/api/v1/with-friends-games/stats"), MagicMock()
        )

    assert response["statusCode"] == 200
    assert json.loads(response["body"]) == [
        {"displayName": "Ada Lovelace", "wins": 3, "losses": 2}
    ]
    get_with_friends_game_stats.assert_called_once_with("user-123")
