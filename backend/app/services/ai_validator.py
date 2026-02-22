import random
from typing import Dict, Any

def validate_documents(app_data: Dict[str, Any], doc_paths: Dict[str, str]) -> Dict[str, Any]:
    """
    Simulated AI validation logic.
    In a real scenario, this would call GCV, Textract, or an LLM.
    """
    report = {
        "confidence_score": 0.0,
        "extracted_data": {},
        "discrepancies": []
    }
    
    # Simulate processing delay
    # In a real app, this might be a background task (Celery/RQ)
    
    # Rules:
    # 1. Name match (simulated)
    # 2. Income match (simulated)
    # 3. Document visibility/blur (simulated)
    
    has_7_12 = "document_7_12" in doc_paths
    has_income = "income_certificate" in doc_paths
    
    if not has_7_12 or not has_income:
        return {"status": "FLAGGED", "report": {"error": "Missing critical documents for AI scan"}}

    # Mock extraction from "Image OCR"
    extracted_name = app_data.get("applicant_name", "Unknown")
    extracted_income = app_data.get("income", 0)
    
    # Randomly flag some for demonstration if not "Rakesh Kumar" (our test case)
    if "fake" in str(doc_paths).lower():
        report["confidence_score"] = 0.45
        report["discrepancies"] = ["Low resolution or tampered pixels detected"]
        status = "FLAGGED"
    else:
        report["confidence_score"] = random.uniform(0.85, 0.99)
        report["extracted_data"] = {
            "name": extracted_name,
            "income_on_doc": extracted_income,
            "document_stamp_verified": True
        }
        status = "VALID"

    return {
        "status": status,
        "report": report
    }
