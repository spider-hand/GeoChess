from unittest.mock import MagicMock, patch

from src.jobs import cleanup_expired_with_friends_games


def test_cleanup_expired_with_friends_games_returns_deleted_count():
    with patch.object(
        cleanup_expired_with_friends_games._with_friends_games_service,
        "delete_expired_with_friends_games",
        return_value=2,
    ) as delete_expired_with_friends_games:
        result = cleanup_expired_with_friends_games.cleanup_expired_with_friends_games(
            {}, MagicMock()
        )

    delete_expired_with_friends_games.assert_called_once_with()
    assert result == {"deletedCount": 2}
