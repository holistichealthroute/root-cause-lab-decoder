from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings
from app.utils import constants

client = AsyncIOMotorClient(settings.MONGO_URI)
db = client[constants.DB_NAME]
functional_ranges_collection = db["functional_ranges"]
supplements_collection = db["supplements"]
reports_collection = db["reports"]