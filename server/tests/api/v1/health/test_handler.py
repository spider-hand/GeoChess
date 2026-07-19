import json
from unittest.mock import MagicMock

from src.api.v1.health.handler import handler
from tests.factories.http_events import make_api_gateway_event


def test_returns_200_with_alive_message():
    event = make_api_gateway_event(
        route_key="GET /api/v1/health",
        raw_path="/api/v1/health",
        method="GET",
    )
    context = MagicMock()

    resp = handler(event, context)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["message"] == "alive"
