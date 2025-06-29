import axios from 'axios';

// Mock data for demonstration
const mockData = {
  students: [
    { id: 'student1', name: 'Alice Johnson', class: '10', section: 'A', photo_url: '', parent_id: 'parent1' },
    { id: 'student2', name: 'Bob Smith', class: '10', section: 'A', photo_url: '', parent_id: 'parent1' },
    { id: 'student3', name: 'Charlie Brown', class: '9', section: 'B', photo_url: '', parent_id: 'parent2' }
  ],
  teachers: [
    { id: 'teacher1', name: 'John Teacher', class: '10', section: 'A', phone: '1234567890', photo_url: '' },
    { id: 'teacher2', name: 'Jane Teacher', class: '9', section: 'B', phone: '0987654321', photo_url: '' }
  ],
  parents: [
    { id: 'parent1', father_name: 'John Parent', mother_name: 'Mary Parent', children_ids: ['student1', 'student2'], phone: '5551234567' },
    { id: 'parent2', father_name: 'Bob Parent', mother_name: 'Alice Parent', children_ids: ['student3'], phone: '5559876543' }
  ],
  attendance: [
    { id: 'att1', student_id: 'student1', date: '2024-01-15', morning: true, afternoon: true, evening: false, captured_images: { morning: '', afternoon: '', evening: '' } },
    { id: 'att2', student_id: 'student2', date: '2024-01-15', morning: true, afternoon: false, evening: true, captured_images: { morning: '', afternoon: '', evening: '' } }
  ],
  examResults: [
    { id: 'exam1', student_id: 'student1', exam_type: 'quarterly', scores: { math: 90, english: 85, science: 88 }, date: '2024-01-10' },
    { id: 'exam2', student_id: 'student2', exam_type: 'quarterly', scores: { math: 78, english: 92, science: 85 }, date: '2024-01-10' }
  ],
  queries: [
    { id: 'query1', parent_id: 'parent1', student_id: 'student1', message: 'When is the next parent-teacher meeting?', status: 'pending', date: '2024-01-14' }
  ]
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// API base configuration
const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Replace with actual backend URL
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Mock API functions
export const authAPI = {
  login: async (credentials) => {
    await delay(500);
    const mockUsers = {
      'admin@school.com': { id: '1', name: 'Admin User', role: 'admin', password: 'admin123' },
      'teacher@school.com': { id: '2', name: 'John Teacher', role: 'teacher', class: '10', section: 'A', password: 'teacher123' },
      'parent@school.com': { id: '3', name: 'Parent User', role: 'parent', children: ['student1', 'student2'], password: 'parent123' }
    };

    const user = mockUsers[credentials.email];
    if (user && user.password === credentials.password) {
      return { success: true, user, token: 'mock-jwt-token' };
    }
    throw new Error('Invalid credentials');
  }
};

export const studentsAPI = {
  getAll: async () => {
    await delay(300);
    return mockData.students;
  },
  
  getById: async (id) => {
    await delay(200);
    const student = mockData.students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    return student;
  },
  
  create: async (studentData) => {
    await delay(400);
    const newStudent = {
      id: `student${Date.now()}`,
      ...studentData,
      photo_url: ''
    };
    mockData.students.push(newStudent);
    return newStudent;
  },
  
  update: async (id, updates) => {
    await delay(300);
    const index = mockData.students.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Student not found');
    mockData.students[index] = { ...mockData.students[index], ...updates };
    return mockData.students[index];
  }
};

export const teachersAPI = {
  getAll: async () => {
    await delay(300);
    return mockData.teachers;
  },
  
  create: async (teacherData) => {
    await delay(400);
    const newTeacher = {
      id: `teacher${Date.now()}`,
      ...teacherData,
      photo_url: ''
    };
    mockData.teachers.push(newTeacher);
    return newTeacher;
  }
};

export const parentsAPI = {
  getAll: async () => {
    await delay(300);
    return mockData.parents;
  },
  
  create: async (parentData) => {
    await delay(400);
    const newParent = {
      id: `parent${Date.now()}`,
      ...parentData,
      children_ids: []
    };
    mockData.parents.push(newParent);
    return newParent;
  }
};

export const attendanceAPI = {
  getByStudent: async (studentId, range = 'monthly') => {
    await delay(300);
    return mockData.attendance.filter(a => a.student_id === studentId);
  },
  
  getByClass: async (classId, section, date) => {
    await delay(300);
    const students = mockData.students.filter(s => s.class === classId && s.section === section);
    const studentIds = students.map(s => s.id);
    return mockData.attendance.filter(a => studentIds.includes(a.student_id) && a.date === date);
  },
  
  create: async (attendanceData) => {
    await delay(400);
    const newAttendance = {
      id: `att${Date.now()}`,
      ...attendanceData
    };
    mockData.attendance.push(newAttendance);
    return newAttendance;
  },
  
  update: async (id, updates) => {
    await delay(300);
    const index = mockData.attendance.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Attendance record not found');
    mockData.attendance[index] = { ...mockData.attendance[index], ...updates };
    return mockData.attendance[index];
  }
};

export const examResultsAPI = {
  getByStudent: async (studentId) => {
    await delay(300);
    return mockData.examResults.filter(e => e.student_id === studentId);
  },
  
  create: async (examData) => {
    await delay(400);
    const newExam = {
      id: `exam${Date.now()}`,
      ...examData
    };
    mockData.examResults.push(newExam);
    return newExam;
  }
};

export const queriesAPI = {
  getByStudent: async (studentId) => {
    await delay(300);
    return mockData.queries.filter(q => q.student_id === studentId);
  },
  
  create: async (queryData) => {
    await delay(400);
    const newQuery = {
      id: `query${Date.now()}`,
      ...queryData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0]
    };
    mockData.queries.push(newQuery);
    return newQuery;
  }
};

export default api; 