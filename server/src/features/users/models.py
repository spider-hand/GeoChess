from datetime import datetime

from pydantic import BaseModel, BeforeValidator, ConfigDict, Field, StringConstraints
from typing_extensions import Annotated

DisplayName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1)]
CountryCode = Annotated[
    str,
    BeforeValidator(lambda value: value.strip().upper() if isinstance(value, str) else value),
    StringConstraints(min_length=2, max_length=2, pattern=r"^[A-Z]{2}$"),
]


class UserRecord(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId")
    display_name: str = Field(alias="displayName")
    country: CountryCode | None = None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CreateUserInput(BaseModel):
    display_name: DisplayName = Field(alias="displayName")
    country: CountryCode | None = None


class UpdateUserInput(BaseModel):
    display_name: DisplayName = Field(alias="displayName")
    country: CountryCode | None = None
