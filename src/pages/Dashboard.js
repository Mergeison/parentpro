import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserFriends, 
  FaCalendarCheck,
  FaChartBar,
  FaQuestionCircle,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';
import { studentsAPI, teachersAPI, parentsAPI, attendanceAPI, examResultsAPI, queriesAPI } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      switch (user?.role) {
        case 'admin':
          const [students, teachers, parents, attendance, queries] = await Promise.all([
            studentsAPI.getAll(),
            teachersAPI.getAll(),
            parentsAPI.getAll(),
            attendanceAPI.getByClass('10', 'A', new Date().toISOString().split('T')[0]),
            queriesAPI.getByStudent('student1')
          ]);
          
          setStats({
            totalStudents: students.length,
            totalTeachers: teachers.length,
            totalParents: parents.length,
            todayAttendance: attendance.length,
            pendingQueries: queries.filter(q => q.status === 'pending').length
          });
          break;
          
        case 'teacher':
          const [classStudents, classAttendance, classResults] = await Promise.all([
            studentsAPI.getAll().then(students => students.filter(s => s.class === user.class && s.section === user.section)),
            attendanceAPI.getByClass(user.class, user.section, new Date().toISOString().split('T')[0]),
            examResultsAPI.getByStudent('student1')
          ]);
          
          setStats({
            classStudents: classStudents.length,
            todayPresent: classAttendance.filter(a => a.morning || a.afternoon || a.evening).length,
            todayAbsent: classStudents.length - classAttendance.filter(a => a.morning || a.afternoon || a.evening).length,
            recentResults: classResults.length
          });
          break;
          
        case 'parent':
          const [children, childrenAttendance, childrenResults] = await Promise.all([
            studentsAPI.getAll().then(students => students.filter(s => user.children.includes(s.id))),
            Promise.all(user.children.map(childId => attendanceAPI.getByStudent(childId))),
            Promise.all(user.children.map(childId => examResultsAPI.getByStudent(childId)))
          ]);
          
          const totalAttendance = childrenAttendance.flat();
          const totalResults = childrenResults.flat();
          
          setStats({
            childrenCount: children.length,
            recentAttendance: totalAttendance.length,
            recentResults: totalResults.length,
            childrenNames: children.map(c => c.name)
          });
          break;
          
        default:
          setStats({});
          break;
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const renderAdminDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FaUserGraduate className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Students</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalStudents || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FaChalkboardTeacher className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Teachers</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalTeachers || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FaUserFriends className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Parents</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalParents || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <FaCalendarCheck className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.todayAttendance || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <FaQuestionCircle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Queries</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.pendingQueries || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FaUsers className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Class Students</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.classStudents || 0}</p>
            <p className="text-sm text-gray-500">Class {user?.class}-{user?.section}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FaCheckCircle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Present Today</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.todayPresent || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-red-100 text-red-600">
            <FaTimesCircle className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Absent Today</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.todayAbsent || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FaChartBar className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Recent Results</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.recentResults || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderParentDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 text-blue-600">
            <FaUserGraduate className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">My Children</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.childrenCount || 0}</p>
            {stats.childrenNames && (
              <p className="text-sm text-gray-500">{stats.childrenNames.join(', ')}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 text-green-600">
            <FaCalendarCheck className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Recent Attendance</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.recentAttendance || 0}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 text-purple-600">
            <FaChartBar className="h-6 w-6" />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Recent Results</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.recentResults || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'teacher':
        return renderTeacherDashboard();
      case 'parent':
        return renderParentDashboard();
      default:
        return <div>Welcome to the School Attendance System</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-2 text-gray-600">
              Here's what's happening in your {user?.role} dashboard
            </p>
          </div>
          
          {renderDashboard()}
          
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {user?.role === 'admin' && (
                <>
                  <button 
                    onClick={() => navigate('/students')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaUserGraduate className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Students</p>
                  </button>
                  <button 
                    onClick={() => navigate('/teachers')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaChalkboardTeacher className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Teachers</p>
                  </button>
                  <button 
                    onClick={() => navigate('/parents')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaUserFriends className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Manage Parents</p>
                  </button>
                  <button 
                    onClick={() => navigate('/reports')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaChartBar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">View Reports</p>
                  </button>
                </>
              )}
              
              {user?.role === 'teacher' && (
                <>
                  <button 
                    onClick={() => navigate('/take-attendance')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaCalendarCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Take Attendance</p>
                  </button>
                  <button 
                    onClick={() => navigate('/upload-results')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaChartBar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Upload Results</p>
                  </button>
                  <button 
                    onClick={() => navigate('/my-class')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaUsers className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">My Class</p>
                  </button>
                </>
              )}
              
              {user?.role === 'parent' && (
                <>
                  <button 
                    onClick={() => navigate('/my-children')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaUserGraduate className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">My Children</p>
                  </button>
                  <button 
                    onClick={() => navigate('/attendance')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaCalendarCheck className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">View Attendance</p>
                  </button>
                  <button 
                    onClick={() => navigate('/results')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaChartBar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">View Results</p>
                  </button>
                  <button 
                    onClick={() => navigate('/send-query')}
                    className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FaQuestionCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-600">Send Query</p>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 