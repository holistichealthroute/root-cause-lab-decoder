from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from datetime import datetime
from app.auth.schemas import ReportRequest
from app.services.report_service import generate_medical_report, create_lab_report_pdf
from app.services.user_service import get_current_user
from app.utils.logger import setup_logging
from app.db import reports_collection
import logging
from bson import ObjectId
import io

router = APIRouter(dependencies=[Depends(get_current_user)])
logger = logging.getLogger(__name__)

@router.post("/generate-report")
async def generate_report(request: ReportRequest):
    logger.info(f"Received report request: {request}")
    try:
        report = await generate_medical_report(request)
        logger.info(f"Report generated for user_id: {report}")
        
        pdf_stream = create_lab_report_pdf(report)
        pdf_bytes = pdf_stream.getvalue()  
        user_id = str(request.user_id)
        logger.info("PDF report created successfully.")
        
        report_doc = {
            "user_id": user_id,
            "created_at": datetime.utcnow(),
            "report_data": report, 
            "pdf": pdf_bytes,       
            "filename": "Lab_Report.pdf"
        }
        result = await reports_collection.insert_one(report_doc)
        logger.info(f"Report saved in DB with id: {result.inserted_id}")

        return StreamingResponse(pdf_stream, media_type="application/pdf", headers={
            "Content-Disposition": "attachment; filename=Lab_Report.pdf"
        })
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/my-reports")
async def get_my_reports(user_id=Depends(get_current_user)):
    try:
        logger.info(f"Fetching reports for user_id: {user_id}")
        reports_cursor = reports_collection.find({"user_id": str(user_id)})
        reports = []
        async for report in reports_cursor:
            reports.append({
                "id": str(report["_id"]),
                "filename": report.get("filename", "Lab_Report.pdf"),
                "created_at": report.get("created_at"),
                "report_data": report.get("report_data"),
            })
        logger.info(f"Found {len(reports)} reports for user_id: {user_id}")
        return {"reports": reports}
    except Exception as e:
        logger.error(f"Error fetching reports for user: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

@router.get("/{report_id}")
async def get_report_pdf(report_id: str, user_id=Depends(get_current_user)):
    try:
        logger.info(f"Fetching PDF for report_id: {report_id}, user_id: {user_id}")
        report = await reports_collection.find_one({"_id": ObjectId(report_id), "user_id": str(user_id)})
        if not report or "pdf" not in report:
            raise HTTPException(status_code=404, detail="PDF not found")
        pdf_bytes = report["pdf"]
        return StreamingResponse(io.BytesIO(pdf_bytes), media_type="application/pdf", headers={
            "Content-Disposition": f"inline; filename={report.get('filename', 'Lab_Report.pdf')}"
        })
    except Exception as e:
        logger.error(f"Error fetching PDF for report {report_id}: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch PDF")