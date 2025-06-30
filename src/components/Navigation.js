import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaBars, FaTimes, FaSchool, FaHome, FaUsers, FaCalendarCheck, FaChartBar, FaQuestionCircle, FaGraduationCap, FaUserTie, FaUserFriends, FaMoneyBillWave, FaInbox } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, school, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    if (!user) return [];

    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: <FaHome /> }
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Students', path: '/admin/students', icon: <FaGraduationCap /> },
          { name: 'Teachers', path: '/admin/teachers', icon: <FaUserTie /> },
          { name: 'Parents', path: '/admin/parents', icon: <FaUserFriends /> },
          { name: 'Fees', path: '/admin/fees', icon: <FaMoneyBillWave /> },
          { name: 'Reports', path: '/admin/reports', icon: <FaChartBar /> },
          { name: 'Queries', path: '/admin/queries', icon: <FaQuestionCircle /> }
        ];
      case 'teacher':
        return [
          ...baseItems,
          { name: 'My Class', path: '/teacher/my-class', icon: <FaUsers /> },
          { name: 'Take Attendance', path: '/teacher/take-attendance', icon: <FaCalendarCheck /> },
          { name: 'Upload Results', path: '/teacher/upload-results', icon: <FaChartBar /> }
        ];
      case 'parent':
        return [
          ...baseItems,
          { name: 'My Children', path: '/parent/my-children', icon: <FaUsers /> },
          { name: 'Attendance', path: '/parent/attendance', icon: <FaCalendarCheck /> },
          { name: 'Results', path: '/parent/results', icon: <FaChartBar /> },
          { name: 'Send Query', path: '/parent/send-query', icon: <FaQuestionCircle /> },
          { name: 'My Queries', path: '/parent/my-queries', icon: <FaInbox /> }
        ];
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and School Info */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <FaSchool className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {school?.name || 'School Attendance'}
                </h1>
                {school && (
                  <p className="text-xs text-gray-500">
                    {school.domain} • {school.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2">
              <div className="text-sm text-gray-700">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                <FaSignOutAlt />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {isMobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium flex items-center space-x-3 ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
            
            {/* Mobile User Info */}
            <div className="px-3 py-2 border-t border-gray-200 mt-4">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <FaUser className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 