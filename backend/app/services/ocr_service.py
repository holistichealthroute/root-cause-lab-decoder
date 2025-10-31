import os
from pathlib import Path
import re
import json
import base64
from typing import Dict, Optional, Tuple
from app.utils.constants import (
    CANONICAL_PANELS,
    MISTRAL_API_KEY,
    MISTRAL_API_URL,
    NUMERIC_PATTERN,
    UNIT_PATTERN,
)
import httpx

ALIASES_JSON_PATH = Path(__file__).resolve().parent.parent / "lab_test_aliases.json"


def normalize(s: Optional[str]) -> str:
    """Normalize string for matching."""
    if not s:
        return ""
    return re.sub(r"[^a-z0-9]", "", s.lower())


def load_aliases_map_and_units():
    """
    Load alias → canonical and canonical → allowed units maps from JSON file.
    """
    alias_map = {}
    canonical_units = {}

    if not os.path.exists(ALIASES_JSON_PATH):
        print(f"[WARN] Aliases file not found at {ALIASES_JSON_PATH}")
        return alias_map, canonical_units

    try:
        with open(ALIASES_JSON_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        for item in data.get("labTests", []):
            canonical = item.get("officialName")
            aliases = item.get("aliases", [])
            units = item.get("units", [])
            if not canonical:
                continue

            alias_map[normalize(canonical)] = canonical
            for alias in aliases:
                alias_map[normalize(alias)] = canonical

            # Map valid units for canonical
            canonical_units[canonical] = [u.strip() for u in units if u.strip()]

        print(
            f"[INFO] Loaded {len(alias_map)} aliases and {len(canonical_units)} canonical unit sets"
        )
        return alias_map, canonical_units
    except Exception as e:
        print(f"[ERROR] Failed to load aliases JSON: {e}")
        return alias_map, canonical_units


ALIASES_MAP, CANONICAL_UNITS = load_aliases_map_and_units()


def find_value_unit_near(text: str, keyword: str) -> Tuple[Optional[float], Optional[str]]:
    """Find nearest numeric and unit around a keyword in text."""
    pattern = re.compile(re.escape(keyword), re.IGNORECASE)
    matches = list(pattern.finditer(text))
    if not matches:
        return None, None

    match = matches[0]  # first occurrence
    start_idx = max(0, match.end())
    snippet = text[start_idx : start_idx + 100]

    val_match = re.search(NUMERIC_PATTERN, snippet)
    if not val_match:
        return None, None

    try:
        value = float(val_match.group())
    except ValueError:
        return None, None

    unit_match = re.search(UNIT_PATTERN, snippet[val_match.end() :])
    unit = unit_match.group().strip() if unit_match else None

    return value, unit


def validate_or_fill_unit(canonical: str, detected_unit: Optional[str]) -> Optional[str]:
    """
    Validate detected unit against known allowed units.
    - If valid → return normalized version
    - If invalid → return None
    - If missing but canonical has only one valid unit → auto-fill that one
    """
    allowed_units = CANONICAL_UNITS.get(canonical)
    if not allowed_units:
        return detected_unit  # No validation data available

    def normalize_unit(u):
        return re.sub(r"[^a-z0-9%µμ]", "", u.lower())

    if detected_unit:
        norm_detected = normalize_unit(detected_unit)
        for valid in allowed_units:
            if normalize_unit(valid) == norm_detected:
                return valid  # Keep properly formatted valid version
        return None  # Reject invalid unit

    # Auto-fill if exactly one valid unit
    if len(allowed_units) == 1:
        return allowed_units[0]

    return None


def build_empty_lab_reports() -> Dict:
    data = {}
    for panel, markers in CANONICAL_PANELS.items():
        data[panel] = {m: {"value": None, "unit": None} for m in markers}
    return data


async def call_mistral_ocr(file_bytes: bytes, mime_type: str) -> Dict:
    """Call Mistral OCR for PDF or document files."""
    b64data = base64.b64encode(file_bytes).decode("utf-8")
    payload = {
        "model": "mistral-ocr-latest",
        "document": {
            "type": "document_url",
            "document_url": f"data:{mime_type};base64,{b64data}",
        },
    }
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(MISTRAL_API_URL, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()


async def call_mistral_image_ocr(file_bytes: bytes, mime_type: str, filename: str = "upload.png") -> Dict:
    """Call Mistral OCR for image files (png, jpg, jpeg, webp)."""
    b64data = base64.b64encode(file_bytes).decode("utf-8")
    payload = {
        "model": "mistral-ocr-latest",
        "document": {
            "type": "image_url",
            "image_url": f"data:{mime_type};base64,{b64data}",
        },
        "include_image_base64": True,
    }
    headers = {"Authorization": f"Bearer {MISTRAL_API_KEY}", "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.post(MISTRAL_API_URL, json=payload, headers=headers)
        resp.raise_for_status()
        return resp.json()
