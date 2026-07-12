from typing import Any

from core.db import get_connection
from features.ai_games.models import (
    AiGameHistoryMoveRecord,
    AiGameRecord,
    AiGameResult,
    Difficulty,
)


def _map_ai_game_row(row: dict[str, Any]) -> AiGameRecord:
    return AiGameRecord.model_validate(
        {
            "id": row["id"],
            "userId": row["user_id"],
            "difficulty": row["difficulty"],
            "result": row["result"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
    )


class AiGamesRepository:
    def get_by_id(self, game_id: str) -> AiGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, user_id, difficulty, result, created_at, updated_at
                FROM ai_games
                WHERE id = %s
                """,
                (game_id,),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        return _map_ai_game_row(row)

    def create_after_cancelling_incomplete_games(
        self, game_id: str, user_id: str, difficulty: Difficulty
    ) -> AiGameRecord:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_games
                SET result = %s,
                    updated_at = NOW()
                WHERE user_id = %s
                  AND result IS NULL
                """,
                ("cancelled", user_id),
            )
            cursor.execute(
                """
                INSERT INTO ai_games (id, user_id, difficulty)
                VALUES (%s, %s, %s)
                RETURNING id, user_id, difficulty, result, created_at, updated_at
                """,
                (game_id, user_id, difficulty),
            )
            row = cursor.fetchone()

        return _map_ai_game_row(row)

    def finish_game(
        self,
        game_id: str,
        result: AiGameResult,
        moves: list[AiGameHistoryMoveRecord] | None = None,
    ) -> bool:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE ai_games
                SET result = %s,
                    updated_at = NOW()
                WHERE id = %s
                  AND result IS NULL
                RETURNING user_id
                """,
                (result, game_id),
            )
            row = cursor.fetchone()

            if row is None:
                return False

            if moves:
                cursor.executemany(
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
                        for move in moves
                    ],
                )

            if result in ("win", "lose"):
                cursor.execute(
                    """
                    UPDATE users
                    SET ai_game_total_win = ai_game_total_win + %s,
                        ai_game_total_lose = ai_game_total_lose + %s,
                        updated_at = NOW()
                    WHERE user_id = %s
                    """,
                    (
                        1 if result == "win" else 0,
                        1 if result == "lose" else 0,
                        row["user_id"],
                    ),
                )

            return True

    def delete_expired_games(self) -> list[str]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("""
                DELETE FROM ai_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                RETURNING id
                """)

            return [row["id"] for row in cursor.fetchall()]
