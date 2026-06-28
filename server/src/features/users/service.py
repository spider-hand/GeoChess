from http import HTTPStatus

from pydantic import ValidationError

from core.http import ApiError
from features.users.models import CreateUserInput, UpdateUserInput, UserRecord
from features.users.repository import UsersRepository


class UsersService:
    def __init__(self, users_repository: UsersRepository | None = None):
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
                message="displayName is required.",
            ) from error

        created_user = self.users_repository.create(user_id, create_user_input.display_name)
        return created_user, HTTPStatus.CREATED

    def update_user(self, user_id: str, payload: dict[str, object]) -> UserRecord:
        existing_user = self.get_user(user_id)

        try:
            update_user_input = UpdateUserInput.model_validate(payload)
        except ValidationError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="displayName is required.",
            ) from error

        if existing_user.display_name == update_user_input.display_name:
            return existing_user

        updated_user = self.users_repository.update_display_name(user_id, update_user_input.display_name)
        if updated_user is None:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )

        return updated_user

    def delete_user(self, user_id: str) -> None:
        deleted = self.users_repository.delete(user_id)
        if not deleted:
            raise ApiError(
                status_code=HTTPStatus.NOT_FOUND,
                code="user_not_found",
                message="User was not found.",
            )
