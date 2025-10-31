

# Database
import os
import re
import dotenv

dotenv.load_dotenv()

DB_NAME = "bloodwork_ai"

# JWT Auth
JWT_SECRET = "supersecretchangeit"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60
REFRESH_TOKEN_EXPIRE_MINUTES:int = 300
# Roles
ROLE_ADMIN = "admin"
ROLE_USER = "user"

# Messages
WELCOME_MESSAGE = "Welcome to Bloodwork AI"

ENV_FILE = ".env"

RESET_HTML_TEMPLATE = "password_reset.html"
RESET_TEXT_TEMPLATE = "password_reset.txt"

CANONICAL_PANELS = {
    "CBC_with_Differential": [
        "WBC", "RBC", "Hemoglobin", "Hematocrit", "MCV", "MCH", "MCHC", "RDW",
        "Platelets", "Neutrophils", "Lymphocytes", "Monocytes", "Eosinophils", "Basophils"
    ],
    "CMP_14": [
        "Glucose", "Calcium", "Sodium", "Potassium", "Chloride", "CO2", "BUN", "Creatinine",
        "Total_Protein", "Albumin", "Globulin", "Total_Bilirubin", "Alkaline_Phosphatase", "AST_SGOT", "ALT_SGPT"
    ],
    "Lipid_Panel": ["Total_Cholesterol", "Triglycerides", "HDL", "LDL"],
    "Thyroid_Profile_II": ["TSH", "Free_T4", "Free_T3", "Reverse_T3", "T3", "T4", "Anti_TPO"],
    "Vitamin_D_25_Hydroxy": ["25_Hydroxy_Vitamin_D"],
    "Iron_Panel": ["Iron", "TIBC", "Ferritin"],
    "Magnesium": ["Magnesium"],
    "HbA1c": ["Hemoglobin_A1c"]
}

ALL_CANONICAL_MARKERS = {m for lst in CANONICAL_PANELS.values() for m in lst}

NUMERIC_PATTERN = r"[-+]?\d*\.?\d+"
UNIT_PATTERN = r"[a-zA-Z%µμ×\d\^\-/]+"

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
# if not MISTRAL_API_KEY:
#     raise RuntimeError("Please set MISTRAL_API_KEY in environment variables")

MISTRAL_API_URL = "https://api.mistral.ai/v1/ocr"