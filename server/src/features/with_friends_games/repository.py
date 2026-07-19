from typing import Any

from src.core.db import get_connection
from src.features.with_friends_games.models import (
    OrderBy,
    WithFriendsGameHistoryRecord,
    WithFriendsGameRecord,
    WithFriendsGameResult,
    WithFriendsGamesSortBy,
    WithFriendsGameStatsRecord,
)


def _map_with_friends_game_row(row: dict[str, Any]) -> WithFriendsGameRecord:
    return WithFriendsGameRecord.model_validate(
        {
            "id": row["id"],
            "player1UserId": row["player1_user_id"],
            "player2UserId": row["player2_user_id"],
            "result": row["result"],
            "expired": row.get("expired", False),
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
    )


class WithFriendsGamesRepository:
    def get_by_id(self, game_id: str) -> WithFriendsGameRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, player1_user_id, player2_user_id, result, expired, created_at, updated_at
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
                RETURNING id, player1_user_id, player2_user_id, result, expired, created_at, updated_at
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

    def list_for_user(
        self, user_id: str, limit: int, sort_by: WithFriendsGamesSortBy, order_by: OrderBy
    ) -> list[WithFriendsGameHistoryRecord]:
        sort_column = {"created_at": "game.created_at", "updated_at": "game.updated_at"}[sort_by]
        sort_direction = order_by.upper()

        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                f"""
                SELECT game.id,
                       COALESCE(opponent.display_name, 'Deleted User') AS opponent_display_name,
                       CASE
                           WHEN game.player1_user_id = %s AND game.result = 'player1_win' THEN 'win'
                           WHEN game.player2_user_id = %s AND game.result = 'player2_win' THEN 'win'
                           ELSE 'lose'
                       END AS result,
                       game.expired, game.created_at, game.updated_at
                FROM with_friends_games AS game
                LEFT JOIN users AS opponent
                    ON opponent.user_id = CASE
                        WHEN game.player1_user_id = %s THEN game.player2_user_id
                        ELSE game.player1_user_id
                    END
                WHERE (%s IN (game.player1_user_id, game.player2_user_id))
                  AND game.result IN ('player1_win', 'player2_win')
                ORDER BY {sort_column} {sort_direction}
                LIMIT %s
                """,
                (user_id, user_id, user_id, user_id, limit),
            )
            rows = cursor.fetchall()

        return [
            WithFriendsGameHistoryRecord.model_validate(
                {
                    "id": row["id"],
                    "opponentDisplayName": row["opponent_display_name"],
                    "result": row["result"],
                    "expired": row["expired"],
                    "createdAt": row["created_at"],
                    "updatedAt": row["updated_at"],
                }
            )
            for row in rows
        ]

    def get_stats_for_user(self, user_id: str) -> list[WithFriendsGameStatsRecord]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT COALESCE(opponent.display_name, 'Deleted User') AS display_name,
                       COUNT(*) FILTER (
                           WHERE (game.player1_user_id = %s AND game.result = 'player1_win')
                              OR (game.player2_user_id = %s AND game.result = 'player2_win')
                       ) AS wins,
                       COUNT(*) FILTER (
                           WHERE (game.player1_user_id = %s AND game.result = 'player2_win')
                              OR (game.player2_user_id = %s AND game.result = 'player1_win')
                       ) AS losses
                FROM with_friends_games AS game
                LEFT JOIN users AS opponent
                    ON opponent.user_id = CASE
                        WHEN game.player1_user_id = %s THEN game.player2_user_id
                        ELSE game.player1_user_id
                    END
                WHERE %s IN (game.player1_user_id, game.player2_user_id)
                  AND game.result IN ('player1_win', 'player2_win')
                GROUP BY opponent.user_id, opponent.display_name
                ORDER BY COUNT(*) DESC, display_name ASC
                LIMIT 3
                """,
                (user_id, user_id, user_id, user_id, user_id, user_id),
            )
            rows = cursor.fetchall()

        return [
            WithFriendsGameStatsRecord.model_validate(
                {
                    "displayName": row["display_name"],
                    "wins": row["wins"],
                    "losses": row["losses"],
                }
            )
            for row in rows
        ]

    def get_expired_game_ids(self) -> list[str]:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute("""
                SELECT id
                FROM with_friends_games
                WHERE created_at < NOW() - INTERVAL '30 days'
                  AND expired = FALSE
                """)

            return [row["id"] for row in cursor.fetchall()]

    def mark_expired(self, game_ids: list[str]) -> None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE with_friends_games
                SET expired = TRUE,
                    updated_at = NOW()
                WHERE id = ANY(%s)
                """,
                (game_ids,),
            )
