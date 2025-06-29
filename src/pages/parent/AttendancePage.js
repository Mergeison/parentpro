import React, { useState, useEffect } from 'react';
import { FaCalendarCheck, FaCalendarAlt, FaFilter, FaDownload, FaEye, FaChartBar, FaUser, FaClock, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { studentsAPI, attendanceAPI } from '../../services/api';

const AttendancePage = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [viewMode, setViewMode] = useState('monthly'); // monthly, weekly, daily
  const [showPhoto, setShowPhoto] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadAttendanceRecords();
    }
  }, [selectedChild, filterDate, filterMonth, viewMode]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const allStudents = await studentsAPI.getAll();
      // Filter students based on parent's children IDs
      const parentChildren = allStudents.filter(student => 
        user?.children?.includes(student.id)
      );
      setChildren(parentChildren);
      
      if (parentChildren.length > 0) {
        setSelectedChild(parentChildren[0].id);
      }
    } catch (error) {
      toast.error('Failed to load children information');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendanceRecords = async () => {
    if (!selectedChild) return;
    
    try {
      setLoading(true);
      const records = await attendanceAPI.getByStudent(selectedChild);
      
      // Filter based on view mode
      let filteredRecords = records;
      if (viewMode === 'daily') {
        filteredRecords = records.filter(r => r.date === filterDate);
      } else if (viewMode === 'monthly') {
        filteredRecords = records.filter(r => r.date.startsWith(filterMonth));
      }
      
      setAttendanceRecords(filteredRecords);
    } catch (error) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStats = () => {
    if (attendanceRecords.length === 0) return { present: 0, absent: 0, total: 0, percentage: 0 };

    let present = 0;
    let absent = 0;
    let total = 0;

    attendanceRecords.forEach(record => {
      if (record.morning !== undefined) {
        total++;
        if (record.morning) present++;
        else absent++;
      }
      if (record.afternoon !== undefined) {
        total++;
        if (record.afternoon) present++;
        else absent++;
      }
      if (record.evening !== undefined) {
        total++;
        if (record.evening) present++;
        else absent++;
      }
    });

    return {
      present,
      absent,
      total,
      percentage: total > 0 ? Math.round((present / total) * 100) : 0
    };
  };

  const getAttendanceStatus = (record, timeSlot) => {
    const status = record[timeSlot];
    if (status === true) return 'present';
    if (status === false) return 'absent';
    return 'not-marked';
  };

  const getTimeSlotLabel = (timeSlot) => {
    const labels = {
      morning: '🌅 Morning',
      afternoon: '☀️ Afternoon', 
      evening: '🌆 Evening'
    };
    return labels[timeSlot] || timeSlot;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const exportAttendance = () => {
    const stats = getAttendanceStats();
    const selectedChildData = children.find(c => c.id === selectedChild);
    
    const csvContent = [
      ['Student Name', selectedChildData?.name || ''],
      ['Class', selectedChildData?.class || ''],
      ['Section', selectedChildData?.section || ''],
      ['Period', `${formatDate(filterDate)} - ${viewMode}`],
      [''],
      ['Date', 'Morning', 'Afternoon', 'Evening', 'Status'],
      ...attendanceRecords.map(record => [
        formatDate(record.date),
        record.morning ? 'Present' : record.morning === false ? 'Absent' : 'Not Marked',
        record.afternoon ? 'Present' : record.afternoon === false ? 'Absent' : 'Not Marked',
        record.evening ? 'Present' : record.evening === false ? 'Absent' : 'Not Marked',
        'Completed'
      ]),
      [''],
      ['Summary'],
      ['Total Days', stats.total],
      ['Present', stats.present],
      ['Absent', stats.absent],
      ['Attendance Percentage', `${stats.percentage}%`]
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedChildData?.name}_${filterMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Attendance exported successfully!');
  };

  const stats = getAttendanceStats();
  const selectedChildData = children.find(c => c.id === selectedChild);

  if (children.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Attendance Records
            </h1>
            <p className="mt-2 text-gray-600">
              View your children's attendance records
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FaUser className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No Children Found
            </h2>
            <p className="text-gray-600">
              No children are associated with your account. Please contact the school administration.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Attendance Records
          </h1>
          <p className="mt-2 text-gray-600">
            View your children's attendance records and statistics
          </p>
        </div>

        {/* Child Selection and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                Select Child
              </label>
              <select
                value={selectedChild}
                onChange={(e) => setSelectedChild(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.name} (Class {child.class}-{child.section})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                View Mode
              </label>
              <select
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="monthly">Monthly View</option>
                <option value="weekly">Weekly View</option>
                <option value="daily">Daily View</option>
              </select>
            </div>

            {viewMode === 'daily' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Select Date
                </label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {viewMode === 'monthly' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FaCalendarAlt className="inline mr-2" />
                  Select Month
                </label>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {selectedChildData && (
                <span>
                  Viewing attendance for <strong>{selectedChildData.name}</strong> 
                  (Class {selectedChildData.class}-{selectedChildData.section})
                </span>
              )}
            </div>
            <button
              onClick={exportAttendance}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FaChartBar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Days</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <FaCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Present</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <FaTimes className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FaCalendarCheck className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Attendance %</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.percentage}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Attendance Records
            </h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <FaSpinner className="animate-spin h-8 w-8 text-blue-600 mr-2" />
              <span className="text-gray-600">Loading attendance records...</span>
            </div>
          ) : attendanceRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Morning
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Afternoon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evening
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Photos
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatDate(record.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AttendanceStatus status={getAttendanceStatus(record, 'morning')} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AttendanceStatus status={getAttendanceStatus(record, 'afternoon')} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <AttendanceStatus status={getAttendanceStatus(record, 'evening')} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          {record.captured_images?.morning && (
                            <button
                              onClick={() => setShowPhoto({ image: record.captured_images.morning, time: 'Morning', date: record.date })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                          )}
                          {record.captured_images?.afternoon && (
                            <button
                              onClick={() => setShowPhoto({ image: record.captured_images.afternoon, time: 'Afternoon', date: record.date })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                          )}
                          {record.captured_images?.evening && (
                            <button
                              onClick={() => setShowPhoto({ image: record.captured_images.evening, time: 'Evening', date: record.date })}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <FaCalendarCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Attendance Records
              </h3>
              <p className="text-gray-600">
                No attendance records found for the selected period.
              </p>
            </div>
          )}
        </div>

        {/* Photo Modal */}
        {showPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Attendance Photo - {showPhoto.time}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {formatDate(showPhoto.date)}
              </p>
              <div className="mb-4">
                <img
                  src={showPhoto.image}
                  alt="Attendance Photo"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowPhoto(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Attendance Status Component
const AttendanceStatus = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'present':
        return { bg: 'bg-green-100', text: 'text-green-800', icon: <FaCheck className="h-3 w-3" />, label: 'Present' };
      case 'absent':
        return { bg: 'bg-red-100', text: 'text-red-800', icon: <FaTimes className="h-3 w-3" />, label: 'Absent' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: <FaClock className="h-3 w-3" />, label: 'Not Marked' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.icon}
      <span className="ml-1">{config.label}</span>
    </span>
  );
};

export default AttendancePage; 