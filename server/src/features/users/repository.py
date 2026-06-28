from typing import Any

from core.db import get_connection
from features.users.models import UserRecord


def _map_user_row(row: dict[str, Any]) -> UserRecord:
    return UserRecord.model_validate(
        {
            "userId": row["user_id"],
            "displayName": row["display_name"],
            "createdAt": row["created_at"],
            "updatedAt": row["updated_at"],
        }
    )


class UsersRepository:
    def get_by_id(self, user_id: str) -> UserRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT user_id, display_name, created_at, updated_at
                FROM users
                WHERE user_id = %s
                """,
                (user_id,),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        return _map_user_row(row)

    def create(self, user_id: str, display_name: str) -> UserRecord:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO users (user_id, display_name)
                VALUES (%s, %s)
                RETURNING user_id, display_name, created_at, updated_at
                """,
                (user_id, display_name),
            )
            row = cursor.fetchone()

        return _map_user_row(row)

    def update_display_name(self, user_id: str, display_name: str) -> UserRecord | None:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE users
                SET display_name = %s,
                    updated_at = NOW()
                WHERE user_id = %s
                RETURNING user_id, display_name, created_at, updated_at
                """,
                (display_name, user_id),
            )
            row = cursor.fetchone()

        if row is None:
            return None

        return _map_user_row(row)

    def delete(self, user_id: str) -> bool:
        with get_connection() as connection, connection.cursor() as cursor:
            cursor.execute(
                """
                DELETE FROM users
                WHERE user_id = %s
                """,
                (user_id,),
            )

            deleted_count = cursor.rowcount

        return deleted_count > 0
