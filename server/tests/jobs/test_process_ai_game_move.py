import json
from unittest.mock import MagicMock, patch

from jobs import process_ai_game_move


def test_process_ai_game_move_invokes_service_for_each_record():
    event = {
        "Records": [
            {"body": json.dumps({"gameId": "game-123"})},
            {"body": json.dumps({"gameId": "game-456"})},
        ]
    }

    with patch.object(process_ai_game_move._ai_games_service, "process_ai_game_move") as process_move:
        process_ai_game_move.process_ai_game_move(event, MagicMock())

    assert process_move.call_count == 2
    process_move.assert_any_call("game-123")
    process_move.assert_any_call("game-456")
