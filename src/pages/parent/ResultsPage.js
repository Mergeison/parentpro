import React, { useState, useEffect } from 'react';
import { FaChartBar, FaFilter, FaDownload, FaEye, FaCalendarAlt, FaGraduationCap, FaTrophy, FaChartLine, FaTrendingDown } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, examResultsAPI } from '../../services/api';

const ResultsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [children, setChildren] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedExamType, setSelectedExamType] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch parent's children
        const childrenData = await studentsAPI.getByParent(user.id);
        setChildren(childrenData);
        
        // Fetch all results for parent's children
        const allResultsData = [];
        for (const child of childrenData) {
          const childResults = await examResultsAPI.getByStudent(child.id);
          allResultsData.push(...childResults);
        }
        
        // Sort by date (newest first)
        allResultsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAllResults(allResultsData);
        
        // Set default selected child
        if (childrenData.length > 0) {
          setSelectedChild(childrenData[0].id);
        }
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const getFilteredResults = () => {
    let filtered = allResults;
    
    if (selectedChild !== 'all') {
      filtered = filtered.filter(r => r.student_id === selectedChild);
    }
    
    if (selectedExamType !== 'all') {
      filtered = filtered.filter(r => r.exam_type === selectedExamType);
    }
    
    if (selectedYear !== 'all') {
      filtered = filtered.filter(r => r.date.startsWith(selectedYear));
    }
    
    return filtered;
  };

  const getChildName = (studentId) => {
    const child = children.find(c => c.id === studentId);
    return child ? child.name : 'Unknown Child';
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

  const getPerformanceTrend = (results) => {
    if (results.length < 2) return 'stable';
    const sorted = results.sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstAvg = calculateAverage(sorted[0].scores);
    const lastAvg = calculateAverage(sorted[sorted.length - 1].scores);
    
    if (lastAvg > firstAvg + 5) return 'improving';
    if (lastAvg < firstAvg - 5) return 'declining';
    return 'stable';
  };

  const getUniqueExamTypes = () => {
    return [...new Set(allResults.map(r => r.exam_type))];
  };

  const getUniqueYears = () => {
    return [...new Set(allResults.map(r => r.date.split('-')[0]))].sort().reverse();
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
            Exam Results
          </h1>
          <p className="mt-2 text-gray-600">
            View your children's exam results and performance analytics
          </p>
        </div>

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
                Child
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Children</option>
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} - Class {child.class}-{child.section}
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
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedChild('all');
                  setSelectedExamType('all');
                  setSelectedYear('all');
                }}
                className="w-full px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
              >
                Clear Filters
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
                  <p className="text-sm font-medium text-gray-500">Total Exams</p>
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
                  <p className="text-sm font-medium text-gray-500">Subjects</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {Object.keys(filteredResults[0]?.scores || {}).length}
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
                const childName = getChildName(result.student_id);
                
                return (
                  <div key={result.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {getExamTypeLabel(result.exam_type)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {childName} • {new Date(result.date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${grade.color}`}>
                          {grade.grade}
                        </div>
                        <div className="text-sm text-gray-500">
                          {average.toFixed(1)}% Average
                        </div>
                      </div>
                    </div>
                    
                    {/* Subject Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                    
                    {/* Performance Indicators */}
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <FaChartLine className="text-green-500" />
                        <span className="text-gray-600">Performance tracking available</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsPage; 