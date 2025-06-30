import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaReply, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { queriesAPI, studentsAPI } from '../../services/api';

const MyQueriesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch parent's children
        const childrenData = await studentsAPI.getByParent(user.id);
        setChildren(childrenData);
        
        // Fetch all queries for parent's children
        const allQueries = [];
        for (const child of childrenData) {
          const childQueries = await queriesAPI.getByStudent(child.id);
          allQueries.push(...childQueries);
        }
        
        // Sort by date (newest first)
        allQueries.sort((a, b) => new Date(b.date) - new Date(a.date));
        setQueries(allQueries);
      } catch (error) {
        console.error('Error fetching queries:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-500" />;
      case 'responded':
        return <FaReply className="text-green-500" />;
      case 'resolved':
        return <FaCheckCircle className="text-green-600" />;
      case 'closed':
        return <FaTimesCircle className="text-gray-500" />;
      default:
        return <FaClock className="text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'responded':
        return 'Responded';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return 'Unknown';
    }
  };

  const getRecipientName = (query) => {
    if (query.recipient_type === 'admin') {
      return 'School Administrator';
    }
    // For teachers, you would need to fetch teacher details
    return `Teacher (ID: ${query.recipient_id})`;
  };

  const getChildName = (studentId) => {
    const child = children.find(c => c.id === studentId);
    return child ? `${child.name} (Class ${child.class}-${child.section})` : 'Unknown Child';
  };

  const filteredQueries = selectedChild === 'all' 
    ? queries 
    : queries.filter(q => q.student_id === selectedChild);

  if (loading) {
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

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            My Queries
          </h1>
          <p className="mt-2 text-gray-600">
            View and track your queries to teachers and administrators
          </p>
        </div>

        {/* Filter by Child */}
        {children.length > 1 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Child:
            </label>
            <select
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Children</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name} - Class {child.class}-{child.section}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Queries List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredQueries.length === 0 ? (
            <div className="p-8 text-center">
              <FaQuestionCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No queries found
              </h3>
              <p className="text-gray-600">
                {selectedChild === 'all' 
                  ? "You haven't sent any queries yet." 
                  : "No queries found for the selected child."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredQueries.map((query) => (
                <div key={query.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(query.status)}
                          <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                            query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            query.status === 'responded' ? 'bg-green-100 text-green-800' :
                            query.status === 'resolved' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {getStatusText(query.status)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(query.date).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {query.subject || 'General Query'}
                      </h3>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p><strong>To:</strong> {getRecipientName(query)}</p>
                        <p><strong>About:</strong> {getChildName(query.student_id)}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-gray-800">{query.message}</p>
                      </div>
                      
                      {query.response && (
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                          <div className="flex items-center mb-2">
                            <FaReply className="text-blue-600 mr-2" />
                            <span className="text-sm font-medium text-blue-900">Response:</span>
                          </div>
                          <p className="text-blue-800">{query.response}</p>
                          {query.response_date && (
                            <p className="text-xs text-blue-600 mt-2">
                              Responded on: {new Date(query.response_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyQueriesPage; 