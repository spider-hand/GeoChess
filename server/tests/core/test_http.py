import pytest

from core.events import CustomApiGatewayEvent
from core.http import ApiError, parse_json_body
from tests.factories.http_events import make_api_gateway_event


def make_event(body):
    return CustomApiGatewayEvent.model_validate(
        make_api_gateway_event(
            route_key="POST /api/v1/users/{userId}",
            raw_path="/api/v1/users/user-123",
            method="POST",
            body=body,
            serialize_body=False,
            path_parameters={"userId": "user-123"},
            authenticated_uid="user-123",
        )
    )


def test_parse_json_body_returns_empty_dict_for_none():
    assert parse_json_body(make_event(None)) == {}


def test_parse_json_body_returns_empty_dict_for_empty_string():
    assert parse_json_body(make_event("")) == {}


def test_parse_json_body_parses_json_string():
    assert parse_json_body(make_event('{"displayName":"Taylor Swift"}')) == {
        "displayName": "Taylor Swift"
    }


def test_parse_json_body_returns_dict_body_as_is():
    assert parse_json_body(make_event({"displayName": "Taylor Swift"})) == {
        "displayName": "Taylor Swift"
    }


def test_parse_json_body_raises_for_invalid_json():
    with pytest.raises(ApiError) as error:
        parse_json_body(make_event("{"))

    assert error.value.code == "invalid_request_body"
