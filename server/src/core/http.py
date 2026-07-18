import json
from http import HTTPStatus
from typing import Any

from core.events import CustomApiGatewayEvent


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


def parse_json_body(event: CustomApiGatewayEvent) -> dict[str, Any]:
    body = event.body

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


def parse_list_query_parameters(event: CustomApiGatewayEvent) -> tuple[int, str, str]:
    parameters = event.queryStringParameters or {}
    try:
        limit = int(parameters.get("limit", "20"))
    except ValueError as error:
        raise ApiError(400, "invalid_limit", "limit must be an integer between 1 and 100.") from error
    sort_by = parameters.get("sort_by", "updated_at")
    order_by = parameters.get("order_by", "desc")
    if not 1 <= limit <= 100:
        raise ApiError(400, "invalid_limit", "limit must be an integer between 1 and 100.")
    if sort_by not in ("created_at", "updated_at"):
        raise ApiError(400, "invalid_sort_by", "sort_by must be created_at or updated_at.")
    if order_by not in ("asc", "desc"):
        raise ApiError(400, "invalid_order_by", "order_by must be asc or desc.")
    return limit, sort_by, order_by
