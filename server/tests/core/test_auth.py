from unittest.mock import patch

from core import auth
from core.http import ApiError


def make_authorizer_event(
    authorization_header: str | None = "Bearer token",
    raw_path: str = "/api/v1/users/user-123",
):
    headers = {}
    if authorization_header is not None:
        headers["Authorization"] = authorization_header

    return {
        "headers": headers,
        "rawPath": raw_path,
    }


@patch("core.auth.verify_firebase_token")
def test_lambda_authorizer_returns_simple_allow_response(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    response = auth.lambda_handler(make_authorizer_event(), None)

    assert response == {
        "isAuthorized": True,
        "context": {
            "uid": "user-123",
        },
    }


@patch("core.auth.verify_firebase_token")
def test_lambda_authorizer_rejects_invalid_user(mock_verify_firebase_token):
    mock_verify_firebase_token.side_effect = ApiError(
        401,
        "authentication_required",
        "Authorization header is required.",
    )

    response = auth.lambda_handler(make_authorizer_event(None), None)

    assert response == {
        "isAuthorized": False,
    }


@patch("core.auth.verify_firebase_token")
def test_lambda_authorizer_allows_anonymous_for_ai_games(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(make_authorizer_event(raw_path="/api/v1/ai-games"), None)

    mock_verify_firebase_token.assert_called_once_with(
        {"Authorization": "Bearer token"},
        allow_anonymous=True,
    )


@patch("core.auth.verify_firebase_token")
def test_lambda_authorizer_allows_anonymous_for_ai_game_moves(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(make_authorizer_event(raw_path="/api/v1/ai-games/game-123/moves"), None)

    mock_verify_firebase_token.assert_called_once_with(
        {"Authorization": "Bearer token"},
        allow_anonymous=True,
    )


@patch("core.auth.verify_firebase_token")
def test_lambda_authorizer_disallows_anonymous_for_non_ai_games(mock_verify_firebase_token):
    mock_verify_firebase_token.return_value = {"uid": "user-123"}

    auth.lambda_handler(make_authorizer_event(raw_path="/api/v1/users/user-123"), None)

    mock_verify_firebase_token.assert_called_once_with(
        {"Authorization": "Bearer token"},
        allow_anonymous=False,
    )
