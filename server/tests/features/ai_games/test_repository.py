from unittest.mock import MagicMock, patch

from src.features.ai_games.repository import AiGamesRepository


def make_connection_and_cursor():
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value.__enter__.return_value = cursor
    connection.__enter__.return_value = connection
    return connection, cursor


def test_finish_game_updates_result_and_user_stats_once():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = {"user_id": "user-123", "difficulty": "medium"}
    with patch("src.features.ai_games.repository.get_connection", return_value=connection):
        did_finish = AiGamesRepository().finish_game("game-123", "win")

    assert did_finish is True
    assert cursor.execute.call_args_list == [
        (
            (
                """
                UPDATE ai_games
                SET result = %s,
                    updated_at = NOW()
                WHERE id = %s
                  AND result IS NULL
                RETURNING user_id, difficulty
                """,
                ("win", "game-123"),
            ),
            {},
        ),
        (
            (
                """
                    UPDATE users
                    SET ai_easy_total_win = ai_easy_total_win + %s,
                        ai_easy_total_lose = ai_easy_total_lose + %s,
                        ai_medium_total_win = ai_medium_total_win + %s,
                        ai_medium_total_lose = ai_medium_total_lose + %s,
                        ai_hard_total_win = ai_hard_total_win + %s,
                        ai_hard_total_lose = ai_hard_total_lose + %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                    """,
                (0, 0, 1, 0, 0, 0, "user-123"),
            ),
            {},
        ),
    ]
    cursor.executemany.assert_not_called()


def test_finish_game_returns_false_when_game_was_already_finished():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = None

    with patch("src.features.ai_games.repository.get_connection", return_value=connection):
        did_finish = AiGamesRepository().finish_game("game-123", "win")

    assert did_finish is False
    cursor.execute.assert_called_once_with(
        """
                UPDATE ai_games
                SET result = %s,
                    updated_at = NOW()
                WHERE id = %s
                  AND result IS NULL
                RETURNING user_id, difficulty
                """,
        ("win", "game-123"),
    )


def test_create_inserts_ai_game():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = {
        "id": "game-123",
        "user_id": "user-123",
        "difficulty": "medium",
        "result": None,
        "created_at": "2026-07-19T00:00:00Z",
        "updated_at": "2026-07-19T00:00:00Z",
    }
    with patch("src.features.ai_games.repository.get_connection", return_value=connection):
        game = AiGamesRepository().create("game-123", "user-123", "medium")

    assert game.id == "game-123"
    assert cursor.execute.call_count == 1
    cursor.execute.assert_called_once_with(
        """
                INSERT INTO ai_games (id, user_id, difficulty)
                VALUES (%s, %s, %s)
                RETURNING id, user_id, difficulty, result, created_at, updated_at
                """,
        ("game-123", "user-123", "medium"),
    )


def test_delete_expired_games_uses_strict_30_day_cutoff():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchall.return_value = [
        {"id": "game-1"},
        {"id": "game-2"},
        {"id": "game-3"},
    ]

    with patch("src.features.ai_games.repository.get_connection", return_value=connection):
        deleted_ids = AiGamesRepository().delete_expired_games()

    assert deleted_ids == ["game-1", "game-2", "game-3"]
    cursor.execute.assert_called_once_with(
        """
                DELETE FROM ai_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                RETURNING id
                """
    )
