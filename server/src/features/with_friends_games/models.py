from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from typing_extensions import Annotated

RoomKey = Annotated[str, StringConstraints(pattern=r"^\d{6}$")]
WithFriendsGameResult = Literal["player1_win", "player2_win", "cancelled"]
WithFriendsGameStatus = Literal["waiting", "starting", "active", "finished"]
WithFriendsGameTurn = Literal["player1", "player2"]
WithFriendsGameMoveActor = Literal["player1", "player2"]
WithFriendsGameHistoryMoveActor = Literal["start", "player1", "player2"]


class WithFriendsGameRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    room_key: RoomKey = Field(alias="roomKey")
    player1_user_id: str = Field(alias="player1UserId")
    player2_user_id: str | None = Field(alias="player2UserId", default=None)
    result: WithFriendsGameResult | None = None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CreateWithFriendsGameJoinInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    room_key: RoomKey = Field(alias="roomKey")


class CreateWithFriendsGameMoveInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    country_code: str = Field(alias="countryCode")


class RealtimeWithFriendsGameMoveRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    country: str
    actor: WithFriendsGameMoveActor
    created_at: int = Field(alias="createdAt")


class RealtimeWithFriendsGameRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    room_key: RoomKey | None = Field(alias="roomKey", default=None)
    player1_user_id: str = Field(alias="player1UserId")
    player2_user_id: str | None = Field(alias="player2UserId", default=None)
    participants: dict[WithFriendsGameTurn, str]
    status: WithFriendsGameStatus
    turn: WithFriendsGameTurn
    start: str
    country: str
    available_moves: list[str] = Field(alias="availableMoves", default_factory=list)
    used_countries: list[str] = Field(alias="usedCountries")
    moves: dict[str, RealtimeWithFriendsGameMoveRecord] = Field(default_factory=dict)
    created_at: int = Field(alias="createdAt")
    updated_at: int = Field(alias="updatedAt")


class WithFriendsGameHistoryMoveRecord(BaseModel):
    id: str
    game_id: str = Field(alias="gameId")
    move_index: int = Field(alias="moveIndex")
    country: str
    actor: WithFriendsGameHistoryMoveActor
    user_id: str | None = Field(alias="userId", default=None)
