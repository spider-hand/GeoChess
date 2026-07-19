from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Difficulty = Literal["easy", "medium", "hard"]
AiGameResult = Literal["win", "lose"]
AiGameTurn = Literal["player", "ai"]
AiGameMoveActor = Literal["player", "ai"]
AiGamesSortBy = Literal["created_at", "updated_at"]
OrderBy = Literal["asc", "desc"]


class AiGameRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    user_id: str = Field(alias="userId")
    difficulty: Difficulty
    result: AiGameResult | None = None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CreateAiGameInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    difficulty: Difficulty


class CreateAiGameMoveInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    country_code: str = Field(alias="countryCode")


class RealtimeAiGameMoveRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    country: str
    actor: AiGameMoveActor
    created_at: int = Field(alias="createdAt")


class RealtimeAiGameRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    user_id: str = Field(alias="userId")
    difficulty: Difficulty
    turn: AiGameTurn
    start: str
    country: str
    available_moves: list[str] = Field(alias="availableMoves", default_factory=list)
    used_countries: list[str] = Field(alias="usedCountries")
    moves: dict[str, RealtimeAiGameMoveRecord] = Field(default_factory=dict)
    created_at: int = Field(alias="createdAt")
    updated_at: int = Field(alias="updatedAt")
