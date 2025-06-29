import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaHome, 
  FaUsers, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaUserFriends,
  FaCalendarCheck,
  FaChartBar,
  FaQuestionCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaUser
} from 'react-icons/fa';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNavItems = () => {
    const baseItems = [
      { name: 'Dashboard', path: '/dashboard', icon: FaHome }
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...baseItems,
          { name: 'Students', path: '/students', icon: FaUserGraduate },
          { name: 'Teachers', path: '/teachers', icon: FaChalkboardTeacher },
          { name: 'Parents', path: '/parents', icon: FaUserFriends },
          { name: 'Attendance', path: '/attendance', icon: FaCalendarCheck },
          { name: 'Reports', path: '/reports', icon: FaChartBar },
          { name: 'Queries', path: '/queries', icon: FaQuestionCircle }
        ];
      
      case 'teacher':
        return [
          ...baseItems,
          { name: 'Take Attendance', path: '/take-attendance', icon: FaCalendarCheck },
          { name: 'Upload Results', path: '/upload-results', icon: FaChartBar },
          { name: 'My Class', path: '/my-class', icon: FaUsers },
          { name: 'Queries', path: '/queries', icon: FaQuestionCircle }
        ];
      
      case 'parent':
        return [
          ...baseItems,
          { name: 'My Children', path: '/my-children', icon: FaUserGraduate },
          { name: 'Attendance', path: '/attendance', icon: FaCalendarCheck },
          { name: 'Results', path: '/results', icon: FaChartBar },
          { name: 'Send Query', path: '/send-query', icon: FaQuestionCircle }
        ];
      
      default:
        return baseItems;
    }
  };

  const navItems = getNavItems();

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin': return 'bg-red-600';
      case 'teacher': return 'bg-blue-600';
      case 'parent': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleBadge = () => {
    switch (user?.role) {
      case 'admin': return 'Admin';
      case 'teacher': return 'Teacher';
      case 'parent': return 'Parent';
      default: return 'User';
    }
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-gray-800">
                School Attendance
              </Link>
            </div>
            
            {/* Desktop Navigation Items */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive
                        ? 'border-blue-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* User Menu and Mobile Menu Button */}
          <div className="flex items-center">
            {/* User Info */}
            <div className="hidden sm:flex sm:items-center sm:ml-6">
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                </div>
                <div className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getRoleColor()}`}>
                  {getRoleBadge()}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden ml-2">
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

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
          
          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                  <FaUser className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.name}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                <div className={`inline-block mt-1 px-2 py-1 text-xs font-medium text-white rounded-full ${getRoleColor()}`}>
                  {getRoleBadge()}
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <FaSignOutAlt className="mr-3 h-5 w-5" />
                  Logout
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation; 