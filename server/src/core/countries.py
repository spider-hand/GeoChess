import json
from functools import cache
from pathlib import Path


@cache
def get_countries():
    path = Path(__file__).parent.parent / "data" / "countries.json"

    return json.loads(path.read_text(encoding="utf-8"))
