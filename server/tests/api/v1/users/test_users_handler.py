import json
from unittest.mock import MagicMock, patch

from api.v1.users import handler
from core.http import ApiError
from features.users.models import UserRecord
from tests.factories.http_events import make_api_gateway_event


def make_event(body=None, user_id="user-123", authenticated_uid="user-123"):
    return make_api_gateway_event(
        route_key="GET /api/v1/users/{userId}",
        raw_path=f"/api/v1/users/{user_id}",
        method="GET",
        body=body,
        path_parameters={"userId": user_id},
        authenticated_uid=authenticated_uid,
    )


def make_user(display_name="Taylor Swift"):
    return UserRecord.model_validate(
        {
            "userId": "user-123",
            "displayName": display_name,
            "createdAt": "2026-06-28T00:00:00Z",
            "updatedAt": "2026-06-28T00:00:00Z",
        }
    )


def test_get_user_returns_200_for_owner():
    with patch.object(handler._users_service, "get_user", return_value=make_user()):
        response = handler.get_user(make_event(), MagicMock())

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["userId"] == "user-123"


def test_create_user_returns_existing_row_without_validating_body():
    with patch.object(handler._users_service, "create_user", return_value=(make_user(), 200)):
        response = handler.create_user(make_event(body={}), MagicMock())

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["displayName"] == "Taylor Swift"


def test_create_user_returns_201_for_new_user():
    with patch.object(handler._users_service, "create_user", return_value=(make_user(), 201)):
        response = handler.create_user(
            make_event(body={"displayName": "Taylor Swift"}),
            MagicMock(),
        )

    assert response["statusCode"] == 201
    body = json.loads(response["body"])
    assert body["displayName"] == "Taylor Swift"


def test_create_user_returns_400_when_new_user_payload_is_invalid():
    with patch.object(
        handler._users_service,
        "create_user",
        side_effect=ApiError(400, "invalid_request_body", "displayName is required."),
    ):
        response = handler.create_user(make_event(body={}), MagicMock())

    assert response["statusCode"] == 400
    body = json.loads(response["body"])
    assert body["code"] == "invalid_request_body"


def test_update_user_returns_existing_row_for_no_op():
    existing_user = make_user()

    with patch.object(handler._users_service, "update_user", return_value=existing_user):
        response = handler.update_user(
            make_event(body={"displayName": "Taylor Swift"}),
            MagicMock(),
        )

    assert response["statusCode"] == 200
    body = json.loads(response["body"])
    assert body["updatedAt"] == "2026-06-28T00:00:00Z"


def test_delete_user_returns_404_when_missing():
    with patch.object(
        handler._users_service,
        "delete_user",
        side_effect=ApiError(404, "user_not_found", "User was not found."),
    ):
        response = handler.delete_user(make_event(), MagicMock())

    assert response["statusCode"] == 404
    body = json.loads(response["body"])
    assert body["code"] == "user_not_found"


def test_handler_returns_403_when_authorized_uid_targets_different_user():
    response = handler.get_user(
        make_event(user_id="other-user", authenticated_uid="user-123"),
        MagicMock(),
    )

    assert response["statusCode"] == 403
    body = json.loads(response["body"])
    assert body["code"] == "forbidden"


def test_handler_returns_500_when_authorizer_context_uid_is_missing():
    try:
        handler.get_user(
            make_api_gateway_event(
                route_key="GET /api/v1/users/{userId}",
                raw_path="/api/v1/users/user-123",
                method="GET",
                path_parameters={"userId": "user-123"},
                authenticated_uid=None,
            ),
            MagicMock(),
        )
    except RuntimeError as error:
        assert str(error) == "Missing authorizer context uid."
    else:
        raise AssertionError("Expected RuntimeError to be raised.")
