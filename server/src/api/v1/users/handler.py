from http import HTTPStatus

from aws_lambda_powertools.utilities.typing import LambdaContext

from core.auth import CORS_HEADERS, get_authorized_uid, verify_user_access
from core.http import (
    ApiError,
    empty_response,
    error_response,
    json_response,
    parse_json_body,
)
from core.logger import dynamic_inject_lambda_context
from features.users import UsersService

_users_service = UsersService()


def _get_user_id(event: dict) -> str:
    user_id = (event.get("pathParameters") or {}).get("userId")

    if not user_id:
        raise ApiError(
            status_code=HTTPStatus.BAD_REQUEST,
            code="missing_user_id",
            message="Path parameter 'userId' is required.",
        )

    return user_id


def _handle_api_error(error: Exception):
    if isinstance(error, ApiError):
        return error_response(
            error.status_code, error.code, error.message, CORS_HEADERS
        )

    raise error


@dynamic_inject_lambda_context
def get_user(event: dict, context: LambdaContext):
    try:
        user_id = _get_user_id(event)
        verify_user_access(get_authorized_uid(event), user_id)

        user = _users_service.get_user(user_id)
        return json_response(
            HTTPStatus.OK, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS
        )
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
def create_user(event: dict, context: LambdaContext):
    try:
        user_id = _get_user_id(event)
        verify_user_access(get_authorized_uid(event), user_id)
        payload = parse_json_body(event)
        user, status_code = _users_service.create_user(user_id, payload)
        return json_response(
            status_code, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS
        )
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
def update_user(event: dict, context: LambdaContext):
    try:
        user_id = _get_user_id(event)
        verify_user_access(get_authorized_uid(event), user_id)
        payload = parse_json_body(event)
        user = _users_service.update_user(user_id, payload)
        return json_response(
            HTTPStatus.OK, user.model_dump(by_alias=True, mode="json"), CORS_HEADERS
        )
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
def delete_user(event: dict, context: LambdaContext):
    try:
        user_id = _get_user_id(event)
        verify_user_access(get_authorized_uid(event), user_id)
        _users_service.delete_user(user_id)
        return empty_response(HTTPStatus.NO_CONTENT, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)
