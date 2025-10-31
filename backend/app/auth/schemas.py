from typing import Dict, Optional, List
from pydantic import BaseModel, EmailStr, Field

class SignupRequest(BaseModel):
    email: EmailStr
    password: str
    name: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserModel(BaseModel):
    email: EmailStr
    name: str
    id: str
    is_admin:int=0
    
class TokenResponse(BaseModel):
    access_token: str
    refresh_token:str
    token_type: str = "bearer"
    user: UserModel

class OkResponse(BaseModel):
    ok: bool = True

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6, max_length=128)

class Marker(BaseModel):
    value: float
    unit: str

class ReportRequest(BaseModel):
    user_id: str
    age_over_18: bool
    bloodwork_within_6_months: bool
    gender: str
    gender_at_birth: str
    pregnant_or_nursing: bool
    menstruation_status: str #None, not_menstruating, Menstruating
    bowel_movements: str
    lab_upload_option: str
    lab_reports: Dict[str, Dict[str, Marker]]

class SupplementModel(BaseModel):
    name: str
    productLink: Optional[str] = None
    dosage: Optional[str] = None
    description: Optional[str] = None
    is_active: bool = True

class RangeCondition(BaseModel):
    directive: Optional[str]
    supplements: Optional[List[str]]

class FunctionalRangeIn(BaseModel):
    marker: str 
    gender: Optional[str] = "Both" # Female 
    menstruation_status: Optional[str] = "None" # None, not_menstruating, Menstruating
    functionalLow: Optional[float]
    functionalHigh: Optional[float]
    measurementUnits: Optional[str]
    ifLow: Optional[RangeCondition]
    ifHigh: Optional[RangeCondition]


