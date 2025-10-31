from fastapi import APIRouter, UploadFile, File, HTTPException
import re
from typing import List

from fastapi.params import Depends
from app.services.ocr_service import (
    ALIASES_MAP,
    build_empty_lab_reports,
    call_mistral_ocr,
    call_mistral_image_ocr,
    find_value_unit_near,
    validate_or_fill_unit, 
)
from app.utils.constants import CANONICAL_PANELS
from app.services.user_service import get_current_user

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/extract")
async def extract_lab_report(files: List[UploadFile] = File(...)):
    """Upload PDFs or images → Extract markers using Mistral OCR."""
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    full_text = ""
    lab_reports = build_empty_lab_reports()
    found_results = {}

    for file in files:
        filename = file.filename.lower()
        content = await file.read()

        mime = None
        if filename.endswith(".pdf"):
            mime = "application/pdf"
        elif filename.endswith((".png", ".jpg", ".jpeg", ".webp")):
            mime = f"image/{filename.split('.')[-1]}"
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type: {filename}")

        try:
            if mime.startswith("application"):
                ocr_data = await call_mistral_ocr(content, mime)
            else:
                ocr_data = await call_mistral_image_ocr(content, mime, filename)

            pages = ocr_data.get("pages", [])
            for page in pages:
                text = page.get("text") or page.get("markdown", "")
                full_text += "\n" + text
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"OCR processing failed for {filename}: {e}")

    # Extract markers and validated units
    for alias, canonical in ALIASES_MAP.items():
        if canonical in found_results:
            continue
        if re.search(re.escape(alias), full_text, re.IGNORECASE):
            val, unit = find_value_unit_near(full_text, alias)
            unit = validate_or_fill_unit(canonical, unit)
            found_results[canonical] = {"value": val, "unit": unit}

    # Build final structure
    for panel, markers in CANONICAL_PANELS.items():
        for m in markers:
            data = found_results.get(m) or {"value": None, "unit": None}
            lab_reports[panel][m] = data

    return {
        "success": True,
        "lab_reports": lab_reports,
        "metadata": {
            "files_processed": len(files),
            "aliases_loaded": len(ALIASES_MAP),
            "total_text_length": len(full_text),
        },
    }
