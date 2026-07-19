import json
from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.logger import dynamic_inject_lambda_context
from src.features.with_friends_games import WithFriendsGamesService

_with_friends_games_service = WithFriendsGamesService()


@dynamic_inject_lambda_context
def process_with_friends_game_timeout(
    event: dict[str, Any], context: LambdaContext
):
    for record in event.get("Records", []):
        message = json.loads(record["body"])
        _with_friends_games_service.process_with_friends_game_timeout(
            message["gameId"]
        )
