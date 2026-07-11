from unittest.mock import MagicMock, patch

from features.ai_games.repository import AiGamesRepository


def make_connection_and_cursor():
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value.__enter__.return_value = cursor
    connection.__enter__.return_value = connection
    return connection, cursor

def test_finish_game_updates_result_and_updated_at():
    connection, cursor = make_connection_and_cursor()

    with patch("features.ai_games.repository.get_connection", return_value=connection):
        AiGamesRepository().finish_game("game-123", "win")

    cursor.execute.assert_called_once_with(
        """
                UPDATE ai_games
                SET result = %s,
                    updated_at = NOW()
                WHERE id = %s
                """,
        ("win", "game-123"),
    )


def test_delete_expired_games_uses_strict_30_day_cutoff():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchall.return_value = [
        {"id": "game-1"},
        {"id": "game-2"},
        {"id": "game-3"},
    ]

    with patch("features.ai_games.repository.get_connection", return_value=connection):
        deleted_ids = AiGamesRepository().delete_expired_games()

    assert deleted_ids == ["game-1", "game-2", "game-3"]
    cursor.execute.assert_called_once_with(
        """
                DELETE FROM ai_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                RETURNING id
                """
    )
