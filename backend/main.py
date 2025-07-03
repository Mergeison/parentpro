from fastapi import FastAPI, HTTPException, Depends, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, date
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Multi-School Attendance API", version="2.0.0")

# CORS middleware - allow all origins for debugging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for debugging
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Multi-tenant mock database
mock_data = {
    "schools": [
        {
            "id": "school1",
            "name": "St. Mary's High School",
            "domain": "stmarys",
            "address": "123 Education St, City",
            "phone": "555-0101",
            "email": "admin@stmarys.edu",
            "logo_url": "",
            "settings": {
                "time_slots": ["morning", "afternoon", "evening"],
                "classes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                "sections": ["A", "B", "C", "D", "E"]
            }
        },
        {
            "id": "school2", 
            "name": "Bright Future Academy",
            "domain": "brightfuture",
            "address": "456 Learning Ave, Town",
            "phone": "555-0202",
            "email": "admin@brightfuture.edu",
            "logo_url": "",
            "settings": {
                "time_slots": ["morning", "afternoon"],
                "classes": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
                "sections": ["A", "B", "C"]
            }
        }
    ],
    "tenants": {
        "school1": {
            "students": [
                {"id": "student1", "name": "Alice Johnson", "class": "10", "section": "A", "photo_url": "", "parent_id": "parent1", "school_id": "school1"},
                {"id": "student2", "name": "Bob Smith", "class": "10", "section": "A", "photo_url": "", "parent_id": "parent1", "school_id": "school1"},
                {"id": "student3", "name": "Charlie Brown", "class": "9", "section": "B", "photo_url": "", "parent_id": "parent2", "school_id": "school1"}
            ],
            "teachers": [
                {"id": "teacher1", "name": "John Teacher", "class": "10", "section": "A", "phone": "1234567890", "photo_url": "", "school_id": "school1"},
                {"id": "teacher2", "name": "Jane Teacher", "class": "9", "section": "B", "phone": "0987654321", "photo_url": "", "school_id": "school1"}
            ],
            "parents": [
                {"id": "parent1", "father_name": "John Parent", "mother_name": "Mary Parent", "children_ids": ["student1", "student2"], "phone": "5551234567", "school_id": "school1"},
                {"id": "parent2", "father_name": "Bob Parent", "mother_name": "Alice Parent", "children_ids": ["student3"], "phone": "5559876543", "school_id": "school1"}
            ],
            "attendance": [
                {"id": "att1", "student_id": "student1", "date": "2024-01-15", "morning": True, "afternoon": True, "evening": False, "captured_images": {"morning": "", "afternoon": "", "evening": ""}, "school_id": "school1"},
                {"id": "att2", "student_id": "student2", "date": "2024-01-15", "morning": True, "afternoon": False, "evening": True, "captured_images": {"morning": "", "afternoon": "", "evening": ""}, "school_id": "school1"}
            ],
            "exam_results": [
                {"id": "exam1", "student_id": "student1", "exam_type": "quarterly", "scores": {"math": 90, "english": 85, "science": 88}, "date": "2024-01-10", "school_id": "school1"},
                {"id": "exam2", "student_id": "student2", "exam_type": "quarterly", "scores": {"math": 78, "english": 92, "science": 85}, "date": "2024-01-10", "school_id": "school1"}
            ],
            "queries": [
                {"id": "query1", "parent_id": "parent1", "student_id": "student1", "message": "When is the next parent-teacher meeting?", "status": "pending", "date": "2024-01-14", "school_id": "school1"}
            ],
            "fees": [
                {
                    "id": "fee1",
                    "student_id": "student1",
                    "academic_year": "2024-2025",
                    "total_amount": 50000,
                    "paid_amount": 30000,
                    "remaining_amount": 20000,
                    "due_date": "2024-12-31",
                    "status": "partial",
                    "school_id": "school1",
                    "installments": [
                        {"id": "inst1", "amount": 15000, "due_date": "2024-06-30", "paid_date": "2024-06-15", "status": "paid"},
                        {"id": "inst2", "amount": 15000, "due_date": "2024-09-30", "paid_date": "2024-09-20", "status": "paid"},
                        {"id": "inst3", "amount": 10000, "due_date": "2024-12-31", "paid_date": None, "status": "pending"},
                        {"id": "inst4", "amount": 10000, "due_date": "2025-03-31", "paid_date": None, "status": "pending"}
                    ]
                },
                {
                    "id": "fee2",
                    "student_id": "student2",
                    "academic_year": "2024-2025",
                    "total_amount": 50000,
                    "paid_amount": 50000,
                    "remaining_amount": 0,
                    "due_date": "2024-12-31",
                    "status": "paid",
                    "school_id": "school1",
                    "installments": [
                        {"id": "inst5", "amount": 15000, "due_date": "2024-06-30", "paid_date": "2024-06-10", "status": "paid"},
                        {"id": "inst6", "amount": 15000, "due_date": "2024-09-30", "paid_date": "2024-09-15", "status": "paid"},
                        {"id": "inst7", "amount": 10000, "due_date": "2024-12-31", "paid_date": "2024-12-20", "status": "paid"},
                        {"id": "inst8", "amount": 10000, "due_date": "2025-03-31", "paid_date": "2025-03-15", "status": "paid"}
                    ]
                }
            ]
        },
        "school2": {
            "students": [
                {"id": "student4", "name": "David Wilson", "class": "8", "section": "A", "photo_url": "", "parent_id": "parent3", "school_id": "school2"},
                {"id": "student5", "name": "Emma Davis", "class": "9", "section": "B", "photo_url": "", "parent_id": "parent4", "school_id": "school2"}
            ],
            "teachers": [
                {"id": "teacher3", "name": "Sarah Teacher", "class": "8", "section": "A", "phone": "1112223333", "photo_url": "", "school_id": "school2"},
                {"id": "teacher4", "name": "Mike Teacher", "class": "9", "section": "B", "phone": "4445556666", "photo_url": "", "school_id": "school2"}
            ],
            "parents": [
                {"id": "parent3", "father_name": "Tom Wilson", "mother_name": "Lisa Wilson", "children_ids": ["student4"], "phone": "7778889999", "school_id": "school2"},
                {"id": "parent4", "father_name": "James Davis", "mother_name": "Anna Davis", "children_ids": ["student5"], "phone": "0001112222", "school_id": "school2"}
            ],
            "attendance": [
                {"id": "att3", "student_id": "student4", "date": "2024-01-15", "morning": True, "afternoon": False, "captured_images": {"morning": "", "afternoon": ""}, "school_id": "school2"},
                {"id": "att4", "student_id": "student5", "date": "2024-01-15", "morning": False, "afternoon": True, "captured_images": {"morning": "", "afternoon": ""}, "school_id": "school2"}
            ],
            "exam_results": [
                {"id": "exam3", "student_id": "student4", "exam_type": "quarterly", "scores": {"math": 85, "english": 90, "science": 82}, "date": "2024-01-10", "school_id": "school2"},
                {"id": "exam4", "student_id": "student5", "exam_type": "quarterly", "scores": {"math": 92, "english": 88, "science": 95}, "date": "2024-01-10", "school_id": "school2"}
            ],
            "queries": [
                {"id": "query2", "parent_id": "parent3", "student_id": "student4", "message": "How is my child performing in class?", "status": "pending", "date": "2024-01-14", "school_id": "school2"}
            ],
            "fees": [
                {
                    "id": "fee3",
                    "student_id": "student4",
                    "academic_year": "2024-2025",
                    "total_amount": 45000,
                    "paid_amount": 0,
                    "remaining_amount": 45000,
                    "due_date": "2024-12-31",
                    "status": "unpaid",
                    "school_id": "school2",
                    "installments": [
                        {"id": "inst9", "amount": 15000, "due_date": "2024-06-30", "paid_date": None, "status": "pending"},
                        {"id": "inst10", "amount": 15000, "due_date": "2024-09-30", "paid_date": None, "status": "pending"},
                        {"id": "inst11", "amount": 15000, "due_date": "2024-12-31", "paid_date": None, "status": "pending"}
                    ]
                }
            ]
        }
    }
}

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str
    school_domain: str

class SchoolCreate(BaseModel):
    name: str
    domain: str
    address: str
    phone: str
    email: str

class StudentCreate(BaseModel):
    name: str
    class_name: str
    section: str
    parent_id: str

class TeacherCreate(BaseModel):
    name: str
    class_name: str
    section: str
    phone: str

class ParentCreate(BaseModel):
    father_name: str
    mother_name: str
    father_phone: Optional[str] = ""
    mother_phone: Optional[str] = ""
    father_email: Optional[str] = ""
    mother_email: Optional[str] = ""
    address: Optional[str] = ""
    emergency_contact: Optional[str] = ""
    emergency_phone: Optional[str] = ""
    children_ids: Optional[List[str]] = []

class AttendanceCreate(BaseModel):
    student_id: str
    date: str
    morning: bool = False
    afternoon: bool = False
    evening: bool = False
    captured_images: Dict[str, str] = {}

class ExamResultCreate(BaseModel):
    student_id: str
    exam_type: str
    scores: Dict[str, int]
    date: str

class QueryCreate(BaseModel):
    parent_id: str
    student_id: str
    message: str

class FeeCreate(BaseModel):
    student_id: str
    academic_year: str
    total_amount: float
    due_date: str
    installments: Optional[List[Dict[str, Any]]] = []

class FeeUpdate(BaseModel):
    student_id: Optional[str] = None
    academic_year: Optional[str] = None
    total_amount: Optional[float] = None
    due_date: Optional[str] = None

class InstallmentCreate(BaseModel):
    amount: float
    due_date: str

class PaymentRecord(BaseModel):
    paid_date: str
    payment_method: str
    receipt_number: Optional[str] = None

# Multi-tenant middleware
def get_tenant_id(school_domain: str = Header(..., alias="X-School-Domain")):
    # In production, this would validate against a database
    school = next((s for s in mock_data["schools"] if s["domain"] == school_domain), None)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school["id"]

# Authentication
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Mock token verification - replace with real JWT verification
    if credentials.credentials != "mock-jwt-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.credentials

# Routes
@app.post("/api/login")
async def login(request: LoginRequest):
    # Get school by domain
    school = next((s for s in mock_data["schools"] if s["domain"] == request.school_domain), None)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    
    # Mock authentication with school-specific users
    mock_users = {
        "school1": {
            "admin@stmarys.edu": {"id": "1", "name": "Admin User", "role": "admin", "password": "admin123", "school_id": "school1"},
            "teacher@stmarys.edu": {"id": "2", "name": "John Teacher", "role": "teacher", "class": "10", "section": "A", "password": "teacher123", "school_id": "school1"},
            "parent@stmarys.edu": {"id": "3", "name": "Parent User", "role": "parent", "children": ["student1", "student2"], "password": "parent123", "school_id": "school1"}
        },
        "school2": {
            "admin@brightfuture.edu": {"id": "4", "name": "Admin User", "role": "admin", "password": "admin123", "school_id": "school2"},
            "teacher@brightfuture.edu": {"id": "5", "name": "Sarah Teacher", "role": "teacher", "class": "8", "section": "A", "password": "teacher123", "school_id": "school2"},
            "parent@brightfuture.edu": {"id": "6", "name": "Parent User", "role": "parent", "children": ["student4"], "password": "parent123", "school_id": "school2"}
        }
    }
    
    school_users = mock_users.get(school["id"], {})
    user = school_users.get(request.email)
    
    if user and user["password"] == request.password:
        return {
            "success": True,
            "user": {k: v for k, v in user.items() if k != "password"},
            "school": {k: v for k, v in school.items() if k != "id"},
            "token": "mock-jwt-token"
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/schools")
async def get_schools():
    return [{"id": s["id"], "name": s["name"], "domain": s["domain"]} for s in mock_data["schools"]]

@app.get("/api/schools/{school_domain}")
async def get_school(school_domain: str):
    school = next((s for s in mock_data["schools"] if s["domain"] == school_domain), None)
    if not school:
        raise HTTPException(status_code=404, detail="School not found")
    return school

@app.get("/api/students")
async def get_students(
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    return mock_data["tenants"][tenant_id]["students"]

@app.post("/api/students")
async def create_student(
    student: StudentCreate, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_student = {
        "id": f"student{len(mock_data['tenants'][tenant_id]['students']) + 1}",
        "name": student.name,
        "class": student.class_name,
        "section": student.section,
        "photo_url": "",
        "parent_id": student.parent_id,
        "school_id": tenant_id
    }
    mock_data["tenants"][tenant_id]["students"].append(new_student)
    return new_student

@app.get("/api/teachers")
async def get_teachers(
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    return mock_data["tenants"][tenant_id]["teachers"]

@app.post("/api/teachers")
async def create_teacher(
    teacher: TeacherCreate, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_teacher = {
        "id": f"teacher{len(mock_data['tenants'][tenant_id]['teachers']) + 1}",
        "name": teacher.name,
        "class": teacher.class_name,
        "section": teacher.section,
        "phone": teacher.phone,
        "photo_url": "",
        "school_id": tenant_id
    }
    mock_data["tenants"][tenant_id]["teachers"].append(new_teacher)
    return new_teacher

@app.get("/api/parents")
async def get_parents(
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    return mock_data["tenants"][tenant_id]["parents"]

@app.post("/api/parents")
async def create_parent(
    parent: ParentCreate, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_parent = {
        "id": f"parent{len(mock_data['tenants'][tenant_id]['parents']) + 1}",
        "father_name": parent.father_name,
        "mother_name": parent.mother_name,
        "father_phone": parent.father_phone,
        "mother_phone": parent.mother_phone,
        "father_email": parent.father_email,
        "mother_email": parent.mother_email,
        "address": parent.address,
        "emergency_contact": parent.emergency_contact,
        "emergency_phone": parent.emergency_phone,
        "children_ids": parent.children_ids,
        "school_id": tenant_id
    }
    mock_data["tenants"][tenant_id]["parents"].append(new_parent)
    return new_parent

@app.get("/api/attendance")
async def get_attendance(
    student_id: Optional[str] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    date: Optional[str] = None,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    attendance = mock_data["tenants"][tenant_id]["attendance"]
    
    if student_id:
        attendance = [a for a in attendance if a["student_id"] == student_id]
    
    if class_name and section:
        # Get students in the class
        class_students = [s["id"] for s in mock_data["tenants"][tenant_id]["students"] if s["class"] == class_name and s["section"] == section]
        attendance = [a for a in attendance if a["student_id"] in class_students]
    
    if date:
        attendance = [a for a in attendance if a["date"] == date]
    
    return attendance

@app.post("/api/attendance")
async def create_attendance(
    attendance: AttendanceCreate, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_attendance = {
        "id": f"att{len(mock_data['tenants'][tenant_id]['attendance']) + 1}",
        **attendance.dict(),
        "school_id": tenant_id
    }
    mock_data["tenants"][tenant_id]["attendance"].append(new_attendance)
    return new_attendance

@app.get("/api/exam-results")
async def get_exam_results(
    student_id: Optional[str] = None, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    results = mock_data["tenants"][tenant_id]["exam_results"]
    if student_id:
        results = [r for r in results if r["student_id"] == student_id]
    return results

@app.post("/api/exam-results")
async def create_exam_result(
    result: ExamResultCreate, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_result = {
        "id": f"exam{len(mock_data['tenants'][tenant_id]['exam_results']) + 1}",
        **result.dict(),
        "school_id": tenant_id
    }
    mock_data["tenants"][tenant_id]["exam_results"].append(new_result)
    return new_result

@app.get("/api/queries")
async def get_queries(
    student_id: Optional[str] = None, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    queries = mock_data["tenants"][tenant_id]["queries"]
    if student_id:
        queries = [q for q in queries if q["student_id"] == student_id]
    return queries

@app.post("/api/queries")
async def create_query(
    query: QueryCreate, 
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_query = {
        "id": f"query{len(mock_data['tenants'][tenant_id]['queries']) + 1}",
        **query.dict(),
        "status": "pending",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "school_id": tenant_id
    }
    mock_data["tenants"][tenant_id]["queries"].append(new_query)
    return new_query

# Fee Management Endpoints
@app.get("/api/fees")
async def get_fees(
    student_id: Optional[str] = None,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    fees = mock_data["tenants"][tenant_id]["fees"]
    if student_id:
        fees = [f for f in fees if f["student_id"] == student_id]
    return fees

@app.get("/api/fees/{fee_id}")
async def get_fee(
    fee_id: str,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    fee = next((f for f in mock_data["tenants"][tenant_id]["fees"] if f["id"] == fee_id), None)
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    return fee

@app.post("/api/fees")
async def create_fee(
    fee: FeeCreate,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    new_fee = {
        "id": f"fee{len(mock_data['tenants'][tenant_id]['fees']) + 1}",
        "student_id": fee.student_id,
        "academic_year": fee.academic_year,
        "total_amount": fee.total_amount,
        "paid_amount": 0,
        "remaining_amount": fee.total_amount,
        "due_date": fee.due_date,
        "status": "unpaid",
        "school_id": tenant_id,
        "installments": fee.installments or []
    }
    mock_data["tenants"][tenant_id]["fees"].append(new_fee)
    return new_fee

@app.put("/api/fees/{fee_id}")
async def update_fee(
    fee_id: str,
    fee_update: FeeUpdate,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    fee_index = next((i for i, f in enumerate(mock_data["tenants"][tenant_id]["fees"]) if f["id"] == fee_id), None)
    if fee_index is None:
        raise HTTPException(status_code=404, detail="Fee record not found")
    
    fee = mock_data["tenants"][tenant_id]["fees"][fee_index]
    update_data = fee_update.dict(exclude_unset=True)
    
    for key, value in update_data.items():
        fee[key] = value
    
    return fee

@app.post("/api/fees/{fee_id}/installments")
async def add_installment(
    fee_id: str,
    installment: InstallmentCreate,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    fee_index = next((i for i, f in enumerate(mock_data["tenants"][tenant_id]["fees"]) if f["id"] == fee_id), None)
    if fee_index is None:
        raise HTTPException(status_code=404, detail="Fee record not found")
    
    fee = mock_data["tenants"][tenant_id]["fees"][fee_index]
    new_installment = {
        "id": f"inst{len(fee['installments']) + 1}",
        "amount": installment.amount,
        "due_date": installment.due_date,
        "paid_date": None,
        "status": "pending"
    }
    
    fee["installments"].append(new_installment)
    
    # Recalculate total amount
    fee["total_amount"] = sum(inst["amount"] for inst in fee["installments"])
    fee["remaining_amount"] = fee["total_amount"] - fee["paid_amount"]
    
    return fee

@app.post("/api/fees/{fee_id}/installments/{installment_id}/pay")
async def record_payment(
    fee_id: str,
    installment_id: str,
    payment: PaymentRecord,
    token: str = Depends(verify_token),
    tenant_id: str = Depends(get_tenant_id)
):
    fee_index = next((i for i, f in enumerate(mock_data["tenants"][tenant_id]["fees"]) if f["id"] == fee_id), None)
    if fee_index is None:
        raise HTTPException(status_code=404, detail="Fee record not found")
    
    fee = mock_data["tenants"][tenant_id]["fees"][fee_index]
    installment_index = next((i for i, inst in enumerate(fee["installments"]) if inst["id"] == installment_id), None)
    if installment_index is None:
        raise HTTPException(status_code=404, detail="Installment not found")
    
    installment = fee["installments"][installment_index]
    installment["paid_date"] = payment.paid_date
    installment["status"] = "paid"
    
    # Recalculate fee totals
    total_paid = sum(inst["amount"] for inst in fee["installments"] if inst["status"] == "paid")
    fee["paid_amount"] = total_paid
    fee["remaining_amount"] = fee["total_amount"] - total_paid
    
    if total_paid == fee["total_amount"]:
        fee["status"] = "paid"
    elif total_paid > 0:
        fee["status"] = "partial"
    else:
        fee["status"] = "unpaid"
    
    return fee

@app.get("/")
async def root():
    return {"message": "Multi-School Attendance API", "version": "2.0.0"}

@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port) 