from typing import Any

from aws_lambda_powertools.utilities.typing import LambdaContext

from src.core.logger import dynamic_inject_lambda_context, logger
from src.features.ai_games import AiGamesService

_ai_games_service = AiGamesService()


@dynamic_inject_lambda_context
def cleanup_expired_ai_games(event: dict[str, Any], context: LambdaContext):
    deleted_count = _ai_games_service.delete_expired_ai_games()
    logger.info("Deleted expired ai games.", extra={"deleted_count": deleted_count})
    return {"deletedCount": deleted_count}
