from unittest.mock import MagicMock, patch

from features.with_friends_games.repository import WithFriendsGamesRepository


def make_connection_and_cursor():
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value.__enter__.return_value = cursor
    connection.__enter__.return_value = connection
    return connection, cursor


def test_delete_expired_games_uses_strict_30_day_cutoff():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchall.return_value = [
        {"id": "game-1"},
        {"id": "game-2"},
    ]

    with patch(
        "features.with_friends_games.repository.get_connection", return_value=connection
    ):
        deleted_ids = WithFriendsGamesRepository().delete_expired_games()

    assert deleted_ids == ["game-1", "game-2"]
    cursor.execute.assert_called_once_with(
        """
                DELETE FROM with_friends_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                RETURNING id
                """
    )
