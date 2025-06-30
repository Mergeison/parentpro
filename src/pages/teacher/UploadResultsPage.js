import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, examResultsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaSave, 
  FaUserGraduate, 
  FaSpinner,
  FaCheck,
  FaTimes,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const UploadResultsPage = () => {
  const { user } = useAuth();
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState('quarterly');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState({});
  const [subjects, setSubjects] = useState(['math', 'english', 'science', 'social']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedCount, setUploadedCount] = useState(0);

  const examTypes = [
    { value: 'weekly', label: 'Weekly Test' },
    { value: 'quarterly', label: 'Quarterly Exam' },
    { value: 'half_yearly', label: 'Half Yearly Exam' },
    { value: 'annual', label: 'Annual Exam' }
  ];

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const students = await studentsAPI.getAll();
      setAllStudents(students);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Get unique classes and sections
  const classes = [...new Set(allStudents.map(s => s.class))].sort();
  const sections = [...new Set(allStudents.map(s => s.section))].sort();

  // Filter students based on search term, class, and section
  const filteredStudents = allStudents.filter(student => {
    const matchesName = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       student.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || student.class === selectedClass;
    const matchesSection = !selectedSection || student.section === selectedSection;
    
    return matchesName && matchesClass && matchesSection;
  });

  const handleStudentSelection = (studentId, isSelected) => {
    if (isSelected) {
      setSelectedStudents(prev => [...prev, studentId]);
      // Initialize results for the selected student
      setResults(prev => ({
        ...prev,
        [studentId]: subjects.reduce((acc, subject) => {
          acc[subject] = '';
          return acc;
        }, {})
      }));
    } else {
      setSelectedStudents(prev => prev.filter(id => id !== studentId));
      // Remove results for the deselected student
      setResults(prev => {
        const { [studentId]: removed, ...rest } = prev;
        return rest;
      });
    }
  };

  const selectAllStudents = () => {
    const allStudentIds = filteredStudents.map(s => s.id);
    setSelectedStudents(allStudentIds);
    
    // Initialize results for all students
    const initialResults = {};
    allStudentIds.forEach(studentId => {
      initialResults[studentId] = subjects.reduce((acc, subject) => {
        acc[subject] = '';
        return acc;
      }, {});
    });
    setResults(initialResults);
  };

  const deselectAllStudents = () => {
    setSelectedStudents([]);
    setResults({});
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedClass('');
    setSelectedSection('');
  };

  const handleResultChange = (studentId, subject, value) => {
    setResults(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subject]: value
      }
    }));
  };

  const validateResults = () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return false;
    }

    for (const studentId of selectedStudents) {
      const studentResults = results[studentId];
      if (!studentResults) continue;
      
      for (const subject of subjects) {
        const score = studentResults[subject];
        if (score === '') {
          const student = allStudents.find(s => s.id === studentId);
          toast.error(`Please enter ${subject} score for ${student?.name}`);
          return false;
        }
        const numScore = parseFloat(score);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
          const student = allStudents.find(s => s.id === studentId);
          toast.error(`Invalid score for ${student?.name} in ${subject}. Must be between 0-100`);
          return false;
        }
      }
    }
    return true;
  };

  const saveResults = async () => {
    if (!validateResults()) return;

    try {
      setLoading(true);
      
      const savedResults = [];
      const errors = [];
      
      for (const studentId of selectedStudents) {
        const studentResults = results[studentId];
        const scores = {};
        
        subjects.forEach(subject => {
          scores[subject] = parseFloat(studentResults[subject]);
        });

        try {
          const savedResult = await examResultsAPI.create({
            student_id: studentId,
            exam_type: examType,
            scores,
            date: examDate
          });
          savedResults.push(savedResult);
        } catch (error) {
          const student = allStudents.find(s => s.id === studentId);
          errors.push(`Failed to save results for ${student?.name}: ${error.message}`);
        }
      }

      if (savedResults.length > 0) {
        toast.success(`Successfully uploaded results for ${savedResults.length} student(s)!`);
        
        // Reset form
        setSelectedStudents([]);
        setResults({});
        setUploadSuccess(true);
        setUploadedCount(savedResults.length);
      }
      
      if (errors.length > 0) {
        toast.error(`Some results failed to upload: ${errors.join(', ')}`);
      }
      
    } catch (error) {
      console.error('Error uploading results:', error);
      toast.error('Failed to upload results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    const newSubject = prompt('Enter subject name:');
    if (newSubject && !subjects.includes(newSubject.toLowerCase())) {
      setSubjects([...subjects, newSubject.toLowerCase()]);
      
      // Add the new subject to all selected students' results
      setResults(prev => {
        const updated = {};
        for (const studentId in prev) {
          updated[studentId] = {
            ...prev[studentId],
            [newSubject.toLowerCase()]: ''
          };
        }
        return updated;
      });
    }
  };

  const removeSubject = (subjectToRemove) => {
    if (subjects.length <= 1) {
      toast.error('At least one subject is required');
      return;
    }
    
    setSubjects(subjects.filter(s => s !== subjectToRemove));
    
    // Remove the subject from all students' results
    setResults(prev => {
      const updated = {};
      for (const studentId in prev) {
        const { [subjectToRemove]: removed, ...rest } = prev[studentId];
        updated[studentId] = rest;
      }
      return updated;
    });
  };

  if (loading && allStudents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FaSpinner className="animate-spin h-12 w-12 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Upload Exam Results
          </h1>
          <p className="mt-2 text-gray-600">
            Total students: {allStudents.length} | Filtered: {filteredStudents.length} | Selected: {selectedStudents.length}
          </p>
        </div>

        {/* Exam Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Exam Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {examTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selected Students
              </label>
              <div className="text-lg font-semibold text-blue-600">
                {selectedStudents.length} of {filteredStudents.length}
              </div>
            </div>
          </div>
        </div>

        {/* Student Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Select Students
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={selectAllStudents}
                className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Select All
              </button>
              <button
                onClick={deselectAllStudents}
                className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>

            {/* Class and Section Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>
                      Class {cls}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Sections</option>
                  {sections.map(section => (
                    <option key={section} value={section}>
                      Section {section}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Students List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudents.includes(student.id);
              return (
                <div
                  key={student.id}
                  onClick={() => handleStudentSelection(student.id, !isSelected)}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {isSelected && <FaCheck className="w-2 h-2 text-white" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">
                          Class {student.class}-{student.section} | ID: {student.id}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No students found matching the current filters.
            </div>
          )}
        </div>

        {/* Subjects Management */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Subjects</h2>
            <button
              onClick={addSubject}
              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              Add Subject
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <div
                key={subject}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full"
              >
                <span className="text-sm font-medium capitalize">{subject}</span>
                {subjects.length > 1 && (
                  <button
                    onClick={() => removeSubject(subject)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Results Entry */}
        {selectedStudents.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Enter Results ({selectedStudents.length} students)
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    {subjects.map((subject) => (
                      <th key={subject} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {subject.charAt(0).toUpperCase() + subject.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedStudents.map((studentId) => {
                    const student = allStudents.find(s => s.id === studentId);
                    return (
                      <tr key={studentId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <FaUserGraduate className="h-5 w-5 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {student?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                Class {student?.class}-{student?.section} | {student?.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        {subjects.map((subject) => (
                          <td key={subject} className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={results[studentId]?.[subject] || ''}
                              onChange={(e) => handleResultChange(studentId, subject, e.target.value)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                              placeholder="0-100"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Save Button */}
        {selectedStudents.length > 0 && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={saveResults}
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSave className="mr-2" />
              )}
              Upload Results
            </button>
          </div>
        )}

        {/* Success Modal */}
        {uploadSuccess && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <FaCheck className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Successful!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Results have been successfully uploaded for {uploadedCount} student(s).
                </p>
                
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={() => {
                      setUploadSuccess(false);
                      setUploadedCount(0);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Continue
                  </button>
                  <button
                    onClick={() => {
                      setUploadSuccess(false);
                      setUploadedCount(0);
                      // Navigate to results page or refresh
                      window.location.reload();
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    View Results
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

export default UploadResultsPage; 