import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaCamera, FaCheck, FaTimes, FaSpinner, FaUser, FaCalendar, FaClock, FaUsers, FaSave, FaEye } from 'react-icons/fa';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, attendanceAPI } from '../../services/api';

const TakeAttendancePage = () => {
  const { user } = useAuth();
  const webcamRef = useRef(null);
  
  // State management
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(user?.class || '');
  const [selectedSection, setSelectedSection] = useState(user?.section || '');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('morning');
  const [attendanceData, setAttendanceData] = useState({});
  const [showCamera, setShowCamera] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const timeSlots = [
    { value: 'morning', label: 'Morning', icon: '🌅' },
    { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
    { value: 'evening', label: 'Evening', icon: '🌆' }
  ];

  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const sections = ['A', 'B', 'C', 'D', 'E'];

  useEffect(() => {
    if (selectedClass && selectedSection) {
      loadStudents();
    }
  }, [selectedClass, selectedSection]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const allStudents = await studentsAPI.getAll();
      const classStudents = allStudents.filter(
        s => s.class === selectedClass && s.section === selectedSection
      );
      setStudents(classStudents);
      
      // Initialize attendance data
      const initialAttendance = {};
      classStudents.forEach(student => {
        initialAttendance[student.id] = {
          present: null,
          image: null,
          timestamp: null,
          note: ''
        };
      });
      setAttendanceData(initialAttendance);
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowCamera(false);
    }
  }, []);

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  const markAttendance = (studentId, isPresent) => {
    setCurrentStudent(students.find(s => s.id === studentId));
    
    if (isPresent) {
      setShowCamera(true);
    } else {
      // Mark absent without photo
      setAttendanceData(prev => ({
        ...prev,
        [studentId]: {
          present: false,
          image: null,
          timestamp: new Date().toISOString(),
          note: ''
        }
      }));
      toast.info(`${students.find(s => s.id === studentId).name} marked as absent`);
    }
  };

  const confirmPresentWithPhoto = () => {
    if (!capturedImage) {
      toast.error('Please capture a photo first');
      return;
    }

    setAttendanceData(prev => ({
      ...prev,
      [currentStudent.id]: {
        present: true,
        image: capturedImage,
        timestamp: new Date().toISOString(),
        note: ''
      }
    }));

    toast.success(`${currentStudent.name} marked as present with photo`);
    setCurrentStudent(null);
    setCapturedImage(null);
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      
      const attendanceRecords = Object.entries(attendanceData).map(([studentId, data]) => ({
        student_id: studentId,
        date: selectedDate,
        [selectedTime]: data.present,
        captured_images: {
          [selectedTime]: data.image || ''
        },
        note: data.note
      }));

      // Save each attendance record
      for (const record of attendanceRecords) {
        await attendanceAPI.create(record);
      }

      toast.success('Attendance saved successfully!');
      
      // Reset for next session
      setAttendanceData({});
      loadStudents(); // Reload to reset
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getAttendanceStatus = (studentId) => {
    const attendance = attendanceData[studentId];
    if (!attendance || attendance.present === null) return 'pending';
    return attendance.present ? 'present' : 'absent';
  };

  const getAttendanceCount = () => {
    const present = Object.values(attendanceData).filter(a => a.present === true).length;
    const absent = Object.values(attendanceData).filter(a => a.present === false).length;
    const pending = Object.values(attendanceData).filter(a => a.present === null).length;
    return { present, absent, pending };
  };

  const isAllMarked = () => {
    return Object.values(attendanceData).every(a => a.present !== null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Take Attendance
          </h1>
          <p className="mt-2 text-gray-600">
            Mark attendance for your class with photo capture
          </p>
        </div>

        {/* Class Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Class Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUsers className="inline mr-2" />
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
                <FaUsers className="inline mr-2" />
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
                <FaClock className="inline mr-2" />
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
          </div>
        </div>

        {/* Attendance Summary */}
        {students.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Attendance Summary
              </h2>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getAttendanceCount().present}
                  </div>
                  <div className="text-sm text-gray-500">Present</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {getAttendanceCount().absent}
                  </div>
                  <div className="text-sm text-gray-500">Absent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {getAttendanceCount().pending}
                  </div>
                  <div className="text-sm text-gray-500">Pending</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                Class {selectedClass}-{selectedSection} • {students.length} students
              </p>
              <button
                onClick={saveAttendance}
                disabled={!isAllMarked() || saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaSave className="mr-2" />
                )}
                Save Attendance
              </button>
            </div>
          </div>
        )}

        {/* Students List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mr-2" />
            <span className="text-gray-600">Loading students...</span>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Mark Attendance
              </h3>
            </div>
            <div className="divide-y divide-gray-200">
              {students.map((student) => {
                const status = getAttendanceStatus(student.id);
                const attendance = attendanceData[student.id];
                
                return (
                  <div key={student.id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          {student.photo_url ? (
                            <img
                              src={student.photo_url}
                              alt={student.name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                              <FaUser className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {student.id}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Status Indicator */}
                        <div className="text-sm">
                          {status === 'pending' && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                              Pending
                            </span>
                          )}
                          {status === 'present' && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                              <FaCheck className="mr-1" />
                              Present
                            </span>
                          )}
                          {status === 'absent' && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full flex items-center">
                              <FaTimes className="mr-1" />
                              Absent
                            </span>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        {status === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => markAttendance(student.id, true)}
                              className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center"
                            >
                              <FaCheck className="mr-1" />
                              Present
                            </button>
                            <button
                              onClick={() => markAttendance(student.id, false)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm flex items-center"
                            >
                              <FaTimes className="mr-1" />
                              Absent
                            </button>
                          </div>
                        )}
                        
                        {/* Show captured photo */}
                        {status === 'present' && attendance?.image && (
                          <button
                            onClick={() => {
                              setCapturedImage(attendance.image);
                              setCurrentStudent(student);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center"
                          >
                            <FaEye className="mr-1" />
                            View Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : selectedClass && selectedSection ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Students Found
            </h3>
            <p className="text-gray-600">
              No students found for Class {selectedClass} Section {selectedSection}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaUsers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select Class and Section
            </h3>
            <p className="text-gray-600">
              Please select a class and section to start taking attendance
            </p>
          </div>
        )}

        {/* Camera Modal for Photo Capture */}
        {showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Capture Photo for {currentStudent?.name}
              </h3>
              <div className="mb-4">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowCamera(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Capture
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Photo Preview Modal */}
        {capturedImage && currentStudent && !showCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Photo for {currentStudent.name}
              </h3>
              <div className="mb-4">
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={retakePhoto}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Retake
                </button>
                <button
                  onClick={confirmPresentWithPhoto}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Confirm Present
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TakeAttendancePage; 