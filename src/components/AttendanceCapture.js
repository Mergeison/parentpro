import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FaCamera, FaCheck, FaTimes, FaSpinner, FaUser, FaCalendar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { studentsAPI, attendanceAPI } from '../services/api';

const AttendanceCapture = () => {
  const { user } = useAuth();
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(user?.class || '');
  const [selectedSection, setSelectedSection] = useState(user?.section || '');
  const [selectedTime, setSelectedTime] = useState('morning');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [currentStudentIndex, setCurrentStudentIndex] = useState(0);

  const timeSlots = [
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'evening', label: 'Evening', icon: '🌆' }
  ];

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  const loadStudents = useCallback(async () => {
    if (!selectedClass || !selectedSection) return;
    
    try {
      setLoading(true);
      const allStudents = await studentsAPI.getAll();
      const classStudents = allStudents.filter(
        s => s.class === selectedClass && s.section === selectedSection
      );
      setStudents(classStudents);
      
      // Initialize attendance state
      const initialAttendance = {};
      classStudents.forEach(student => {
        initialAttendance[student.id] = {
          present: false,
          image: null,
          timestamp: null
        };
      });
      setAttendance(initialAttendance);
      setCurrentStudentIndex(0);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedSection]);

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
    }
  }, []);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const confirmAttendance = async (studentId, isPresent) => {
    const currentStudent = students[currentStudentIndex];
    
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        present: isPresent,
        image: isPresent ? capturedImage : null,
        timestamp: new Date().toISOString()
      }
    }));

    if (isPresent) {
      toast.success(`${currentStudent.name} marked as present`);
    } else {
      toast.info(`${currentStudent.name} marked as absent`);
    }

    // Move to next student
    if (currentStudentIndex < students.length - 1) {
      setCurrentStudentIndex(currentStudentIndex + 1);
      setCapturedImage(null);
    } else {
      // All students processed
      await saveAttendance();
    }
  };

  const saveAttendance = async () => {
    try {
      setLoading(true);
      
      const attendanceRecords = Object.entries(attendance).map(([studentId, data]) => ({
        student_id: studentId,
        date: selectedDate,
        [selectedTime]: data.present,
        captured_images: {
          [selectedTime]: data.image || ''
        }
      }));

      // Save each attendance record
      for (const record of attendanceRecords) {
        await attendanceAPI.create(record);
      }

      toast.success('Attendance saved successfully!');
      
      // Reset for next session
      setAttendance({});
      setCurrentStudentIndex(0);
      setCapturedImage(null);
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStudent = () => {
    return students[currentStudentIndex];
  };

  const getProgressPercentage = () => {
    return ((currentStudentIndex + 1) / students.length) * 100;
  };

  if (!selectedClass || !selectedSection) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Class & Section</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls} value={cls}>Class {cls}</option>
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
                  <option value="">Select Section</option>
                  {sections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={loadStudents}
              disabled={!selectedClass || !selectedSection}
              className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Load Students
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && students.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Students Found</h2>
            <p className="text-gray-600 mb-6">
              No students found for Class {selectedClass} Section {selectedSection}
            </p>
            <button
              onClick={() => {
                setSelectedClass('');
                setSelectedSection('');
              }}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Select Different Class
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentStudent = getCurrentStudent();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Take Attendance - Class {selectedClass}-{selectedSection}
            </h1>
            <div className="text-sm text-gray-500">
              {currentStudentIndex + 1} of {students.length} students
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendar className="inline mr-2" />
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>
              <select
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {timeSlots.map(slot => (
                  <option key={slot.value} value={slot.value}>
                    {slot.icon} {slot.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedClass('');
                  setSelectedSection('');
                }}
                className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
              >
                Change Class
              </button>
            </div>
          </div>
        </div>

        {/* Current Student Info */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FaUser className="h-12 w-12 text-gray-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {currentStudent?.name}
            </h2>
            <p className="text-gray-600">
              Student ID: {currentStudent?.id}
            </p>
          </div>
        </div>

        {/* Camera Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Capture Photo</h3>
              <div className="relative">
                {!capturedImage ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={capturePhoto}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center"
                    >
                      <FaCamera className="mr-2" />
                      Capture Photo
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={retakePhoto}
                      className="mt-4 w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 flex items-center justify-center"
                    >
                      <FaCamera className="mr-2" />
                      Retake Photo
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Attendance Actions */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mark Attendance</h3>
              <div className="space-y-4">
                <button
                  onClick={() => confirmAttendance(currentStudent.id, true)}
                  disabled={!capturedImage || loading}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FaCheck className="mr-2" />
                  Mark Present
                </button>
                
                <button
                  onClick={() => confirmAttendance(currentStudent.id, false)}
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <FaTimes className="mr-2" />
                  Mark Absent
                </button>
                
                {loading && (
                  <div className="flex items-center justify-center py-4">
                    <FaSpinner className="animate-spin h-6 w-6 text-blue-600 mr-2" />
                    <span className="text-gray-600">Saving attendance...</span>
                  </div>
                )}
              </div>
              
              {/* Instructions */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Capture a clear photo of the student</li>
                  <li>• Click "Mark Present" if photo is captured successfully</li>
                  <li>• Click "Mark Absent" if student is not present</li>
                  <li>• Attendance will be saved automatically</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCapture; 