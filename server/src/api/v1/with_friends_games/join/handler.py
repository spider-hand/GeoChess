from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.api.v1.with_friends_games.handler import _handle_api_error
from src.core.auth import CORS_HEADERS, get_authorized_uid
from src.core.events import CustomApiGatewayEvent
from src.core.http import json_response, parse_json_body
from src.core.logger import dynamic_inject_lambda_context
from src.features.with_friends_games import WithFriendsGamesService

_with_friends_games_service = WithFriendsGamesService()


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def join_with_friends_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_id = _with_friends_games_service.join_with_friends_game(
            get_authorized_uid(event),
            parse_json_body(event),
        )
        return json_response(200, {"id": game_id}, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)
