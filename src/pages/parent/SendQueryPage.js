import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaPaperPlane, FaUserTie, FaUserShield, FaUserGraduate } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { queriesAPI, studentsAPI, teachersAPI, testDataStructure } from '../../services/api';

const SendQueryPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [children, setChildren] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    recipient_type: 'teacher', // 'teacher' or 'admin'
    recipient_id: '',
    student_id: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching data for parent user:', user);
        console.log('User ID:', user.id);
        console.log('User role:', user.role);
        console.log('User school:', user.school);
        console.log('LocalStorage user:', JSON.parse(localStorage.getItem('user') || '{}'));
        
        // Test data structure
        testDataStructure();
        
        // Fetch parent's children
        let childrenData = await studentsAPI.getByParent(user.id);
        console.log('Children data fetched:', childrenData);
        
        // If no children found, try to fetch all students as fallback
        if (childrenData.length === 0) {
          console.log('No children found, fetching all students as fallback');
          childrenData = await studentsAPI.getAll();
        }
        
        setChildren(childrenData);
        
        // Fetch teachers
        const teachersData = await teachersAPI.getAll();
        console.log('Teachers data fetched:', teachersData);
        setTeachers(teachersData);
        
        // Set default values
        if (childrenData.length > 0) {
          setFormData(prev => ({ ...prev, student_id: childrenData[0].id }));
        }
        if (teachersData.length > 0) {
          setFormData(prev => ({ ...prev, recipient_id: teachersData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Show user-friendly error message
        alert('Error loading data. Please refresh the page and try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      alert('Please enter a message');
      return;
    }

    try {
      setLoading(true);
      
      const queryData = {
        parent_id: user.id,
        student_id: formData.student_id,
        recipient_type: formData.recipient_type,
        recipient_id: formData.recipient_id,
        subject: formData.subject.trim() || 'General Query',
        message: formData.message.trim(),
        status: 'pending'
      };

      await queriesAPI.create(queryData);
      setSubmitted(true);
      
      // Reset form
      setFormData({
        recipient_type: 'teacher',
        recipient_id: teachers.length > 0 ? teachers[0].id : '',
        student_id: children.length > 0 ? children[0].id : '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending query:', error);
      alert('Failed to send query. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRecipientOptions = () => {
    if (formData.recipient_type === 'teacher') {
      return teachers.map(teacher => (
        <option key={teacher.id} value={teacher.id}>
          {teacher.name} - Class {teacher.class}-{teacher.section}
        </option>
      ));
    } else {
      return (
        <option value="admin">School Administrator</option>
      );
    }
  };

  if (loading && !children.length) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // Temporary debug section
  const debugInfo = (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Information</h3>
      <div className="text-sm text-yellow-700 space-y-1">
        <p><strong>User ID:</strong> {user?.id}</p>
        <p><strong>User Role:</strong> {user?.role}</p>
        <p><strong>User Name:</strong> {user?.name}</p>
        <p><strong>School Domain:</strong> {user?.school?.domain}</p>
        <p><strong>Children Count:</strong> {children.length}</p>
        <p><strong>Teachers Count:</strong> {teachers.length}</p>
        <p><strong>LocalStorage User:</strong> {JSON.stringify(JSON.parse(localStorage.getItem('user') || '{}'), null, 2)}</p>
      </div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="text-green-500 mb-4">
              <FaPaperPlane className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Query Sent Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              Your query has been sent and will be reviewed by the recipient. You will receive a response soon.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send Another Query
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Send Query
          </h1>
          <p className="mt-2 text-gray-600">
            Send queries to teachers or administrators about your children
          </p>
        </div>
        
        {/* Debug Information */}
        {debugInfo}
        
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Recipient Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Send to:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipient_type"
                    value="teacher"
                    checked={formData.recipient_type === 'teacher'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <FaUserTie className="mr-1 text-blue-600" />
                  Teacher
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="recipient_type"
                    value="admin"
                    checked={formData.recipient_type === 'admin'}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <FaUserShield className="mr-1 text-green-600" />
                  Administrator
                </label>
              </div>
            </div>

            {/* Recipient Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.recipient_type === 'teacher' ? 'Select Teacher:' : 'Administrator:'}
              </label>
              <select
                name="recipient_id"
                value={formData.recipient_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select {formData.recipient_type === 'teacher' ? 'a teacher' : 'administrator'}</option>
                {getRecipientOptions()}
              </select>
            </div>

            {/* Child Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUserGraduate className="inline mr-1" />
                About which child:
              </label>
              <select
                name="student_id"
                value={formData.student_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">
                  {children.length === 0 ? 'No children found - please contact admin' : 'Select your child'}
                </option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} - Class {child.class}-{child.section}
                  </option>
                ))}
              </select>
              {children.length === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  No children are associated with your account. Please contact the school administrator.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject (optional):
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="Brief subject of your query"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message:
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                placeholder="Please describe your query in detail..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="mr-2" />
                    Send Query
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendQueryPage; 