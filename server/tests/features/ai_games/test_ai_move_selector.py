import pytest

from core.http import ApiError
from features.ai_games.ai_move_selector import choose_ai_move
from features.ai_games.models import RealtimeAiGameRecord


def make_realtime_ai_game(
    difficulty: str, available_moves: list[str], used_countries: list[str] | None = None
):
    return RealtimeAiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": difficulty,
            "turn": "ai",
            "start": "AA",
            "country": "AA",
            "availableMoves": available_moves,
            "usedCountries": used_countries or ["AA"],
            "moves": {},
            "createdAt": 1751155200000,
            "updatedAt": 1751155200000,
        }
    )


def test_choose_ai_move_easy_returns_random_choice(monkeypatch: pytest.MonkeyPatch):
    game = make_realtime_ai_game("easy", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    def choose(values: list[str]) -> str:
        choice_calls.append(values)
        return values[-1]

    monkeypatch.setattr("features.ai_games.ai_move_selector.random.choice", choose)

    assert choose_ai_move(game) == "CC"
    assert choice_calls == [["BB", "CC"]]


def test_choose_ai_move_medium_prefers_immediate_winning_move(
    monkeypatch: pytest.MonkeyPatch,
):
    game = make_realtime_ai_game("medium", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries",
        lambda: {
            "AA": {"borders": ["BB", "CC"]},
            "BB": {"borders": ["AA"]},
            "CC": {"borders": ["AA", "DD"]},
            "DD": {"borders": ["CC"]},
        },
    )
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.random.choice",
        lambda values: choice_calls.append(values) or values[0],
    )

    assert choose_ai_move(game) == "BB"
    assert choice_calls == [["BB"]]


def test_choose_ai_move_medium_falls_back_to_random_when_no_winning_move(
    monkeypatch: pytest.MonkeyPatch,
):
    game = make_realtime_ai_game("medium", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries",
        lambda: {
            "AA": {"borders": ["BB", "CC"]},
            "BB": {"borders": ["AA", "DD"]},
            "CC": {"borders": ["AA", "EE"]},
            "DD": {"borders": ["BB"]},
            "EE": {"borders": ["CC"]},
        },
    )
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.random.choice",
        lambda values: choice_calls.append(values) or values[-1],
    )

    assert choose_ai_move(game) == "CC"
    assert choice_calls == [["BB", "CC"]]


def test_choose_ai_move_hard_prefers_immediate_winning_move(
    monkeypatch: pytest.MonkeyPatch,
):
    game = make_realtime_ai_game("hard", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries",
        lambda: {
            "AA": {"borders": ["BB", "CC"]},
            "BB": {"borders": ["AA"]},
            "CC": {"borders": ["AA", "DD"]},
            "DD": {"borders": ["CC"]},
        },
    )
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.random.choice",
        lambda values: choice_calls.append(values) or values[0],
    )

    assert choose_ai_move(game) == "BB"
    assert choice_calls == [["BB"]]


def test_choose_ai_move_hard_avoids_moves_with_immediate_losing_reply(
    monkeypatch: pytest.MonkeyPatch,
):
    game = make_realtime_ai_game("hard", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries",
        lambda: {
            "AA": {"borders": ["BB", "CC"]},
            "BB": {"borders": ["AA", "DD", "EE"]},
            "CC": {"borders": ["AA", "FF"]},
            "DD": {"borders": ["BB"]},
            "EE": {"borders": ["BB", "GG"]},
            "FF": {"borders": ["CC", "HH"]},
            "GG": {"borders": ["EE"]},
            "HH": {"borders": ["FF"]},
        },
    )
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.random.choice",
        lambda values: choice_calls.append(values) or values[0],
    )

    assert choose_ai_move(game) == "CC"
    assert choice_calls == [["CC"]]


def test_choose_ai_move_hard_prefers_safe_move_with_more_winning_replies(
    monkeypatch: pytest.MonkeyPatch,
):
    game = make_realtime_ai_game("hard", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries",
        lambda: {
            "AA": {"borders": ["BB", "CC"]},
            "BB": {"borders": ["AA", "DD", "EE"]},
            "CC": {"borders": ["AA", "FF", "GG"]},
            "DD": {"borders": ["BB", "HH"]},
            "EE": {"borders": ["BB", "II"]},
            "FF": {"borders": ["CC", "KK"]},
            "GG": {"borders": ["CC", "LL"]},
            "HH": {"borders": ["DD"]},
            "II": {"borders": ["EE"]},
            "KK": {"borders": ["FF"]},
            "LL": {"borders": ["GG", "MM"]},
            "MM": {"borders": ["LL"]},
        },
    )
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.random.choice",
        lambda values: choice_calls.append(values) or values[0],
    )

    assert choose_ai_move(game) == "BB"
    assert choice_calls == [["BB"]]


def test_choose_ai_move_hard_falls_back_to_random_when_all_moves_are_unsafe(
    monkeypatch: pytest.MonkeyPatch,
):
    game = make_realtime_ai_game("hard", ["BB", "CC"])
    choice_calls: list[list[str]] = []

    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries",
        lambda: {
            "AA": {"borders": ["BB", "CC"]},
            "BB": {"borders": ["AA", "DD"]},
            "CC": {"borders": ["AA", "EE"]},
            "DD": {"borders": ["BB"]},
            "EE": {"borders": ["CC"]},
        },
    )
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.random.choice",
        lambda values: choice_calls.append(values) or values[-1],
    )

    assert choose_ai_move(game) == "CC"
    assert choice_calls == [["BB", "CC"]]


@pytest.mark.parametrize("difficulty", ["easy", "medium", "hard"])
def test_choose_ai_move_raises_when_no_available_moves(
    monkeypatch: pytest.MonkeyPatch, difficulty: str
):
    game = make_realtime_ai_game(difficulty, [])
    monkeypatch.setattr(
        "features.ai_games.ai_move_selector.get_countries", lambda: {"AA": {"borders": []}}
    )

    with pytest.raises(ApiError) as error:
        choose_ai_move(game)

    assert error.value.status_code == 400
    assert error.value.code == "ai_move_not_available"
