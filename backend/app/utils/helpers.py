import re
import html
from typing import Any

def sanitize_string(value: str, max_length: int = 1000) -> str:
    if not isinstance(value, str):
        return str(value)[:max_length]
    return html.escape(value.strip())[:max_length]

def safe_int(value: Any, default: int = 0) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return default

def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(str(value).replace(',', ''))
    except (TypeError, ValueError):
        return default
