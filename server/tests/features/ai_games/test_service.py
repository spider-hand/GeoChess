from unittest.mock import ANY, MagicMock

import pytest

from core.http import ApiError
from features.ai_games.models import AiGameRecord, RealtimeAiGameRecord
from features.ai_games.service import AiGamesService


def make_ai_game(user_id="user-123", result=None):
    return AiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": user_id,
            "difficulty": "medium",
            "result": result,
            "createdAt": "2026-06-29T00:00:00Z",
            "updatedAt": "2026-06-29T00:00:00Z",
        }
    )


def make_realtime_ai_game(turn="player", available_moves=None, moves=None):
    return RealtimeAiGameRecord.model_validate(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "turn": turn,
            "start": "BB",
            "country": "BB",
            "availableMoves": (
                available_moves if available_moves is not None else ["CC"]
            ),
            "usedCountries": ["BB"],
            "moves": moves or {},
            "createdAt": 1751155200000,
            "updatedAt": 1751155200000,
        }
    )


def test_create_ai_game_returns_400_for_invalid_payload():
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = MagicMock()
    service = AiGamesService(users_repository=users_repository)

    with pytest.raises(ApiError) as error:
        service.create_ai_game(
            "user-123", {"difficulty": "medium", "result": "cancelled"}
        )

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"
    users_repository.get_by_id.assert_not_called()
    users_repository.create.assert_not_called()


@pytest.mark.parametrize(
    ("stored_game", "test_id"),
    [
        pytest.param(None, "missing", id="missing"),
        pytest.param(make_ai_game(user_id="other-user"), "other-user", id="other-user"),
    ],
)
def test_create_ai_game_move_returns_404_for_missing_or_other_users_game(
    stored_game, test_id
):
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = stored_game
    service = AiGamesService(ai_games_repository=ai_games_repository)

    with pytest.raises(ApiError) as error:
        service.create_ai_game_move(
            "user-123",
            test_id,
            {"countryCode": "CC"},
        )

    assert error.value.status_code == 404
    assert error.value.code == "ai_game_not_found"


def test_create_ai_game_creates_guest_user_and_enqueues_when_ai_starts():
    ai_games_repository = MagicMock()
    ai_games_repository.create_after_cancelling_incomplete_games.return_value = (
        make_ai_game()
    )
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = None
    service = AiGamesService(
        ai_games_repository=ai_games_repository,
        users_repository=users_repository,
    )
    game_ref = MagicMock()

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_countries",
            lambda: {
                "BB": {"borders": ["CC", "DD"]},
                "CC": {"borders": ["BB"]},
                "DD": {"borders": ["BB"]},
            },
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_countries_with_borders",
            lambda: ("BB",),
        )
        choice_values = iter(["BB", "ai"])
        monkeypatch.setattr(
            "features.ai_games.service.random.choice",
            lambda values: next(choice_values),
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        enqueue_mock = MagicMock()
        monkeypatch.setattr(
            "features.ai_games.service.enqueue_ai_game_move", enqueue_mock
        )

        result, status_code = service.create_ai_game(
            "user-123", {"difficulty": "medium"}
        )

    assert status_code == 201
    assert result.turn == "ai"
    assert result.start == "BB"
    assert result.available_moves == ["CC", "DD"]
    assert result.moves == {}
    users_repository.create.assert_called_once_with("user-123", "Guest")
    ai_games_repository.create_after_cancelling_incomplete_games.assert_called_once_with(
        ANY, "user-123", "medium"
    )
    game_ref.set.assert_called_once_with(
        {
            "id": "game-123",
            "userId": "user-123",
            "difficulty": "medium",
            "turn": "ai",
            "start": "BB",
            "country": "BB",
            "availableMoves": ["CC", "DD"],
            "usedCountries": ["BB"],
            "moves": {},
            "createdAt": {".sv": "timestamp"},
            "updatedAt": {".sv": "timestamp"},
        }
    )
    enqueue_mock.assert_called_once_with("game-123")


def test_create_ai_game_skips_guest_creation_and_enqueue_when_player_starts():
    ai_games_repository = MagicMock()
    ai_games_repository.create_after_cancelling_incomplete_games.return_value = (
        make_ai_game()
    )
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = MagicMock()
    service = AiGamesService(
        ai_games_repository=ai_games_repository,
        users_repository=users_repository,
    )
    game_ref = MagicMock()

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_countries",
            lambda: {
                "BB": {"borders": ["CC", "DD"]},
                "CC": {"borders": ["BB"]},
                "DD": {"borders": ["BB"]},
            },
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_countries_with_borders",
            lambda: ("BB",),
        )
        choice_values = iter(["BB", "player"])
        monkeypatch.setattr(
            "features.ai_games.service.random.choice",
            lambda values: next(choice_values),
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        enqueue_mock = MagicMock()
        monkeypatch.setattr(
            "features.ai_games.service.enqueue_ai_game_move", enqueue_mock
        )

        result, status_code = service.create_ai_game(
            "user-123", {"difficulty": "medium"}
        )

    assert status_code == 201
    assert result.turn == "player"
    users_repository.create.assert_not_called()
    enqueue_mock.assert_not_called()


def test_create_ai_game_move_returns_400_for_invalid_payload():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)

    with pytest.raises(ApiError) as error:
        service.create_ai_game_move("user-123", "game-123", {})

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"


def test_create_ai_game_move_returns_404_when_realtime_game_is_missing():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(None)

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )

        with pytest.raises(ApiError) as error:
            service.create_ai_game_move(
                "user-123", "game-123", {"countryCode": "CC"}
            )

    assert error.value.status_code == 404
    assert error.value.code == "ai_game_not_found"


def test_create_ai_game_move_returns_400_when_it_is_not_players_turn():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(
        make_realtime_ai_game(turn="ai", available_moves=["CC"]).model_dump(
            by_alias=True, mode="json"
        )
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )

        with pytest.raises(ApiError) as error:
            service.create_ai_game_move(
                "user-123", "game-123", {"countryCode": "CC"}
            )

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"


def test_create_ai_game_move_returns_400_for_unavailable_country():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(
        make_realtime_ai_game(turn="player", available_moves=["DD"]).model_dump(
            by_alias=True, mode="json"
        )
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )

        with pytest.raises(ApiError) as error:
            service.create_ai_game_move(
                "user-123", "game-123", {"countryCode": "CC"}
            )

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"


def test_create_ai_game_move_enqueues_ai_for_non_terminal_player_move():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    updated_state = {}

    def transaction(callback):
        current = make_realtime_ai_game(
            turn="player", available_moves=["CC"]
        ).model_dump(by_alias=True, mode="json")
        updated_state["value"] = callback(current)

    game_ref.transaction.side_effect = transaction

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_countries",
            lambda: {
                "BB": {"borders": ["CC"]},
                "CC": {"borders": ["BB", "DD"]},
                "DD": {"borders": ["CC"]},
            },
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.ai_games.service.uuid4",
            lambda: MagicMock(hex="move-1"),
        )
        enqueue_mock = MagicMock()
        monkeypatch.setattr(
            "features.ai_games.service.enqueue_ai_game_move", enqueue_mock
        )

        service.create_ai_game_move("user-123", "game-123", {"countryCode": "CC"})

    assert updated_state["value"]["turn"] == "ai"
    assert updated_state["value"]["country"] == "CC"
    assert updated_state["value"]["availableMoves"] == ["DD"]
    assert updated_state["value"]["usedCountries"] == ["BB", "CC"]
    assert updated_state["value"]["moves"]["move-1"]["actor"] == "player"
    ai_games_repository.finish_game.assert_not_called()
    enqueue_mock.assert_called_once_with("game-123")


def test_create_ai_game_move_finishes_game_for_terminal_player_move():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(
        make_realtime_ai_game(turn="player", available_moves=["CC"]).model_dump(
            by_alias=True, mode="json"
        )
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_countries",
            lambda: {"BB": {"borders": ["CC"]}, "CC": {"borders": ["BB"]}},
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.ai_games.service.uuid4",
            lambda: MagicMock(hex="move-1"),
        )
        enqueue_mock = MagicMock()
        monkeypatch.setattr(
            "features.ai_games.service.enqueue_ai_game_move", enqueue_mock
        )

        service.create_ai_game_move("user-123", "game-123", {"countryCode": "CC"})

    ai_games_repository.finish_game.assert_called_once_with("game-123", "win")
    enqueue_mock.assert_not_called()


def test_timeout_ai_game_returns_400_when_it_is_not_players_turn():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(
        make_realtime_ai_game(turn="ai", available_moves=["CC"]).model_dump(
            by_alias=True, mode="json"
        )
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )

        with pytest.raises(ApiError) as error:
            service.timeout_ai_game("user-123", "game-123")

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"


def test_timeout_ai_game_returns_400_when_timeout_has_not_expired():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(
        make_realtime_ai_game(turn="player", available_moves=["CC"]).model_dump(
            by_alias=True, mode="json"
        )
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.ai_games.service.time",
            lambda: 1751155200 + 30,
        )

        with pytest.raises(ApiError) as error:
            service.timeout_ai_game("user-123", "game-123")

    assert error.value.status_code == 400
    assert error.value.code == "invalid_request_body"


def test_timeout_ai_game_marks_loss_after_expiry():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    updated_state = {}

    def transaction(callback):
        current = make_realtime_ai_game(
            turn="player", available_moves=["CC"]
        ).model_dump(by_alias=True, mode="json")
        updated_state["value"] = callback(current)

    game_ref.transaction.side_effect = transaction

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.ai_games.service.time",
            lambda: 1751155200 + 61,
        )

        service.timeout_ai_game("user-123", "game-123")

    assert updated_state["value"]["turn"] == "player"
    assert "availableMoves" not in updated_state["value"]
    ai_games_repository.finish_game.assert_called_once_with("game-123", "lose")


@pytest.mark.parametrize(
    "stored_game",
    [None, make_ai_game(result="win")],
    ids=["missing-game", "finished-game"],
)
def test_process_ai_game_move_returns_early_for_missing_or_finished_game(stored_game):
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = stored_game
    service = AiGamesService(ai_games_repository=ai_games_repository)

    service.process_ai_game_move("game-123")

    ai_games_repository.finish_game.assert_not_called()


@pytest.mark.parametrize(
    ("realtime_game", "test_id"),
    [
        pytest.param(None, "missing-realtime", id="missing-realtime"),
        pytest.param(
            make_realtime_ai_game(turn="player").model_dump(by_alias=True, mode="json"),
            "player-turn",
            id="player-turn",
        ),
    ],
)
def test_process_ai_game_move_leaves_state_unchanged_for_noop_branches(
    realtime_game, test_id
):
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    updated_state = {}

    def transaction(callback):
        updated_state["value"] = callback(realtime_game)

    game_ref.transaction.side_effect = transaction

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )

        service.process_ai_game_move(test_id)

    assert updated_state["value"] == realtime_game
    ai_games_repository.finish_game.assert_not_called()


def test_process_ai_game_move_applies_available_ai_move():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    updated_state = {}

    def transaction(callback):
        current = make_realtime_ai_game(turn="ai", available_moves=["CC"]).model_dump(
            by_alias=True, mode="json"
        )
        updated_state["value"] = callback(current)

    game_ref.transaction.side_effect = transaction

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_countries",
            lambda: {
                "BB": {"borders": ["CC"]},
                "CC": {"borders": ["BB", "DD"]},
                "DD": {"borders": ["CC"]},
            },
        )
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.ai_games.service.uuid4",
            lambda: MagicMock(hex="move-2"),
        )
        monkeypatch.setattr(
            "features.ai_games.service.choose_ai_move", lambda game: "CC"
        )

        service.process_ai_game_move("game-123")

    assert updated_state["value"]["turn"] == "player"
    assert updated_state["value"]["country"] == "CC"
    assert updated_state["value"]["moves"]["move-2"]["actor"] == "ai"
    ai_games_repository.finish_game.assert_not_called()


def test_process_ai_game_move_finishes_game_when_ai_has_no_available_moves():
    ai_games_repository = MagicMock()
    ai_games_repository.get_by_id.return_value = make_ai_game()
    service = AiGamesService(ai_games_repository=ai_games_repository)
    game_ref = MagicMock()
    game_ref.transaction.side_effect = lambda callback: callback(
        make_realtime_ai_game(turn="ai", available_moves=[]).model_dump(
            by_alias=True, mode="json"
        )
    )

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.ai_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.ai_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.ai_games.service.uuid4",
            lambda: MagicMock(hex="move-2"),
        )

        service.process_ai_game_move("game-123")
    ai_games_repository.finish_game.assert_called_once_with("game-123", "win")


def test_delete_expired_ai_games_returns_deleted_count():
    ai_games_repository = MagicMock()
    ai_games_repository.delete_expired_games.return_value = 5
    service = AiGamesService(ai_games_repository=ai_games_repository)

    deleted_count = service.delete_expired_ai_games()

    assert deleted_count == 5
    ai_games_repository.delete_expired_games.assert_called_once_with()
