import json
from unittest.mock import MagicMock

from api.v1.health.handler import handler


def test_returns_200_with_alive_message():
    event = MagicMock()
    context = MagicMock()

    resp = handler(event, context)

    assert resp["statusCode"] == 200
    body = json.loads(resp["body"])
    assert body["message"] == "alive"
