from unittest.mock import MagicMock, patch

import pytest

from src.core.http import ApiError
from src.features.users.models import CurrentUserRecord, UserRecord
from src.features.users.service import UsersService


def make_user(display_name="Taylor Swift", country=None):
    return UserRecord.model_validate(
        {
            "userId": "user-123",
            "displayName": display_name,
            "country": country,
            "createdAt": "2026-06-28T00:00:00Z",
            "updatedAt": "2026-06-28T00:00:00Z",
        }
    )


def make_current_user():
    return CurrentUserRecord.model_validate(
        {
            "userId": "user-123",
            "displayName": "Taylor Swift",
            "aiEasyWins": 6,
            "aiEasyLosses": 1,
            "aiMediumWins": 4,
            "aiMediumLosses": 2,
            "aiHardWins": 2,
            "aiHardLosses": 1,
            "createdAt": "2026-06-28T00:00:00Z",
            "updatedAt": "2026-06-28T00:00:00Z",
        }
    )


def test_get_current_user_returns_ai_game_counters():
    users_repository = MagicMock()
    users_repository.get_current_by_id.return_value = make_current_user()
    service = UsersService(users_repository=users_repository)

    user = service.get_current_user("user-123")

    assert user.ai_easy_wins == 6
    assert user.ai_hard_losses == 1
    users_repository.get_current_by_id.assert_called_once_with("user-123")


def test_create_user_creates_country_when_provided():
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = None
    users_repository.create.return_value = make_user(country="JP")
    service = UsersService(users_repository=users_repository)

    user, status_code = service.create_user(
        "user-123",
        {"displayName": "Taylor Swift", "country": " jp "},
    )

    assert status_code == 201
    assert user.country == "JP"
    users_repository.create.assert_called_once_with(
        "user-123",
        "Taylor Swift",
        "JP",
    )


def test_create_user_returns_400_for_invalid_country():
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = None
    service = UsersService(users_repository=users_repository)

    with pytest.raises(ApiError) as error:
        service.create_user(
            "user-123",
            {"displayName": "Taylor Swift", "country": "JPN"},
        )

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"
    users_repository.create.assert_not_called()


def test_update_user_keeps_existing_country_when_omitted():
    existing_user = make_user(country="JP")
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = existing_user
    service = UsersService(users_repository=users_repository)

    updated_user = service.update_user(
        "user-123",
        {"displayName": "Taylor Swift"},
    )

    assert updated_user == existing_user
    users_repository.update.assert_not_called()


def test_update_user_updates_country_when_provided():
    existing_user = make_user(country="JP")
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = existing_user
    users_repository.update.return_value = make_user(country="US")
    service = UsersService(users_repository=users_repository)

    updated_user = service.update_user(
        "user-123",
        {"displayName": "Taylor Swift", "country": "us"},
    )

    assert updated_user.country == "US"
    users_repository.update.assert_called_once_with(
        "user-123",
        "Taylor Swift",
        "US",
    )


def test_delete_user_removes_the_postgresql_and_firebase_accounts():
    users_repository = MagicMock()
    service = UsersService(users_repository=users_repository)

    with (
        patch("src.features.users.service.get_firebase_app", return_value=MagicMock()),
        patch("firebase_admin.auth.delete_user") as delete_user,
    ):
        service.delete_user("user-123")

    users_repository.delete.assert_called_once_with("user-123")
    delete_user.assert_called_once()
