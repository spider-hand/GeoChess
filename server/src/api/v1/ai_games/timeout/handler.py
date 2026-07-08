from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from api.v1.ai_games.handler import _get_game_id, _handle_api_error
from core.auth import CORS_HEADERS, get_authorized_uid
from core.events import CustomApiGatewayEvent
from core.http import empty_response
from core.logger import dynamic_inject_lambda_context
from features.ai_games import AiGamesService

_ai_games_service = AiGamesService()


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def timeout_ai_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        game_id = _get_game_id(event)
        _ai_games_service.timeout_ai_game(get_authorized_uid(event), game_id)
        return empty_response(204, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)
