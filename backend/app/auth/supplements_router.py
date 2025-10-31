from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from app.auth.schemas import SupplementModel
from app.services.user_service import get_current_user
from bson import ObjectId
from app.db import supplements_collection, functional_ranges_collection

router = APIRouter(dependencies=[Depends(get_current_user)])

def supplement_helper(supplement) -> dict:
    return {
        "id": str(supplement["_id"]),
        "name": supplement["name"],
        "productLink": supplement.get("productLink"),
        "dosage": supplement.get("dosage"),
        "description": supplement.get("description"),
        "is_active": supplement.get("is_active", True),
    }

# Get Active Supplements
@router.get("/active")
async def get_active_supplements(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    supplements = await supplements_collection.find(query).to_list(None)
    return [supplement_helper(s) for s in supplements]

# Get All Supplements
@router.get("/")
async def get_all_supplements():
    supplements = await supplements_collection.find().to_list(None)
    return [supplement_helper(s) for s in supplements]

# Get Single Supplement by ID
@router.get("/{supplement_id}")
async def get_supplement(supplement_id: str):
    supplement = await supplements_collection.find_one({"_id": supplement_id})
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")
    return supplement_helper(supplement)

# Add New Supplement
@router.post("/add_supplement")
async def add_supplement(data: SupplementModel):
    new_supp = data.dict()
    new_supp["_id"] = f"supplement_{ObjectId()}"  
    await supplements_collection.insert_one(new_supp)
    return {"message": "Supplement added successfully", "id": new_supp["_id"]}

# Update Existing Supplement
@router.put("/update/{supplement_id}")
async def update_supplement(supplement_id: str, data: SupplementModel):
    update_data = {k: v for k, v in data.dict().items() if v is not None}
    result = await supplements_collection.update_one(
        {"_id": supplement_id},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplement not found")
    return {"message": "Supplement updated successfully"}

@router.delete("/delete/{supplement_id}")
async def delete_supplement(supplement_id: str):
    # 1️Check if supplement exists
    supplement = await supplements_collection.find_one({"_id": supplement_id})
    if not supplement:
        raise HTTPException(status_code=404, detail="Supplement not found")

    # Deactivate the supplement
    await supplements_collection.update_one(
        {"_id": supplement_id},
        {"$set": {"is_active": False}}
    )

    # Remove supplement reference from functional ranges
    await functional_ranges_collection.update_many(
        {"ifLow.supplements": supplement_id},
        {"$pull": {"ifLow.supplements": supplement_id}}
    )
    await functional_ranges_collection.update_many(
        {"ifHigh.supplements": supplement_id},
        {"$pull": {"ifHigh.supplements": supplement_id}}
    )

    return {
        "message": "Supplement deactivated and references removed from functional ranges."
    }

