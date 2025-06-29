import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, examResultsAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { 
  FaSave, 
  FaUserGraduate, 
  FaSpinner
} from 'react-icons/fa';

const UploadResultsPage = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [examType, setExamType] = useState('quarterly');
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [results, setResults] = useState({});
  const [subjects, setSubjects] = useState(['math', 'english', 'science', 'social']);

  const examTypes = [
    { value: 'weekly', label: 'Weekly Test' },
    { value: 'quarterly', label: 'Quarterly Exam' },
    { value: 'half_yearly', label: 'Half Yearly Exam' },
    { value: 'annual', label: 'Annual Exam' }
  ];

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const allStudents = await studentsAPI.getAll();
      const classStudents = allStudents.filter(
        s => s.class === user.class && s.section === user.section
      );
      setStudents(classStudents);
      
      // Initialize results
      const initialResults = {};
      classStudents.forEach(student => {
        initialResults[student.id] = {};
        subjects.forEach(subject => {
          initialResults[student.id][subject] = '';
        });
      });
      setResults(initialResults);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [user.class, user.section, subjects]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

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
    for (const studentId in results) {
      const studentResults = results[studentId];
      for (const subject of subjects) {
        const score = studentResults[subject];
        if (score === '') {
          toast.error(`Please enter ${subject} score for all students`);
          return false;
        }
        const numScore = parseFloat(score);
        if (isNaN(numScore) || numScore < 0 || numScore > 100) {
          toast.error(`Invalid score for ${subject}. Must be between 0-100`);
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
      
      for (const studentId in results) {
        const studentResults = results[studentId];
        const scores = {};
        
        subjects.forEach(subject => {
          scores[subject] = parseFloat(studentResults[subject]);
        });

        await examResultsAPI.create({
          student_id: studentId,
          exam_type: examType,
          scores,
          date: examDate
        });
      }

      toast.success('Results uploaded successfully!');
      
      // Reset form
      const initialResults = {};
      students.forEach(student => {
        initialResults[student.id] = {};
        subjects.forEach(subject => {
          initialResults[student.id][subject] = '';
        });
      });
      setResults(initialResults);
    } catch (error) {
      toast.error('Failed to upload results');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = () => {
    const newSubject = prompt('Enter subject name:');
    if (newSubject && !subjects.includes(newSubject.toLowerCase())) {
      setSubjects([...subjects, newSubject.toLowerCase()]);
      
      // Add the new subject to all students' results
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

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
            Class {user?.class}-{user?.section} - {students.length} students
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
            
            <div className="flex items-end">
              <button
                onClick={addSubject}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Add Subject
              </button>
            </div>
          </div>
        </div>

        {/* Subjects */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subjects</h2>
          <div className="flex flex-wrap gap-2">
            {subjects.map(subject => (
              <div
                key={subject}
                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
              >
                <span className="capitalize">{subject}</span>
                <button
                  onClick={() => removeSubject(subject)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Student Results</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  {subjects.map(subject => (
                    <th key={subject} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{subject}</span>
                        <button
                          onClick={() => removeSubject(subject)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FaUserGraduate className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {student.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    {subjects.map(subject => (
                      <td key={subject} className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={results[student.id]?.[subject] || ''}
                          onChange={(e) => handleResultChange(student.id, subject, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0-100"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={saveResults}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaSave className="mr-2" />
            )}
            Upload Results
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadResultsPage; 