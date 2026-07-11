import random

from core.countries import get_countries
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


def _compute_next_available_moves(
    country_code: str, used_countries: list[str]
) -> list[str]:
    countries = get_countries()
    used_country_codes = set(used_countries)

    return [
        border_code
        for border_code in countries[country_code]["borders"]
        if border_code not in used_country_codes
    ]


def _find_winning_moves(realtime_ai_game: RealtimeAiGameRecord) -> list[str]:
    winning_moves = []

    for country_code in realtime_ai_game.available_moves:
        player_available_moves = _compute_next_available_moves(
            country_code, [*realtime_ai_game.used_countries, country_code]
        )
        if not player_available_moves:
            winning_moves.append(country_code)

    return winning_moves


def _is_safe_move(country_code: str, used_countries: list[str]) -> bool:
    """
    Return True if the player doesn't have a next move that can make the AI lose immediately.
    """
    player_available_moves = _compute_next_available_moves(country_code, used_countries)

    return all(
        _compute_next_available_moves(player_move, [*used_countries, player_move])
        for player_move in player_available_moves
    )


def _count_trap_moves(country_code: str, used_countries: list[str]) -> int:
    """
    Count the player's next moves that AI can punish with an immediate win.
    """
    player_available_moves = _compute_next_available_moves(country_code, used_countries)

    return sum(
        any(
            not _compute_next_available_moves(ai_move, [*used_countries, player_move, ai_move])
            for ai_move in _compute_next_available_moves(
                player_move, [*used_countries, player_move]
            )
        )
        for player_move in player_available_moves
    )


def _choose_medium_move(realtime_ai_game: RealtimeAiGameRecord) -> str:
    """
    Prioritize a move that makes the player lose immediately.
    Otherwise, choose the next move randomly.
    """
    if not realtime_ai_game.available_moves:
        raise ApiError(
            status_code=400,
            code="ai_move_not_available",
            message="AI move is not available.",
        )

    winning_moves = _find_winning_moves(realtime_ai_game)
    if winning_moves:
        return random.choice(winning_moves)

    return random.choice(realtime_ai_game.available_moves)


def _choose_hard_move(realtime_ai_game: RealtimeAiGameRecord) -> str:
    """
    Prioritize a move that makes the player lose immediately.
    Otherwise, avoid moves that let the player make AI lose immediately.
    Among safe moves, prefer one that can lead the player to a losing move next turn.
    """
    if not realtime_ai_game.available_moves:
        raise ApiError(
            status_code=400,
            code="ai_move_not_available",
            message="AI move is not available.",
        )

    winning_moves = _find_winning_moves(realtime_ai_game)
    if winning_moves:
        return random.choice(winning_moves)

    safe_moves_with_scores: list[tuple[str, int]] = []
    for country_code in realtime_ai_game.available_moves:
        used_countries = [*realtime_ai_game.used_countries, country_code]
        if _is_safe_move(country_code, used_countries):
            safe_moves_with_scores.append(
                (country_code, _count_trap_moves(country_code, used_countries))
            )

    if safe_moves_with_scores:
        max_trap_move_count = max(score for _, score in safe_moves_with_scores)
        best_safe_moves = [
            country_code
            for country_code, score in safe_moves_with_scores
            if score == max_trap_move_count
        ]
        return random.choice(best_safe_moves)

    return random.choice(realtime_ai_game.available_moves)


def choose_ai_move(realtime_ai_game: RealtimeAiGameRecord) -> str:
    move_selectors = {
        "easy": _choose_random_move,
        "medium": _choose_medium_move,
        "hard": _choose_hard_move,
    }

    return move_selectors[realtime_ai_game.difficulty](realtime_ai_game)
