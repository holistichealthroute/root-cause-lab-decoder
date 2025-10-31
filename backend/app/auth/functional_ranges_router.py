from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from app.auth.schemas import FunctionalRangeIn
from app.services.user_service import get_current_user
from bson import ObjectId
from app.db import functional_ranges_collection

router = APIRouter(dependencies=[Depends(get_current_user)])

def functional_range_helper(doc):
    return {
        "id": str(doc["_id"]),
        "marker": doc.get("marker"),
        "gender": doc.get("gender"),
        "menstruation_status": doc.get("menstruation_status"),
        "functionalLow": doc.get("functionalLow"),
        "functionalHigh": doc.get("functionalHigh"),
        "measurementUnits": doc.get("measurementUnits"),
        "ifLow": doc.get("ifLow"),
        "ifHigh": doc.get("ifHigh"),
    }

# Get All Functional Ranges
@router.get("/")
async def get_all_functional_ranges():
    docs = await functional_ranges_collection.find().to_list(None)
    return [functional_range_helper(d) for d in docs]

# Get Single Functional Range by ID
@router.get("/{range_id}")
async def get_functional_range(range_id: str):
    doc = await functional_ranges_collection.find_one({"_id": ObjectId(range_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Functional range not found")
    return functional_range_helper(doc)

# Add New Functional Range
@router.post("/add")
async def add_functional_range(data: FunctionalRangeIn):
    new_doc = data.dict()
    result = await functional_ranges_collection.insert_one(new_doc)
    created = await functional_ranges_collection.find_one({"_id": result.inserted_id})
    return {"message": "Functional range added successfully", "id": str(result.inserted_id), "functional_range": functional_range_helper(created)}

# Update Existing Functional Range
@router.put("/update/{range_id}")
async def update_functional_range(range_id: str, data: FunctionalRangeIn):
    updated = await functional_ranges_collection.find_one_and_update(
        {"_id": ObjectId(range_id)},
        {"$set": data.dict(exclude_unset=True)},
        return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Functional range not found")
    return {"message": "Functional range updated successfully"}

# Delete Functional Range
@router.delete("/delete/{range_id}")
async def delete_functional_range(range_id: str, force: bool = False):
    """
    Deletes a functional range.
    If 'force' is False and supplements are linked, warn instead of deleting.
    """
    doc = await functional_ranges_collection.find_one({"_id": ObjectId(range_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Functional range not found")

    linked_supps = []
    if doc.get("ifLow", {}).get("supplements"):
        linked_supps.extend(doc["ifLow"]["supplements"])
    if doc.get("ifHigh", {}).get("supplements"):
        linked_supps.extend(doc["ifHigh"]["supplements"])

    if linked_supps and not force:
        raise HTTPException(
            status_code=400,
            detail=f"Functional range linked to supplements {linked_supps}. Use force=true to delete anyway."
        )

    await functional_ranges_collection.delete_one({"_id": ObjectId(range_id)})
    return {"status": "deleted", "id": range_id}
