from http import HTTPStatus
from typing import Any

from core.http import ApiError
from core.secret import get_secrets

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}


def get_firebase_app():
    import firebase_admin
    from firebase_admin import credentials

    service_account = get_secrets()["firebase_service_account"]

    try:
        return firebase_admin.get_app()
    except ValueError:
        return firebase_admin.initialize_app(credentials.Certificate(service_account))


def verify_firebase_token(headers: dict[str, str] | None) -> dict[str, Any]:
    from firebase_admin import auth as firebase_auth

    authorization_header = None
    if headers:
        for key, value in headers.items():
            if key.lower() == "authorization":
                authorization_header = value
                break

    if authorization_header is None:
        raise ApiError(
            status_code=HTTPStatus.UNAUTHORIZED,
            code="authentication_required",
            message="Authorization header is required.",
        )

    scheme, _, token = authorization_header.partition(" ")
    if scheme != "Bearer" or not token:
        raise ApiError(
            status_code=HTTPStatus.UNAUTHORIZED,
            code="invalid_authorization_header",
            message="Authorization header must use the Bearer scheme.",
        )

    try:
        decoded_token = firebase_auth.verify_id_token(token, app=get_firebase_app())
    except Exception as error:
        raise ApiError(
            status_code=HTTPStatus.UNAUTHORIZED,
            code="invalid_authentication_token",
            message="Authentication token is invalid.",
        ) from error

    sign_in_provider = decoded_token.get("firebase", {}).get("sign_in_provider")
    if sign_in_provider == "anonymous":
        raise ApiError(
            status_code=HTTPStatus.UNAUTHORIZED,
            code="anonymous_user_not_allowed",
            message="Anonymous users cannot access this resource.",
        )

    return decoded_token


def verify_user_access(uid: str, expected_user_id: str) -> None:
    if uid != expected_user_id:
        raise ApiError(
            status_code=HTTPStatus.FORBIDDEN,
            code="forbidden",
            message="You do not have access to this resource.",
        )


def get_authorized_uid(event: dict[str, Any]) -> str:
    uid = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("lambda", {})
        .get("uid")
    )

    if not isinstance(uid, str) or not uid:
        raise RuntimeError("Missing authorizer context uid.")

    return uid


def lambda_handler(event: dict[str, Any], context: Any):
    try:
        decoded_token = verify_firebase_token(event.get("headers"))
    except ApiError:
        return {
            "isAuthorized": False,
        }

    return {
        "isAuthorized": True,
        "context": {
            "uid": decoded_token["uid"],
        },
    }
