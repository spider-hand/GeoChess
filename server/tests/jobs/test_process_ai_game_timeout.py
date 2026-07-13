import json
from unittest.mock import MagicMock, patch

from jobs import process_ai_game_timeout


def test_process_ai_game_timeout_invokes_service_for_each_record():
    event = {
        "Records": [
            {"body": json.dumps({"gameId": "game-123"})},
            {"body": json.dumps({"gameId": "game-456"})},
        ]
    }

    with patch.object(
        process_ai_game_timeout._ai_games_service, "process_ai_game_timeout"
    ) as process_timeout:
        process_ai_game_timeout.process_ai_game_timeout(event, MagicMock())

    assert process_timeout.call_count == 2
    process_timeout.assert_any_call("game-123")
    process_timeout.assert_any_call("game-456")
