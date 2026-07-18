from unittest.mock import MagicMock, patch

from features.with_friends_games.repository import WithFriendsGamesRepository


def make_connection_and_cursor():
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value.__enter__.return_value = cursor
    connection.__enter__.return_value = connection
    return connection, cursor


def test_get_expired_game_ids_uses_strict_30_day_cutoff():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchall.return_value = [
        {"id": "game-1"},
        {"id": "game-2"},
    ]

    with patch(
        "features.with_friends_games.repository.get_connection", return_value=connection
    ):
        expired_game_ids = WithFriendsGamesRepository().get_expired_game_ids()

    assert expired_game_ids == ["game-1", "game-2"]
    cursor.execute.assert_called_once_with(
        """
                SELECT id
                FROM with_friends_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                """
    )


def test_create_does_not_persist_a_room_key():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = {
        "id": "game-1",
        "player1_user_id": "user-1",
        "player2_user_id": None,
        "result": None,
        "created_at": "2026-07-18T00:00:00Z",
        "updated_at": "2026-07-18T00:00:00Z",
    }

    with patch(
        "features.with_friends_games.repository.get_connection", return_value=connection
    ):
        game = WithFriendsGamesRepository().create("game-1", "user-1")

    assert game.id == "game-1"
    cursor.execute.assert_called_once_with(
        """
                INSERT INTO with_friends_games (id, player1_user_id)
                VALUES (%s, %s)
                RETURNING id, player1_user_id, player2_user_id, result, created_at, updated_at
                """,
        ("game-1", "user-1"),
    )
