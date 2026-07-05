import random

from core.http import ApiError
from features.ai_games.models import RealtimeAiGameRecord


def _choose_random_move(realtime_ai_game: RealtimeAiGameRecord) -> str:
    if not realtime_ai_game.available_moves:
        raise ApiError(
            status_code=400,
            code="ai_move_not_available",
            message="AI move is not available.",
        )

    return random.choice(realtime_ai_game.available_moves)


def choose_ai_move(realtime_ai_game: RealtimeAiGameRecord) -> str:
    move_selectors = {
        "easy": _choose_random_move,
        "medium": _choose_random_move,
        "hard": _choose_random_move,
    }

    return move_selectors[realtime_ai_game.difficulty](realtime_ai_game)
