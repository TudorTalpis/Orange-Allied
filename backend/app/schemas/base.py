from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class CamelModel(BaseModel):
    """Base schema: Python fields stay snake_case, JSON in/out uses camelCase.

    Matches the frontend's TypeScript API types (fullName, accessToken, ...).
    """

    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True,
    )
