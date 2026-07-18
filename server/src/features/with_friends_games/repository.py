from typing import Any

from core.db import get_connection
from features.with_friends_games.models import (
    WithFriendsGameRecord,
    WithFriendsGameResult,
)


def _map_with_friends_game_row(row: dict[str, Any]) -> WithFriendsGameRecord:
    return WithFriendsGameRecord.model_validate(
        {
            "id": row["id"],
            "player1UserId": row["player1_user_id"],
            "player2UserId": row["player2_user_id"],
            "result": row["result"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
    )


class WithFriendsGamesRepository:
    def get_by_id(self, game_id: str) -> WithFriendsGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, player1_user_id, player2_user_id, result, created_at, updated_at
                FROM with_friends_games
                WHERE id = %s
                """,
                (game_id,),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        return _map_with_friends_game_row(row)

    def create(self, game_id: str, player1_user_id: str) -> WithFriendsGameRecord:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO with_friends_games (id, player1_user_id)
                VALUES (%s, %s)
                RETURNING id, player1_user_id, player2_user_id, result, created_at, updated_at
                """,
                (game_id, player1_user_id),
            )
            row = cursor.fetchone()

        return _map_with_friends_game_row(row)

    def assign_player2(self, game_id: str, player2_user_id: str) -> bool:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE with_friends_games
                SET player2_user_id = %s,
                    updated_at = NOW()
                WHERE id = %s
                  AND player2_user_id IS NULL
                  AND result IS NULL
                """,
                (player2_user_id, game_id),
            )
            return cursor.rowcount == 1

    def finish_game(
        self,
        game_id: str,
        result: WithFriendsGameResult,
    ) -> bool:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE with_friends_games
                SET result = %s,
                    updated_at = NOW()
                WHERE id = %s
                  AND result IS NULL
                """,
                (result, game_id),
            )

            if cursor.rowcount != 1:
                return False

            return True

    def get_expired_game_ids(self) -> list[str]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("""
                SELECT id
                FROM with_friends_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                """)

            return [row["id"] for row in cursor.fetchall()]
