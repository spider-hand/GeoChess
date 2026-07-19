import importlib
from unittest.mock import patch

from src.core import auth
from src.core.events import CustomApiGatewayEvent
from src.core.http import ApiError
from tests.factories.http_events import make_api_gateway_event, make_authorizer_event


def test_authorizer_module_imports_from_the_deployed_namespace():
    assert importlib.import_module("src.core.auth") is auth


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_returns_simple_allow_response(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    response = auth.lambda_handler(
        make_authorizer_event(
            route_key="GET /api/v1/users/{userId}",
            raw_path="/api/v1/users/user-123",
            method="GET",
        ),
        None,
    )

    assert response == {
        "isAuthorized": True,
        "context": {
            "uid": "user-123",
        },
    }


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_rejects_invalid_user(mock_verify_firebase_token):
    mock_verify_firebase_token.side_effect = ApiError(
        401,
        "authentication_required",
        "Authorization header is required.",
    )

    response = auth.lambda_handler(
        make_authorizer_event(
            route_key="GET /api/v1/users/{userId}",
            raw_path="/api/v1/users/user-123",
            method="GET",
            authorization_header=None,
        ),
        None,
    )

    assert response == {
        "isAuthorized": False,
    }


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_allows_anonymous_for_ai_games(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(
        make_authorizer_event(
            route_key="GET /api/v1/users/{userId}",
            raw_path="/api/v1/ai-games",
            method="GET",
        ),
        None,
    )

    mock_verify_firebase_token.assert_called_once_with(
        {"Authorization": "Bearer token"},
        allow_anonymous=True,
    )


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_allows_anonymous_for_ai_game_moves(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(
        make_authorizer_event(
            route_key="GET /api/v1/users/{userId}",
            raw_path="/api/v1/ai-games/game-123/moves",
            method="GET",
        ),
        None,
    )

    mock_verify_firebase_token.assert_called_once_with(
        {"Authorization": "Bearer token"},
        allow_anonymous=True,
    )


@patch("src.core.auth.verify_firebase_token")
def test_lambda_authorizer_disallows_anonymous_for_non_ai_games(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(
        make_authorizer_event(
            route_key="GET /api/v1/users/{userId}",
            raw_path="/api/v1/users/user-123",
            method="GET",
        ),
        None,
    )

    mock_verify_firebase_token.assert_called_once_with(
        {"Authorization": "Bearer token"},
        allow_anonymous=False,
    )


def test_get_authorized_uid_reads_lambda_authorizer_context():
    event = CustomApiGatewayEvent.model_validate(
        make_api_gateway_event(
            route_key="GET /api/v1/users/{userId}",
            raw_path="/api/v1/users/user-123",
            method="GET",
            path_parameters={"userId": "user-123"},
            authenticated_uid="user-123",
        )
    )

    assert auth.get_authorized_uid(event) == "user-123"
