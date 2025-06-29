import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import LoginForm from './components/LoginForm';

// Pages
import Dashboard from './pages/Dashboard';

// Admin Pages
import StudentsPage from './pages/admin/StudentsPage';
import TeachersPage from './pages/admin/TeachersPage';
import ParentsPage from './pages/admin/ParentsPage';
import ReportsPage from './pages/admin/ReportsPage';
import QueriesPage from './pages/admin/QueriesPage';

// Teacher Pages
import TakeAttendancePage from './pages/teacher/TakeAttendancePage';
import UploadResultsPage from './pages/teacher/UploadResultsPage';
import MyClassPage from './pages/teacher/MyClassPage';

// Parent Pages
import MyChildrenPage from './pages/parent/MyChildrenPage';
import AttendancePage from './pages/parent/AttendancePage';
import ResultsPage from './pages/parent/ResultsPage';
import SendQueryPage from './pages/parent/SendQueryPage';

// Shared Pages
import UnauthorizedPage from './pages/UnauthorizedPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginForm />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected Routes */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <div>
                    <Navigation />
                    <Dashboard />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/students" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Navigation />
                    <StudentsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/teachers" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Navigation />
                    <TeachersPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/parents" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Navigation />
                    <ParentsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/reports" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Navigation />
                    <ReportsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/queries" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Navigation />
                    <QueriesPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Teacher Routes */}
            <Route 
              path="/take-attendance" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <div>
                    <Navigation />
                    <TakeAttendancePage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/upload-results" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <div>
                    <Navigation />
                    <UploadResultsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/my-class" 
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <div>
                    <Navigation />
                    <MyClassPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Parent Routes */}
            <Route 
              path="/my-children" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <div>
                    <Navigation />
                    <MyChildrenPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/attendance" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <div>
                    <Navigation />
                    <AttendancePage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/results" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <div>
                    <Navigation />
                    <ResultsPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/send-query" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <div>
                    <Navigation />
                    <SendQueryPage />
                  </div>
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
