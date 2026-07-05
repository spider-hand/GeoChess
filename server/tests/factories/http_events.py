import json


def make_api_gateway_event(
    *,
    route_key: str,
    raw_path: str,
    method: str,
    body=None,
    serialize_body: bool = True,
    path_parameters: dict[str, str] | None = None,
    authenticated_uid: str | None = "user-123",
):
    authorizer = None
    if authenticated_uid is not None:
        authorizer = {"lambda": {"uid": authenticated_uid}}

    return {
        "version": "2.0",
        "routeKey": route_key,
        "rawPath": raw_path,
        "rawQueryString": "",
        "headers": {},
        "pathParameters": path_parameters,
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "authorizer": authorizer,
            "domainName": "example.com",
            "domainPrefix": "example",
            "http": {
                "method": method,
                "path": raw_path,
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest",
            },
            "requestId": "request-id",
            "routeKey": route_key,
            "stage": "$default",
            "time": "06/Jul/2026:00:00:00 +0000",
            "timeEpoch": 1783296000000,
        },
        "body": (
            json.dumps(body) if serialize_body and body is not None else body
        ),
    }


def make_authorizer_event(
    *,
    raw_path: str,
    route_key: str,
    method: str,
    authorization_header: str | None = "Bearer token",
):
    headers = {}
    if authorization_header is not None:
        headers["Authorization"] = authorization_header

    return {
        "version": "2.0",
        "type": "REQUEST",
        "routeArn": (
            "arn:aws:execute-api:ap-northeast-1:123456789012:"
            "api-id/$default/GET/api/v1/users/user-123"
        ),
        "routeKey": route_key,
        "headers": headers,
        "rawPath": raw_path,
        "rawQueryString": "",
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "domainName": "example.com",
            "domainPrefix": "example",
            "http": {
                "method": method,
                "path": raw_path,
                "protocol": "HTTP/1.1",
                "sourceIp": "127.0.0.1",
                "userAgent": "pytest",
            },
            "requestId": "request-id",
            "routeKey": route_key,
            "stage": "$default",
            "time": "06/Jul/2026:00:00:00 +0000",
            "timeEpoch": 1783296000000,
        },
    }
