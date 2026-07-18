from http import HTTPStatus

from pydantic import ValidationError

from core.firebase import get_firebase_app
from core.http import ApiError
from features.users.models import (
    CreateUserInput,
    CurrentUserRecord,
    UpdateUserInput,
    UserRecord,
)
from features.users.repository import UsersRepository


class UsersService:
    def __init__(
        self,
        users_repository: UsersRepository | None = None,
    ):
        self.users_repository = users_repository or UsersRepository()

    def get_user(self, user_id: str) -> UserRecord:
        user = self.users_repository.get_by_id(user_id)
        if user is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )

        return user

    def get_current_user(self, user_id: str) -> CurrentUserRecord:
        user = self.users_repository.get_current_by_id(user_id)
        if user is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )

        return user

    def create_user(self, user_id: str, payload: dict[str, object]) -> tuple[UserRecord, int]:
        existing_user = self.users_repository.get_by_id(user_id)
        if existing_user is not None:
            return existing_user, HTTPStatus.OK

        try:
            create_user_input = CreateUserInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="displayName is required and country must be a 2-letter code when provided.",
            ) from error

        created_user = self.users_repository.create(
            user_id,
            create_user_input.display_name,
            create_user_input.country,
        )
        return created_user, HTTPStatus.CREATED

    def update_user(self, user_id: str, payload: dict[str, object]) -> UserRecord:
        existing_user = self.get_user(user_id)

        try:
            update_user_input = UpdateUserInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="displayName is required and country must be a 2-letter code when provided.",
            ) from error

        next_country = (
            update_user_input.country
            if "country" in update_user_input.model_fields_set
            else existing_user.country
        )

        if (
            existing_user.display_name == update_user_input.display_name
            and existing_user.country == next_country
        ):
            return existing_user

        updated_user = self.users_repository.update(
            user_id,
            update_user_input.display_name,
            next_country,
        )
        if updated_user is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )

        return updated_user

    def delete_user(self, user_id: str) -> None:
        from firebase_admin import auth as firebase_auth

        self.users_repository.delete(user_id)

        try:
            firebase_auth.delete_user(user_id, app=get_firebase_app())
        except firebase_auth.UserNotFoundError:
            pass
