import json
from functools import cache
from pathlib import Path


@cache
def get_countries():
    path = Path(__file__).parent.parent / "data" / "countries.json"

    return json.loads(path.read_text(encoding="utf-8"))


@cache
def get_countries_with_borders() -> tuple[str, ...]:
    countries = get_countries()

    return tuple(
        country_code
        for country_code, country in countries.items()
        if country.get("borders")
    )
