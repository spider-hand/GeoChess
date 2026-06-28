from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, StringConstraints
from typing_extensions import Annotated

DisplayName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]


class UserRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId")
    display_name: str = Field(alias="displayName")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CreateUserInput(BaseModel):
    display_name: DisplayName = Field(alias="displayName")


class UpdateUserInput(BaseModel):
    display_name: DisplayName = Field(alias="displayName")
