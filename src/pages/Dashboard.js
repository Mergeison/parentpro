import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers, FaCalendarCheck, FaChartBar, FaQuestionCircle, FaGraduationCap, FaUserTie, FaUserFriends, FaSchool, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { studentsAPI, teachersAPI, parentsAPI, attendanceAPI } from '../services/api';

const Dashboard = () => {
  const { user, school } = useAuth();
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    parents: 0,
    attendanceToday: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const [students, teachers, parents, attendance] = await Promise.all([
        studentsAPI.getAll(),
        teachersAPI.getAll(),
        parentsAPI.getAll(),
        attendanceAPI.getByClass(user?.class, user?.section, new Date().toISOString().split('T')[0])
      ]);

      setStats({
        students: students.length,
        teachers: teachers.length,
        parents: parents.length,
        attendanceToday: attendance.length
      });
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuickActions = () => {
    if (!user) return [];

    switch (user.role) {
      case 'admin':
        return [
          { name: 'Manage Students', path: '/admin/students', icon: <FaGraduationCap />, color: 'bg-blue-500' },
          { name: 'Manage Teachers', path: '/admin/teachers', icon: <FaUserTie />, color: 'bg-green-500' },
          { name: 'Manage Parents', path: '/admin/parents', icon: <FaUserFriends />, color: 'bg-purple-500' },
          { name: 'View Reports', path: '/admin/reports', icon: <FaChartBar />, color: 'bg-yellow-500' },
          { name: 'Handle Queries', path: '/admin/queries', icon: <FaQuestionCircle />, color: 'bg-red-500' }
        ];
      case 'teacher':
        return [
          { name: 'Take Attendance', path: '/teacher/take-attendance', icon: <FaCalendarCheck />, color: 'bg-green-500' },
          { name: 'My Class', path: '/teacher/my-class', icon: <FaUsers />, color: 'bg-blue-500' },
          { name: 'Upload Results', path: '/teacher/upload-results', icon: <FaChartBar />, color: 'bg-purple-500' }
        ];
      case 'parent':
        return [
          { name: 'View Attendance', path: '/parent/attendance', icon: <FaCalendarCheck />, color: 'bg-green-500' },
          { name: 'My Children', path: '/parent/my-children', icon: <FaUsers />, color: 'bg-blue-500' },
          { name: 'View Results', path: '/parent/results', icon: <FaChartBar />, color: 'bg-purple-500' },
          { name: 'Send Query', path: '/parent/send-query', icon: <FaQuestionCircle />, color: 'bg-yellow-500' }
        ];
      default:
        return [];
    }
  };

  const getWelcomeMessage = () => {
    const time = new Date().getHours();
    let greeting = 'Good morning';
    
    if (time >= 12 && time < 17) {
      greeting = 'Good afternoon';
    } else if (time >= 17) {
      greeting = 'Good evening';
    }

    return `${greeting}, ${user?.name}!`;
  };

  const quickActions = getQuickActions();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {getWelcomeMessage()}
          </h1>
          <p className="mt-2 text-gray-600">
            Welcome to {school?.name} - School Attendance Management System
          </p>
        </div>

        {/* School Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaSchool className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {school?.name}
              </h2>
              <p className="text-gray-600">
                {school?.address} • Phone: {school?.phone}
              </p>
              <p className="text-sm text-gray-500">
                Domain: {school?.domain} • Email: {school?.email}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards - Hidden for Parent role */}
        {user?.role !== 'parent' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaGraduationCap className="h-4 w-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.students}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                    <FaUserTie className="h-4 w-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Teachers</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.teachers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FaUserFriends className="h-4 w-4 text-purple-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Parents</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.parents}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <FaCalendarCheck className="h-4 w-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Today's Attendance</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.attendanceToday}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Quick Actions
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Access frequently used features quickly
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.path}
                  className="group relative p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 h-10 w-10 ${action.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <div className="text-white">
                        {action.icon}
                      </div>
                    </div>
                    <div className="ml-4">
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {action.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Click to access
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Role-specific Information */}
        {user?.role === 'admin' && (
          <div className="mt-8 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              School Administration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">School Settings</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Time slots: {school?.settings?.time_slots?.join(', ')}
                </p>
                <p className="text-sm text-blue-700">
                  Classes: {school?.settings?.classes?.join(', ')}
                </p>
                <p className="text-sm text-blue-700">
                  Sections: {school?.settings?.sections?.join(', ')}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Quick Stats</h4>
                <p className="text-sm text-green-700 mt-1">
                  Total students: {stats.students}
                </p>
                <p className="text-sm text-green-700">
                  Total teachers: {stats.teachers}
                </p>
                <p className="text-sm text-green-700">
                  Total parents: {stats.parents}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 