import React, { useState, useEffect } from 'react';
import { FaChartBar, FaChartLine, FaFilter, FaDownload, FaEye, FaCalendarAlt, FaGraduationCap, FaTrophy, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, examResultsAPI, attendanceAPI } from '../../services/api';

const ReportsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('results');
  const [allResults, setAllResults] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [resultToDelete, setResultToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resultsData, studentsData] = await Promise.all([
          examResultsAPI.getAll(),
          studentsAPI.getAll()
        ]);
        
        // Sort results by date (newest first)
        resultsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllResults(resultsData);
        setAllStudents(studentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredResults = () => {
    let filtered = allResults;
    
    if (selectedClass !== 'all') {
      const classStudents = allStudents.filter(s => s.class === selectedClass);
      const studentIds = classStudents.map(s => s.id);
      filtered = filtered.filter(r => studentIds.includes(r.student_id));
    }
    
    if (selectedExamType !== 'all') {
      filtered = filtered.filter(r => r.exam_type === selectedExamType);
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(r => r.date.startsWith(selectedYear));
    }
    
    return filtered;
  };

  const getStudentName = (studentId) => {
    const student = allStudents.find(s => s.id === studentId);
    return student ? `${student.name} (Class ${student.class}-${student.section})` : 'Unknown Student';
  };

  const getExamTypeLabel = (examType) => {
    const labels = {
      'weekly': 'Weekly Test',
      'quarterly': 'Quarterly Exam',
      'half_yearly': 'Half Yearly Exam',
      'annual': 'Annual Exam'
    };
    return labels[examType] || examType;
  };

  const calculateAverage = (scores) => {
    const values = Object.values(scores).map(Number);
    return values.reduce((sum, score) => sum + score, 0) / values.length;
  };

  const getGrade = (average) => {
    if (average >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (average >= 80) return { grade: 'A', color: 'text-green-500' };
    if (average >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (average >= 60) return { grade: 'B', color: 'text-blue-500' };
    if (average >= 50) return { grade: 'C+', color: 'text-yellow-600' };
    if (average >= 40) return { grade: 'C', color: 'text-yellow-500' };
    return { grade: 'D', color: 'text-red-600' };
  };

  const getUniqueClasses = () => {
    return [...new Set(allStudents.map(s => s.class))].sort();
  };

  const getUniqueExamTypes = () => {
    return [...new Set(allResults.map(r => r.exam_type))];
  };

  const getUniqueYears = () => {
    return [...new Set(allResults.map(r => r.date.split('-')[0]))].sort().reverse();
  };

  const handleDeleteResult = async () => {
    if (!resultToDelete) return;
    
    try {
      await examResultsAPI.delete(resultToDelete.id);
      setAllResults(prev => prev.filter(r => r.id !== resultToDelete.id));
      setShowDeleteModal(false);
      setResultToDelete(null);
    } catch (error) {
      console.error('Error deleting result:', error);
    }
  };

  const filteredResults = getFilteredResults();

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
            Reports & Analytics
          </h1>
          <p className="mt-2 text-gray-600">
            View attendance and performance reports, manage exam results
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('results')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaChartBar className="inline mr-2" />
                Exam Results
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'attendance'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaCalendarAlt className="inline mr-2" />
                Attendance Reports
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaChartLine className="inline mr-2" />
                Performance Analytics
              </button>
            </nav>
          </div>
        </div>

        {/* Exam Results Tab */}
        {activeTab === 'results' && (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <FaFilter className="text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaGraduationCap className="inline mr-1" />
                    Class
                  </label>
                  <select
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Classes</option>
                    {getUniqueClasses().map(cls => (
                      <option key={cls} value={cls}>
                        Class {cls}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaChartBar className="inline mr-1" />
                    Exam Type
                  </label>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Exam Types</option>
                    {getUniqueExamTypes().map(type => (
                      <option key={type} value={type}>
                        {getExamTypeLabel(type)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCalendarAlt className="inline mr-1" />
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Years</option>
                    {getUniqueYears().map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-end space-x-2">
                  <button
                    onClick={() => {
                      setSelectedClass('all');
                      setSelectedExamType('all');
                      setSelectedYear('all');
                    }}
                    className="flex-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                  >
                    Clear Filters
                  </button>
                  <button className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    <FaDownload className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Summary Statistics */}
            {filteredResults.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FaChartBar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Results</p>
                      <p className="text-2xl font-semibold text-gray-900">{filteredResults.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FaTrophy className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Best Average</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {Math.max(...filteredResults.map(r => calculateAverage(r.scores))).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FaChartLine className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Overall Average</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {(filteredResults.reduce((sum, r) => sum + calculateAverage(r.scores), 0) / filteredResults.length).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FaEye className="h-6 w-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Students</p>
                      <p className="text-2xl font-semibold text-gray-900">
                        {new Set(filteredResults.map(r => r.student_id)).size}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredResults.length === 0 ? (
                <div className="p-8 text-center">
                  <FaChartBar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No results found
                  </h3>
                  <p className="text-gray-600">
                    {allResults.length === 0 
                      ? "No exam results have been uploaded yet." 
                      : "No results match the current filters."}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredResults.map((result) => {
                    const average = calculateAverage(result.scores);
                    const grade = getGrade(average);
                    const studentName = getStudentName(result.student_id);
                    
                    return (
                      <div key={result.id} className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-medium text-gray-900">
                              {getExamTypeLabel(result.exam_type)}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {studentName} • {new Date(result.date).toLocaleDateString()}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${grade.color}`}>
                                {grade.grade}
                              </div>
                              <div className="text-sm text-gray-500">
                                {average.toFixed(1)}% Average
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {/* Edit functionality */}}
                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                                title="Edit Result"
                              >
                                <FaEdit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setResultToDelete(result);
                                  setShowDeleteModal(true);
                                }}
                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                                title="Delete Result"
                              >
                                <FaTrash className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Subject Scores */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(result.scores).map(([subject, score]) => (
                            <div key={subject} className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm font-medium text-gray-700 capitalize">
                                {subject}
                              </div>
                              <div className="text-lg font-semibold text-gray-900">
                                {score}%
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Attendance Reports Tab */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Attendance Reports
            </h2>
            <p className="text-gray-600">
              Attendance reporting functionality will be implemented here.
            </p>
          </div>
        )}

        {/* Performance Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Performance Analytics
            </h2>
            <p className="text-gray-600">
              Performance analytics and charts will be implemented here.
            </p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Delete Exam Result
                </h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this exam result? This action cannot be undone.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setResultToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteResult}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage; 