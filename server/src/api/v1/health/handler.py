import json

from aws_lambda_powertools.utilities.parser.models import APIGatewayProxyEventModel
from aws_lambda_powertools.utilities.typing import LambdaContext

from core.auth import CORS_HEADERS
from core.logger import dynamic_inject_lambda_context


@dynamic_inject_lambda_context
def handler(event: APIGatewayProxyEventModel, context: LambdaContext):
    return {
        "statusCode": 200,
        "headers": CORS_HEADERS,
        "body": json.dumps({"message": "alive"}),
    }
