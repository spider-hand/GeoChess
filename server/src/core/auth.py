from http import HTTPStatus
from typing import Any

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.events import CustomApiGatewayEvent, CustomAuthorizerEvent
from src.core.firebase import get_firebase_app
from src.core.http import ApiError

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
}


def verify_firebase_token(
    headers: dict[str, str] | None, *, allow_anonymous: bool = False
) -> dict[str, Any]:
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
    if sign_in_provider == "anonymous" and not allow_anonymous:
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


def get_authorized_uid(event: CustomApiGatewayEvent) -> str:
    uid = (
        event.requestContext.authorizer.lambda_.uid
        if event.requestContext.authorizer and event.requestContext.authorizer.lambda_
        else None
    )

    if not isinstance(uid, str) or not uid:
        raise RuntimeError("Missing authorizer context uid.")

    return uid


def _allow_anonymous_user(event: CustomAuthorizerEvent) -> bool:
    return event.rawPath == "/api/v1/ai-games" or event.rawPath.startswith(
        "/api/v1/ai-games/"
    )


@event_parser(model=CustomAuthorizerEvent)
def lambda_handler(event: CustomAuthorizerEvent, context: LambdaContext | Any):
    try:
        decoded_token = verify_firebase_token(
            event.headers,
            allow_anonymous=_allow_anonymous_user(event),
        )
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
