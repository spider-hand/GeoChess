from unittest.mock import MagicMock, patch

from features.ai_games.models import AiGameHistoryMoveRecord
from features.ai_games.repository import AiGamesRepository


def make_connection_and_cursor():
    connection = MagicMock()
    cursor = MagicMock()
    connection.cursor.return_value.__enter__.return_value = cursor
    connection.__enter__.return_value = connection
    return connection, cursor


def make_history_move(
    move_id="move-1",
    move_index=0,
    country="BB",
    actor="start",
    user_id=None,
):
    return AiGameHistoryMoveRecord.model_validate(
        {
            "id": move_id,
            "gameId": "game-123",
            "moveIndex": move_index,
            "country": country,
            "actor": actor,
            "userId": user_id,
        }
    )


def test_finish_game_updates_result_and_persists_history_once():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = {"user_id": "user-123", "difficulty": "medium"}
    history_moves = [
        make_history_move(),
        make_history_move(
            move_id="move-2",
            move_index=1,
            country="CC",
            actor="player",
            user_id="user-123",
        ),
    ]

    with patch("features.ai_games.repository.get_connection", return_value=connection):
        did_finish = AiGamesRepository().finish_game(
            "game-123",
            "win",
            history_moves,
        )

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
    cursor.executemany.assert_called_once_with(
        """
                    INSERT INTO ai_game_moves (id, game_id, move_index, country, actor, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
        [
            (
                move.id,
                move.game_id,
                move.move_index,
                move.country,
                move.actor,
                move.user_id,
            )
            for move in history_moves
        ],
    )


def test_finish_game_returns_false_when_game_was_already_finished():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = None

    with patch("features.ai_games.repository.get_connection", return_value=connection):
        did_finish = AiGamesRepository().finish_game(
            "game-123",
            "win",
            [make_history_move()],
        )

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


def test_finish_game_skips_user_stats_for_cancelled_games():
    connection, cursor = make_connection_and_cursor()
    cursor.fetchone.return_value = {"user_id": "user-123", "difficulty": "medium"}
    history_move = make_history_move()

    with patch("features.ai_games.repository.get_connection", return_value=connection):
        did_finish = AiGamesRepository().finish_game(
            "game-123",
            "cancelled",
            [history_move],
        )

    assert did_finish is True
    assert cursor.execute.call_count == 1
    cursor.executemany.assert_called_once_with(
        """
                    INSERT INTO ai_game_moves (id, game_id, move_index, country, actor, user_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    """,
        [
            (
                history_move.id,
                history_move.game_id,
                history_move.move_index,
                history_move.country,
                history_move.actor,
                history_move.user_id,
            )
        ],
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
