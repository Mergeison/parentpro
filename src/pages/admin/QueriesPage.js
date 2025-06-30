import React, { useState, useEffect } from 'react';
import { FaQuestionCircle, FaReply, FaClock, FaCheckCircle, FaTimesCircle, FaFilter, FaEye } from 'react-icons/fa';
import { queriesAPI, studentsAPI, parentsAPI, teachersAPI } from '../../services/api';

const QueriesPage = () => {
  const [loading, setLoading] = useState(true);
  const [queries, setQueries] = useState([]);
  const [students, setStudents] = useState([]);
  const [parents, setParents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRecipient, setFilterRecipient] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [queriesData, studentsData, parentsData, teachersData] = await Promise.all([
          queriesAPI.getAll(),
          studentsAPI.getAll(),
          parentsAPI.getAll(),
          teachersAPI.getAll()
        ]);
        
        setQueries(queriesData);
        setStudents(studentsData);
        setParents(parentsData);
        setTeachers(teachersData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.name} (Class ${student.class}-${student.section})` : 'Unknown Student';
  };

  const getParentName = (parentId) => {
    const parent = parents.find(p => p.id === parentId);
    return parent ? `${parent.father_name} & ${parent.mother_name}` : 'Unknown Parent';
  };

  const getRecipientName = (query) => {
    if (query.recipient_type === 'admin') {
      return 'School Administrator';
    }
    const teacher = teachers.find(t => t.id === query.recipient_id);
    return teacher ? `${teacher.name} (Class ${teacher.class}-${teacher.section})` : `Teacher (ID: ${query.recipient_id})`;
  };

  const handleRespond = (query) => {
    setSelectedQuery(query);
    setResponseText(query.response || '');
    setShowResponseModal(true);
  };

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      alert('Please enter a response');
      return;
    }

    try {
      const updates = {
        response: responseText.trim(),
        response_date: new Date().toISOString().split('T')[0],
        status: 'responded'
      };

      await queriesAPI.update(selectedQuery.id, updates);
      
      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === selectedQuery.id 
          ? { ...q, ...updates }
          : q
      ));
      
      setShowResponseModal(false);
      setSelectedQuery(null);
      setResponseText('');
    } catch (error) {
      console.error('Error updating query:', error);
      alert('Failed to send response. Please try again.');
    }
  };

  const handleStatusChange = async (queryId, newStatus) => {
    try {
      await queriesAPI.update(queryId, { status: newStatus });
      
      // Update local state
      setQueries(prev => prev.map(q => 
        q.id === queryId 
          ? { ...q, status: newStatus }
          : q
      ));
    } catch (error) {
      console.error('Error updating query status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const filteredQueries = queries.filter(query => {
    const statusMatch = filterStatus === 'all' || query.status === filterStatus;
    const recipientMatch = filterRecipient === 'all' || query.recipient_type === filterRecipient;
    return statusMatch && recipientMatch;
  });

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
            Queries Management
          </h1>
          <p className="mt-2 text-gray-600">
            Manage and respond to parent queries
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="responded">Responded</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recipient:</label>
              <select
                value={filterRecipient}
                onChange={(e) => setFilterRecipient(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Recipients</option>
                <option value="admin">Administrator</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
          </div>
        </div>

        {/* Queries List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredQueries.length === 0 ? (
            <div className="p-8 text-center">
              <FaQuestionCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No queries found
              </h3>
              <p className="text-gray-600">
                {queries.length === 0 
                  ? "No queries have been submitted yet." 
                  : "No queries match the current filters."}
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
                      
                      <div className="text-sm text-gray-600 mb-3 space-y-1">
                        <p><strong>From:</strong> {getParentName(query.parent_id)}</p>
                        <p><strong>About:</strong> {getStudentName(query.student_id)}</p>
                        <p><strong>To:</strong> {getRecipientName(query)}</p>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-gray-800">{query.message}</p>
                      </div>
                      
                      {query.response && (
                        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400 mb-3">
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
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      {query.status === 'pending' && (
                        <button
                          onClick={() => handleRespond(query)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                          <FaReply className="mr-2" />
                          Respond
                        </button>
                      )}
                      
                      <select
                        value={query.status}
                        onChange={(e) => handleStatusChange(query.id, e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="responded">Responded</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Response Modal */}
      {showResponseModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Respond to Query
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Response:
                </label>
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your response..."
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowResponseModal(false);
                    setSelectedQuery(null);
                    setResponseText('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitResponse}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueriesPage; 