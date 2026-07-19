from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.auth import CORS_HEADERS, get_authorized_uid
from src.core.events import CustomApiGatewayEvent
from src.core.http import (
    ApiError,
    error_response,
    json_response,
    parse_json_body,
    parse_list_query_parameters,
)
from src.core.logger import dynamic_inject_lambda_context
from src.features.ai_games import AiGamesService

_ai_games_service = AiGamesService()


def _get_game_id(event: CustomApiGatewayEvent) -> str:
    game_id = (event.pathParameters or {}).get("gameId")

    if not game_id:
        raise ApiError(
            status_code=400,
            code="missing_game_id",
            message="Path parameter 'gameId' is required.",
        )

    return game_id


def _handle_api_error(error: Exception):
    if isinstance(error, ApiError):
        return error_response(
            error.status_code, error.code, error.message, CORS_HEADERS
        )

    raise error


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def create_ai_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        payload = parse_json_body(event)
        ai_game, status_code = _ai_games_service.create_ai_game(get_authorized_uid(event), payload)

        return json_response(
            status_code, ai_game.model_dump(by_alias=True, mode="json"), CORS_HEADERS
        )
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_ai_games(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        limit, sort_by, order_by = parse_list_query_parameters(event)
        ai_games = _ai_games_service.get_ai_games(
            get_authorized_uid(event), limit, sort_by, order_by
        )
        return json_response(
            200,
            [ai_game.model_dump(by_alias=True, mode="json") for ai_game in ai_games],
            CORS_HEADERS,
        )
    except Exception as error:
        return _handle_api_error(error)
