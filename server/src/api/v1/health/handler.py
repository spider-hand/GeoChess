import json

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from core.auth import CORS_HEADERS
from core.events import CustomApiGatewayEvent
from core.logger import dynamic_inject_lambda_context


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def handler(event: CustomApiGatewayEvent, context: LambdaContext):
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"message": "alive"}),
    }
