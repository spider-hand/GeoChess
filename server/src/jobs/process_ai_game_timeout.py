import json
from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from core.logger import dynamic_inject_lambda_context
from features.ai_games import AiGamesService

_ai_games_service = AiGamesService()


@dynamic_inject_lambda_context
def process_ai_game_timeout(event: dict[str, Any], context: LambdaContext):
    for record in event.get("Records", []):
        message = json.loads(record["body"])
        _ai_games_service.process_ai_game_timeout(message["gameId"])
