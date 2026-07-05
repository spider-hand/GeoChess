import json
from http import HTTPStatus
from typing import Any


def json_response(status_code: int, body: Any, headers: dict[str, str]):
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": json.dumps(body),
    }


def empty_response(status_code: int, headers: dict[str, str]):
    return {
        "statusCode": status_code,
        "headers": headers,
        "body": "",
    }


class ApiError(Exception):
    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


def error_response(status_code: int, code: str, message: str, headers: dict[str, str]):
    return json_response(
        status_code=status_code,
        body={
            "code": code,
            "message": message,
        },
        headers=headers,
    )


def parse_json_body(event: dict[str, Any]) -> dict[str, Any]:
    body = event.get("body")

    if body in (None, ""):
        return {}

    if isinstance(body, str):
        try:
            return json.loads(body)
        except json.JSONDecodeError as error:
            raise ApiError(
                status_code=HTTPStatus.BAD_REQUEST,
                code="invalid_request_body",
                message="Request body must be valid JSON.",
            ) from error

    if isinstance(body, dict):
        return body

    raise ApiError(
        status_code=HTTPStatus.BAD_REQUEST,
        code="invalid_request_body",
        message="Request body must be valid JSON.",
    )
