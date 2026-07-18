from unittest.mock import ANY, MagicMock

import pytest

from core.http import ApiError
from features.with_friends_games.models import (
    RealtimeWithFriendsGameRecord,
    WithFriendsGameRecord,
)
from features.with_friends_games.service import WithFriendsGamesService


def make_with_friends_game(
    player1_user_id="user-123", player2_user_id=None, result=None
):
    return WithFriendsGameRecord.model_validate(
        {
            "id": "game-123",
            "player1UserId": player1_user_id,
            "player2UserId": player2_user_id,
            "result": result,
            "createdAt": "2026-07-13T00:00:00Z",
            "updatedAt": "2026-07-13T00:00:00Z",
        }
    )


def make_realtime_with_friends_game(
    *,
    status="active",
    turn="player1",
    available_moves=None,
    moves=None,
):
    return RealtimeWithFriendsGameRecord.model_validate(
        {
            "id": "game-123",
            "roomKey": "654321",
            "player1UserId": "user-123",
            "player2UserId": "user-456",
            "participants": {
                "player1": "user-123",
                "player2": "user-456",
            },
            "status": status,
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


def test_create_with_friends_game_returns_404_for_missing_user():
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = None
    service = WithFriendsGamesService(users_repository=users_repository)

    with pytest.raises(ApiError) as error:
        service.create_with_friends_game("user-123")

    assert error.value.status_code == 404
    assert error.value.code == "user_not_found"


def test_create_with_friends_game_creates_realtime_record():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.create.return_value = make_with_friends_game()
    users_repository = MagicMock()
    users_repository.get_by_id.return_value = MagicMock()
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository,
        users_repository=users_repository,
    )
    game_ref = MagicMock()
    with_friends_games_ref = MagicMock()
    with_friends_games_ref.child.return_value = game_ref
    room_key_ref = MagicMock()
    room_key_ref.transaction.side_effect = lambda callback: callback(None)
    room_keys_ref = MagicMock()
    room_keys_ref.child.return_value = room_key_ref

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_countries",
            lambda: {
                "BB": {"borders": ["CC", "DD"]},
                "CC": {"borders": ["BB"]},
                "DD": {"borders": ["BB"]},
            },
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.get_countries_with_borders",
            lambda: ("BB",),
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.random.choice",
            lambda values: "BB",
        )
        monkeypatch.setattr(service, "_generate_room_key", lambda: "654321")
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: {
                "withFriendsGames": with_friends_games_ref,
                "withFriendsGameRoomKeys": room_keys_ref,
            }[path],
        )

        result, room_key, status_code = service.create_with_friends_game("user-123")

    assert status_code == 201
    assert room_key == "654321"
    with_friends_games_repository.create.assert_called_once_with(ANY, "user-123")
    room_key_ref.transaction.assert_called_once()
    game_ref.set.assert_called_once_with(
        {
            "id": "game-123",
            "roomKey": "654321",
            "player1UserId": "user-123",
            "participants": {
                "player1": "user-123",
            },
            "status": "waiting",
            "turn": "player1",
            "start": "BB",
            "country": "BB",
            "availableMoves": ["CC", "DD"],
            "usedCountries": ["BB"],
            "moves": {},
            "createdAt": {".sv": "timestamp"},
            "updatedAt": {".sv": "timestamp"},
        }
    )


def test_join_with_friends_game_returns_existing_game_for_participant():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.get_by_id.return_value = make_with_friends_game()
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository
    )
    room_key_ref = MagicMock()
    room_key_ref.get.return_value = "game-123"
    room_keys_ref = MagicMock()
    room_keys_ref.child.return_value = room_key_ref

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: room_keys_ref,
        )

        game_id = service.join_with_friends_game("user-123", {"roomKey": "654321"})

    assert game_id == "game-123"
    with_friends_games_repository.get_by_id.assert_called_once_with("game-123")
    with_friends_games_repository.assign_player2.assert_not_called()


def test_join_with_friends_game_returns_404_for_missing_room_key():
    service = WithFriendsGamesService(with_friends_games_repository=MagicMock())
    room_key_ref = MagicMock()
    room_key_ref.get.return_value = None
    room_keys_ref = MagicMock()
    room_keys_ref.child.return_value = room_key_ref

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: room_keys_ref,
        )

        with pytest.raises(ApiError) as error:
            service.join_with_friends_game("user-123", {"roomKey": "654321"})

    assert error.value.status_code == 404
    assert error.value.code == "with_friends_game_not_found"


def test_join_with_friends_game_assigns_player2_and_enqueues_start():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.get_by_id.return_value = make_with_friends_game()
    with_friends_games_repository.assign_player2.return_value = True
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository
    )
    game_ref = MagicMock()
    with_friends_games_ref = MagicMock()
    with_friends_games_ref.child.return_value = game_ref
    room_key_ref = MagicMock()
    room_key_ref.get.return_value = "game-123"
    room_keys_ref = MagicMock()
    room_keys_ref.child.return_value = room_key_ref
    updated_state = {}

    def transaction(callback):
        current = make_realtime_with_friends_game(status="waiting").model_dump(
            by_alias=True, mode="json"
        )
        del current["player2UserId"]
        updated_state["value"] = callback(current)

    game_ref.transaction.side_effect = transaction

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: {
                "withFriendsGames": with_friends_games_ref,
                "withFriendsGameRoomKeys": room_keys_ref,
            }[path],
        )
        enqueue_mock = MagicMock()
        monkeypatch.setattr(
            "features.with_friends_games.service.enqueue_with_friends_game_start",
            enqueue_mock,
        )

        game_id = service.join_with_friends_game("user-456", {"roomKey": "654321"})

    assert game_id == "game-123"
    assert updated_state["value"]["player2UserId"] == "user-456"
    assert updated_state["value"]["status"] == "starting"
    enqueue_mock.assert_called_once_with("game-123")


def test_create_with_friends_game_retries_when_room_key_is_taken():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.create.return_value = make_with_friends_game()
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository
    )
    room_key_ref = MagicMock()
    room_key_ref.transaction.side_effect = ["other-game", "game-123"]
    room_keys_ref = MagicMock()
    room_keys_ref.child.return_value = room_key_ref

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: room_keys_ref,
        )
        monkeypatch.setattr(
            service, "_generate_room_key", MagicMock(side_effect=["111111", "222222"])
        )

        _, room_key = service._create_room("user-123")

    assert room_key == "222222"
    assert room_keys_ref.child.call_args_list == [
        (("111111",),),
        (("222222",),),
    ]


def test_create_with_friends_game_move_enqueues_timeout_for_non_terminal_move():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.get_by_id.return_value = make_with_friends_game(
        player2_user_id="user-456"
    )
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository
    )
    game_ref = MagicMock()
    updated_state = {}

    def transaction(callback):
        current = make_realtime_with_friends_game(
            status="active", turn="player1", available_moves=["CC"]
        ).model_dump(by_alias=True, mode="json")
        updated_state["value"] = callback(current)

    game_ref.transaction.side_effect = transaction

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_countries",
            lambda: {
                "BB": {"borders": ["CC"]},
                "CC": {"borders": ["BB", "DD"]},
                "DD": {"borders": ["CC"]},
            },
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: MagicMock(child=lambda game_id: game_ref),
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.uuid4",
            lambda: MagicMock(hex="move-1"),
        )
        enqueue_mock = MagicMock()
        monkeypatch.setattr(
            "features.with_friends_games.service.enqueue_with_friends_game_timeout",
            enqueue_mock,
        )

        service.create_with_friends_game_move(
            "user-123", "game-123", {"countryCode": "CC"}
        )

    assert updated_state["value"]["turn"] == "player2"
    assert updated_state["value"]["country"] == "CC"
    assert updated_state["value"]["availableMoves"] == ["DD"]
    assert updated_state["value"]["moves"]["move-1"]["actor"] == "player1"
    enqueue_mock.assert_called_once_with("game-123")


def test_delete_expired_with_friends_games_removes_only_realtime_records():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.get_expired_game_ids.return_value = [
        "game-1",
        "game-2",
    ]
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository
    )
    room_keys_ref = MagicMock()
    room_keys_ref.get.return_value = {"111111": "game-1", "222222": "other-game"}
    root_ref = MagicMock()

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: {
                "withFriendsGameRoomKeys": room_keys_ref,
                "/": root_ref,
            }[path],
        )

        deleted_count = service.delete_expired_with_friends_games()

    assert deleted_count == 2
    with_friends_games_repository.get_expired_game_ids.assert_called_once_with()
    root_ref.update.assert_called_once_with(
        {
            "withFriendsGames/game-1": None,
            "withFriendsGames/game-2": None,
            "withFriendsGameRoomKeys/111111": None,
        }
    )


def test_delete_expired_with_friends_games_skips_realtime_delete_when_nothing_was_deleted():
    with_friends_games_repository = MagicMock()
    with_friends_games_repository.get_expired_game_ids.return_value = []
    service = WithFriendsGamesService(
        with_friends_games_repository=with_friends_games_repository
    )
    room_keys_ref = MagicMock()
    root_ref = MagicMock()

    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setattr(
            "features.with_friends_games.service.get_firebase_app", lambda: MagicMock()
        )
        monkeypatch.setattr(
            "features.with_friends_games.service.firebase_db.reference",
            lambda path, app: {
                "withFriendsGameRoomKeys": room_keys_ref,
                "/": root_ref,
            }[path],
        )

        deleted_count = service.delete_expired_with_friends_games()

    assert deleted_count == 0
    with_friends_games_repository.get_expired_game_ids.assert_called_once_with()
    room_keys_ref.get.assert_not_called()
    root_ref.update.assert_not_called()
