from aws_lambda_powertools.utilities.typing import LambdaContext

from api.v1.ai_games.handler import _get_game_id, _handle_api_error
from core.auth import CORS_HEADERS, get_authorized_uid
from core.http import empty_response, parse_json_body
from core.logger import dynamic_inject_lambda_context
from features.ai_games import AiGamesService

_ai_games_service = AiGamesService()


@dynamic_inject_lambda_context
def create_ai_game_move(event: dict, context: LambdaContext):
    try:
        game_id = _get_game_id(event)
        payload = parse_json_body(event)
        _ai_games_service.create_ai_game_move(get_authorized_uid(event), game_id, payload)
        return empty_response(202, CORS_HEADERS)
    except Exception as error:
        return _handle_api_error(error)
