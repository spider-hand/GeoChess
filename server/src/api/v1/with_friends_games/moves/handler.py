from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from api.v1.with_friends_games.handler import _get_game_id, _handle_api_error
from core.auth import CORS_HEADERS, get_authorized_uid
from core.events import CustomApiGatewayEvent
from core.http import empty_response, parse_json_body
from core.logger import dynamic_inject_lambda_context
from features.with_friends_games import WithFriendsGamesService

_with_friends_games_service = WithFriendsGamesService()


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_with_friends_game_move(
    event: CustomApiGatewayEvent, context: LambdaContext
):
    try:
        game_id = _get_game_id(event)
        _with_friends_games_service.create_with_friends_game_move(
            get_authorized_uid(event),
            game_id,
            parse_json_body(event),
        )
        return empty_response(202, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)
