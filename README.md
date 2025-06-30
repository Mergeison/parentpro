# 🏫 School Attendance Management System

A comprehensive multi-tenant school attendance management system with support for multiple schools, real-time attendance tracking, exam results, fee management, and parent-teacher communication.

## ✨ Features

- **Multi-Tenant Architecture**: Support for multiple schools with isolated data
- **Role-Based Access**: Admin, Teacher, and Parent roles with different permissions
- **Real-Time Attendance**: Photo-based attendance tracking with time slots
- **Exam Results**: Comprehensive exam result management and reporting
- **Fee Management**: Complete fee tracking with installment support
- **Communication**: Parent-teacher query system
- **Modern UI**: Responsive design with Tailwind CSS
- **Secure API**: JWT-based authentication with CORS support

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <your-repo-url>
cd school_manage_attendance_app

# Run the quick start script
./quick-start.sh
```

This will automatically:
- Install all dependencies
- Start the backend server
- Start the frontend server
- Open the application in your browser

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
python main.py
```

#### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm start
```

## 🌐 Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 👥 Demo Credentials

### St. Mary's High School (stmarys)
- **Admin**: admin@stmarys.edu / admin123
- **Teacher**: teacher@stmarys.edu / teacher123
- **Parent**: parent@stmarys.edu / parent123

### Bright Future Academy (brightfuture)
- **Admin**: admin@brightfuture.edu / admin123
- **Teacher**: teacher@brightfuture.edu / teacher123
- **Parent**: parent@brightfuture.edu / parent123

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 18 with Hooks
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios

### Backend (FastAPI)
- **Framework**: FastAPI
- **Authentication**: JWT Bearer tokens
- **CORS**: Configured for cross-origin requests
- **Multi-tenancy**: School-based data isolation
- **Documentation**: Auto-generated OpenAPI docs

## 📁 Project Structure

```
school_manage_attendance_app/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Docker configuration
│   ├── docker-compose.yml  # Docker Compose setup
│   └── DEPLOYMENT.md       # Backend deployment guide
├── src/                    # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── services/          # API services
│   └── App.js             # Main app component
├── public/                # Static assets
├── package.json           # Node.js dependencies
├── tailwind.config.js     # Tailwind configuration
├── DEPLOYMENT.md          # Complete deployment guide
└── quick-start.sh         # Quick start script
```

## 🚀 Deployment

### Quick Deployment Options

1. **Heroku + Vercel** (Recommended for beginners)
   - Backend: Deploy to Heroku
   - Frontend: Deploy to Vercel
   - See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions

2. **Railway + Netlify**
   - Backend: Deploy to Railway
   - Frontend: Deploy to Netlify

3. **Docker Deployment**
   - Use the provided Dockerfile and docker-compose.yml
   - Deploy to any cloud platform supporting Docker

### Environment Configuration

#### Backend (.env)
```env
FRONTEND_URL=https://your-frontend-domain.com
SECRET_KEY=your-super-secret-jwt-key-here
HOST=0.0.0.0
PORT=8000
```

#### Frontend (.env)
```env
REACT_APP_API_MODE=real
REACT_APP_BACKEND_URL=https://your-backend-url.com/api
REACT_APP_API_ENABLED=true
```

## 🔧 Development

### API Development
```bash
cd backend
python main.py
# API docs available at http://localhost:8000/docs
```

### Frontend Development
```bash
npm start
# Development server at http://localhost:3000
```

### Testing
```bash
# Backend tests
cd backend
python -m pytest

# Frontend tests
npm test
```

## 📊 Features by Role

### Admin
- School management and configuration
- Student, teacher, and parent management
- Fee structure management
- System reports and analytics
- Query management

### Teacher
- Class attendance tracking
- Exam result upload
- Student performance monitoring
- Parent communication

### Parent
- View children's attendance
- Check exam results
- Monitor fee payments
- Send queries to teachers

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- CORS protection
- Input validation
- Secure password handling
- Multi-tenant data isolation

## 📈 Performance

- Optimized API responses
- Efficient database queries
- Frontend code splitting
- Image optimization
- Caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- **Documentation**: Check the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment help
- **Issues**: Create an issue in the repository
- **API Docs**: Available at `/docs` when backend is running

## 🎯 Roadmap

- [ ] Real-time notifications
- [ ] Mobile app development
- [ ] Advanced analytics dashboard
- [ ] Integration with external systems
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Made with ❤️ for better school management**
# Parentpro
