from unittest.mock import MagicMock, patch

from features.ai_games.repository import AiGamesRepository


def test_delete_expired_games_uses_strict_30_day_cutoff():
    connection = MagicMock()
    cursor = MagicMock()
    cursor.rowcount = 3
    connection.cursor.return_value.__enter__.return_value = cursor
    connection.__enter__.return_value = connection

    with patch("features.ai_games.repository.get_connection", return_value=connection):
        deleted_count = AiGamesRepository().delete_expired_games()

    assert deleted_count == 3
    cursor.execute.assert_called_once_with(
        """
                DELETE FROM ai_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                """
    )
