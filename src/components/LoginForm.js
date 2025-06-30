import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import SchoolSelector from './SchoolSelector';

const LoginForm = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSchoolSelect = (school) => {
    setSelectedSchool(school);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSchool) {
      toast.error('Please select your school first');
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        ...formData,
        school_domain: selectedSchool.domain
      });
      
      if (response.success) {
        toast.success(`Welcome to ${selectedSchool.name}!`);
        // Navigate to dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const getDemoCredentials = () => {
    if (!selectedSchool) return null;
    
    const credentials = {
      'stmarys': {
        admin: { email: 'admin@stmarys.edu', password: 'admin123' },
        teacher: { email: 'teacher@stmarys.edu', password: 'teacher123' },
        parent: { email: 'parent@stmarys.edu', password: 'parent123' }
      },
      'brightfuture': {
        admin: { email: 'admin@brightfuture.edu', password: 'admin123' },
        teacher: { email: 'teacher@brightfuture.edu', password: 'teacher123' },
        parent: { email: 'parent@brightfuture.edu', password: 'parent123' }
      }
    };
    
    return credentials[selectedSchool.domain];
  };

  const demoCredentials = getDemoCredentials();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            School Attendance System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your school's attendance portal
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* School Selection */}
          <SchoolSelector 
            onSchoolSelect={handleSchoolSelect}
            selectedSchool={selectedSchool}
          />

          {/* Login Form */}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !selectedSchool}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="animate-spin h-5 w-5" />
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          {/* Demo Credentials */}
          {selectedSchool && demoCredentials && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Demo Credentials for {selectedSchool.name}
              </h3>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Admin:</span>
                  <button
                    type="button"
                    onClick={() => setFormData(demoCredentials.admin)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {demoCredentials.admin.email}
                  </button>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Teacher:</span>
                  <button
                    type="button"
                    onClick={() => setFormData(demoCredentials.teacher)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {demoCredentials.teacher.email}
                  </button>
                </div>
                <div className="text-xs">
                  <span className="font-medium text-gray-700">Parent:</span>
                  <button
                    type="button"
                    onClick={() => setFormData(demoCredentials.parent)}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    {demoCredentials.parent.email}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Password for all accounts: <code className="bg-gray-200 px-1 rounded">admin123</code> / <code className="bg-gray-200 px-1 rounded">teacher123</code> / <code className="bg-gray-200 px-1 rounded">parent123</code>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginForm; 