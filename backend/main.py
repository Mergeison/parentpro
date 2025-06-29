from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import uvicorn
from datetime import datetime, date
import json

app = FastAPI(title="School Attendance API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Mock database (replace with real database)
mock_data = {
    "students": [
        {"id": "student1", "name": "Alice Johnson", "class": "10", "section": "A", "photo_url": "", "parent_id": "parent1"},
        {"id": "student2", "name": "Bob Smith", "class": "10", "section": "A", "photo_url": "", "parent_id": "parent1"},
        {"id": "student3", "name": "Charlie Brown", "class": "9", "section": "B", "photo_url": "", "parent_id": "parent2"}
    ],
    "teachers": [
        {"id": "teacher1", "name": "John Teacher", "class": "10", "section": "A", "phone": "1234567890", "photo_url": ""},
        {"id": "teacher2", "name": "Jane Teacher", "class": "9", "section": "B", "phone": "0987654321", "photo_url": ""}
    ],
    "parents": [
        {"id": "parent1", "father_name": "John Parent", "mother_name": "Mary Parent", "children_ids": ["student1", "student2"], "phone": "5551234567"},
        {"id": "parent2", "father_name": "Bob Parent", "mother_name": "Alice Parent", "children_ids": ["student3"], "phone": "5559876543"}
    ],
    "attendance": [
        {"id": "att1", "student_id": "student1", "date": "2024-01-15", "morning": True, "afternoon": True, "evening": False, "captured_images": {"morning": "", "afternoon": "", "evening": ""}},
        {"id": "att2", "student_id": "student2", "date": "2024-01-15", "morning": True, "afternoon": False, "evening": True, "captured_images": {"morning": "", "afternoon": "", "evening": ""}}
    ],
    "exam_results": [
        {"id": "exam1", "student_id": "student1", "exam_type": "quarterly", "scores": {"math": 90, "english": 85, "science": 88}, "date": "2024-01-10"},
        {"id": "exam2", "student_id": "student2", "exam_type": "quarterly", "scores": {"math": 78, "english": 92, "science": 85}, "date": "2024-01-10"}
    ],
    "queries": [
        {"id": "query1", "parent_id": "parent1", "student_id": "student1", "message": "When is the next parent-teacher meeting?", "status": "pending", "date": "2024-01-14"}
    ]
}

# Pydantic models
class LoginRequest(BaseModel):
    email: str
    password: str

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
    phone: str

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

# Authentication
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    # Mock token verification - replace with real JWT verification
    if credentials.credentials != "mock-jwt-token":
        raise HTTPException(status_code=401, detail="Invalid token")
    return credentials.credentials

# Routes
@app.post("/api/login")
async def login(request: LoginRequest):
    # Mock authentication
    mock_users = {
        "admin@school.com": {"id": "1", "name": "Admin User", "role": "admin", "password": "admin123"},
        "teacher@school.com": {"id": "2", "name": "John Teacher", "role": "teacher", "class": "10", "section": "A", "password": "teacher123"},
        "parent@school.com": {"id": "3", "name": "Parent User", "role": "parent", "children": ["student1", "student2"], "password": "parent123"}
    }
    
    user = mock_users.get(request.email)
    if user and user["password"] == request.password:
        return {
            "success": True,
            "user": {k: v for k, v in user.items() if k != "password"},
            "token": "mock-jwt-token"
        }
    
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.get("/api/students")
async def get_students(token: str = Depends(verify_token)):
    return mock_data["students"]

@app.post("/api/students")
async def create_student(student: StudentCreate, token: str = Depends(verify_token)):
    new_student = {
        "id": f"student{len(mock_data['students']) + 1}",
        "name": student.name,
        "class": student.class_name,
        "section": student.section,
        "photo_url": "",
        "parent_id": student.parent_id
    }
    mock_data["students"].append(new_student)
    return new_student

@app.get("/api/teachers")
async def get_teachers(token: str = Depends(verify_token)):
    return mock_data["teachers"]

@app.post("/api/teachers")
async def create_teacher(teacher: TeacherCreate, token: str = Depends(verify_token)):
    new_teacher = {
        "id": f"teacher{len(mock_data['teachers']) + 1}",
        "name": teacher.name,
        "class": teacher.class_name,
        "section": teacher.section,
        "phone": teacher.phone,
        "photo_url": ""
    }
    mock_data["teachers"].append(new_teacher)
    return new_teacher

@app.get("/api/parents")
async def get_parents(token: str = Depends(verify_token)):
    return mock_data["parents"]

@app.post("/api/parents")
async def create_parent(parent: ParentCreate, token: str = Depends(verify_token)):
    new_parent = {
        "id": f"parent{len(mock_data['parents']) + 1}",
        "father_name": parent.father_name,
        "mother_name": parent.mother_name,
        "children_ids": [],
        "phone": parent.phone
    }
    mock_data["parents"].append(new_parent)
    return new_parent

@app.get("/api/attendance")
async def get_attendance(
    student_id: Optional[str] = None,
    class_name: Optional[str] = None,
    section: Optional[str] = None,
    date: Optional[str] = None,
    token: str = Depends(verify_token)
):
    attendance = mock_data["attendance"]
    
    if student_id:
        attendance = [a for a in attendance if a["student_id"] == student_id]
    
    if class_name and section:
        # Get students in the class
        class_students = [s["id"] for s in mock_data["students"] if s["class"] == class_name and s["section"] == section]
        attendance = [a for a in attendance if a["student_id"] in class_students]
    
    if date:
        attendance = [a for a in attendance if a["date"] == date]
    
    return attendance

@app.post("/api/attendance")
async def create_attendance(attendance: AttendanceCreate, token: str = Depends(verify_token)):
    new_attendance = {
        "id": f"att{len(mock_data['attendance']) + 1}",
        **attendance.dict()
    }
    mock_data["attendance"].append(new_attendance)
    return new_attendance

@app.get("/api/exam-results")
async def get_exam_results(student_id: Optional[str] = None, token: str = Depends(verify_token)):
    results = mock_data["exam_results"]
    if student_id:
        results = [r for r in results if r["student_id"] == student_id]
    return results

@app.post("/api/exam-results")
async def create_exam_result(result: ExamResultCreate, token: str = Depends(verify_token)):
    new_result = {
        "id": f"exam{len(mock_data['exam_results']) + 1}",
        **result.dict()
    }
    mock_data["exam_results"].append(new_result)
    return new_result

@app.get("/api/queries")
async def get_queries(student_id: Optional[str] = None, token: str = Depends(verify_token)):
    queries = mock_data["queries"]
    if student_id:
        queries = [q for q in queries if q["student_id"] == student_id]
    return queries

@app.post("/api/queries")
async def create_query(query: QueryCreate, token: str = Depends(verify_token)):
    new_query = {
        "id": f"query{len(mock_data['queries']) + 1}",
        **query.dict(),
        "status": "pending",
        "date": datetime.now().strftime("%Y-%m-%d")
    }
    mock_data["queries"].append(new_query)
    return new_query

@app.get("/")
async def root():
    return {"message": "School Attendance API is running"}

@app.get("/favicon.ico")
async def favicon():
    # Return an empty response for favicon requests
    return Response(status_code=204)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000) 