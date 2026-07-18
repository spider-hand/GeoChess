from http import HTTPStatus

from aws_lambda_powertools.utilities.parser import event_parser
from aws_lambda_powertools.utilities.typing import LambdaContext

from core.auth import CORS_HEADERS, get_authorized_uid
from core.events import CustomApiGatewayEvent
from core.http import ApiError, error_response, json_response, parse_list_query_parameters
from core.logger import dynamic_inject_lambda_context
from features.with_friends_games import WithFriendsGamesService

_with_friends_games_service = WithFriendsGamesService()


def _get_game_id(event: CustomApiGatewayEvent) -> str:
    game_id = (event.pathParameters or {}).get("gameId")

    if not game_id:
        raise ApiError(
            status_code=HTTPStatus.BAD_REQUEST,
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
def create_with_friends_game(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        with_friends_game, room_key, status_code = (
            _with_friends_games_service.create_with_friends_game(
                get_authorized_uid(event)
            )
        )

        return json_response(
            status_code,
            {
                "id": with_friends_game.id,
                "roomKey": room_key,
            },
            CORS_HEADERS,
        )
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_with_friends_games(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        limit, sort_by, order_by = parse_list_query_parameters(event)
        games = _with_friends_games_service.get_with_friends_games(
            get_authorized_uid(event), limit, sort_by, order_by
        )
        return json_response(
            200,
            [game.model_dump(by_alias=True, mode="json") for game in games],
            CORS_HEADERS,
        )
    except Exception as error:
        return _handle_api_error(error)


@dynamic_inject_lambda_context
@event_parser(model=CustomApiGatewayEvent)
def get_with_friends_game_stats(event: CustomApiGatewayEvent, context: LambdaContext):
    try:
        stats = _with_friends_games_service.get_with_friends_game_stats(
            get_authorized_uid(event)
        )
        return json_response(
            200,
            [friend.model_dump(by_alias=True, mode="json") for friend in stats],
            CORS_HEADERS,
        )
    except Exception as error:
        return _handle_api_error(error)
