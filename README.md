# 🏫 School Attendance Management System

A comprehensive role-based school attendance and student performance management application built with React.js and modern web technologies.

## ✨ Features

### 👨‍🏫 **Class Teacher Features**
- **Take Attendance**: Capture student photos and mark attendance for morning, afternoon, and evening sessions
- **Upload Exam Results**: Upload weekly, quarterly, half-yearly, and annual exam results
- **Class Management**: View and manage assigned class information
- **Photo Capture**: Integrated webcam functionality for attendance verification

### 🛠️ **Admin Features**
- **Student Management**: Enroll students, capture photos, generate student IDs
- **Teacher Management**: Enroll teachers, assign classes and sections
- **Parent Management**: Enroll parents and link them to their children
- **Reports & Analytics**: View comprehensive attendance and performance reports
- **Query Management**: Handle and respond to parent queries

### 👪 **Parent Features**
- **View Children**: Access information about enrolled children
- **Attendance Tracking**: View daily, weekly, and monthly attendance records
- **Exam Results**: Monitor children's academic performance
- **Send Queries**: Communicate with teachers and administrators
- **Download Reports**: Generate and download attendance and result reports

## 🚀 Technology Stack

- **Frontend**: React.js 19.1.0
- **Routing**: React Router DOM 6.8.0
- **Styling**: Tailwind CSS
- **Icons**: React Icons
- **Forms**: React Hook Form
- **Notifications**: React Toastify
- **Webcam**: React Webcam
- **PDF Generation**: HTML2PDF.js
- **Date Handling**: Date-fns
- **HTTP Client**: Axios

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd school_manage_attendance_app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

## 🔐 Demo Credentials

### Admin Access
- **Email**: admin@school.com
- **Password**: admin123

### Teacher Access
- **Email**: teacher@school.com
- **Password**: teacher123

### Parent Access
- **Email**: parent@school.com
- **Password**: parent123

## 📱 Application Structure

```
src/
├── components/          # Reusable UI components
│   ├── AttendanceCapture.js
│   ├── LoginForm.js
│   ├── Navigation.js
│   └── ProtectedRoute.js
├── contexts/           # React contexts
│   └── AuthContext.js
├── pages/             # Page components
│   ├── Dashboard.js
│   ├── admin/         # Admin-specific pages
│   ├── teacher/       # Teacher-specific pages
│   └── parent/        # Parent-specific pages
├── services/          # API services
│   └── api.js
└── App.js            # Main application component
```

## 🎯 Key Features Explained

### 1. **Role-Based Access Control (RBAC)**
- Different user interfaces based on user role (Admin, Teacher, Parent)
- Protected routes with role-based permissions
- Secure authentication system

### 2. **Photo-Based Attendance**
- Webcam integration for student photo capture
- Automatic attendance marking based on photo capture
- Support for multiple time slots (morning, afternoon, evening)

### 3. **Comprehensive Dashboard**
- Role-specific dashboards with relevant statistics
- Real-time data visualization
- Quick action buttons for common tasks

### 4. **Exam Results Management**
- Support for multiple exam types
- Subject-wise score entry
- Dynamic subject addition/removal
- Bulk result upload functionality

### 5. **Responsive Design**
- Mobile-first approach
- Responsive navigation with mobile menu
- Optimized for all device sizes

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://localhost:8000/api
REACT_APP_APP_NAME=School Attendance System
```

### Backend Integration
The application is currently using mock data. To integrate with a real backend:

1. Update the API base URL in `src/services/api.js`
2. Replace mock API functions with actual HTTP requests
3. Implement proper authentication tokens
4. Add error handling for network requests

## 📊 Data Models

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

### Exam Result
```json
{
  "id": "string",
  "student_id": "string",
  "exam_type": "weekly/quarterly/half_yearly/annual",
  "scores": {
    "math": 90,
    "english": 85
  },
  "date": "yyyy-mm-dd"
}
```

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Connect your repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `build`

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

## 🔒 Security Features

- **Protected Routes**: Role-based route protection
- **Authentication**: JWT token-based authentication
- **Input Validation**: Form validation and sanitization
- **Secure Storage**: Local storage for session management

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Future Enhancements

- [ ] Real-time notifications
- [ ] SMS/Email integration
- [ ] Advanced analytics dashboard
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with school management systems

---

**Built with ❤️ for better school management**
