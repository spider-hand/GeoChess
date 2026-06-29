from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Difficulty = Literal["easy", "medium", "hard"]
AiGameResult = Literal["win", "lose", "cancelled"]


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
