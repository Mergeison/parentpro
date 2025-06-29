# 🏫 School Attendance Backend API

A FastAPI-based backend for the School Attendance Management System.

## 🚀 Features

- **Authentication**: JWT-based authentication system
- **Student Management**: CRUD operations for students
- **Teacher Management**: CRUD operations for teachers
- **Parent Management**: CRUD operations for parents
- **Attendance Tracking**: Photo-based attendance system
- **Exam Results**: Exam result management
- **Query System**: Parent-teacher communication
- **CORS Support**: Cross-origin resource sharing enabled

## 📦 Installation

### Prerequisites
- Python 3.8 or higher
- pip

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the Server
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

Once the server is running, you can access:
- **Interactive API Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc

## 🔐 Authentication

The API uses JWT Bearer tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

### Demo Credentials
- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Parent**: parent@school.com / parent123

## 📡 API Endpoints

### Authentication
- `POST /api/login` - User login

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create new teacher

### Parents
- `GET /api/parents` - Get all parents
- `POST /api/parents` - Create new parent

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance` - Create attendance record

### Exam Results
- `GET /api/exam-results` - Get exam results
- `POST /api/exam-results` - Create exam result

### Queries
- `GET /api/queries` - Get queries
- `POST /api/queries` - Create new query

## 🗄️ Data Models

### Student
```json
{
  "id": "string",
  "name": "string",
  "class": "string",
  "section": "string",
  "photo_url": "string",
  "parent_id": "string"
}
```

### Teacher
```json
{
  "id": "string",
  "name": "string",
  "class": "string",
  "section": "string",
  "phone": "string",
  "photo_url": "string"
}
```

### Attendance
```json
{
  "id": "string",
  "student_id": "string",
  "date": "yyyy-mm-dd",
  "morning": true/false,
  "afternoon": true/false,
  "evening": true/false,
  "captured_images": {
    "morning": "url",
    "afternoon": "url",
    "evening": "url"
  }
}
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///./school_attendance.db
CORS_ORIGINS=http://localhost:3000
```

## 🚀 Production Deployment

### Using Uvicorn
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Using Gunicorn
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **CORS Protection**: Configured for frontend integration
- **Input Validation**: Pydantic models for data validation
- **Error Handling**: Proper HTTP status codes and error messages

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest httpx

# Run tests
pytest
```

## 📝 Development

### Adding New Endpoints
1. Define Pydantic models for request/response
2. Create the endpoint function
3. Add authentication if required
4. Update documentation

### Database Integration
Replace the mock data with a real database:
1. Set up SQLAlchemy models
2. Configure database connection
3. Update CRUD operations
4. Add database migrations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. 