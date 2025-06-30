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
import FeesPage from './pages/admin/FeesPage';
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
import MyQueriesPage from './pages/parent/MyQueriesPage';

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
              path="/admin/students" 
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
              path="/admin/teachers" 
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
              path="/admin/parents" 
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
              path="/admin/fees" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>
                    <Navigation />
                    <FeesPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/admin/reports" 
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
              path="/admin/queries" 
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
              path="/teacher/take-attendance" 
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
              path="/teacher/upload-results" 
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
              path="/teacher/my-class" 
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
              path="/parent/my-children" 
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
              path="/parent/attendance" 
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
              path="/parent/results" 
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
              path="/parent/send-query" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <div>
                    <Navigation />
                    <SendQueryPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/parent/my-queries" 
              element={
                <ProtectedRoute allowedRoles={['parent']}>
                  <div>
                    <Navigation />
                    <MyQueriesPage />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
