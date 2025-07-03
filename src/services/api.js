import axios from 'axios';

// Configuration
const API_CONFIG = {
  // Set to 'mock' for development with mock data, 'real' for production with backend
  MODE: 'real',
  // Backend URL - hardcoded to deployed backend
  BACKEND_URL: 'http://44.203.99.138:8000/api',
  // Enable/disable API calls
  ENABLED: true
};

console.log('API Configuration:', API_CONFIG);
console.log('Environment REACT_APP_BACKEND_URL:', process.env.REACT_APP_BACKEND_URL);
console.log('Environment REACT_APP_API_MODE:', process.env.REACT_APP_API_MODE);

// Multi-tenant mock data for demonstration
const mockData = {
  schools: [
    {
      id: 'school1',
      name: "St. Mary's High School",
      domain: 'stmarys',
      address: '123 Education St, City',
      phone: '555-0101',
      email: 'admin@stmarys.edu',
      logo_url: '',
      settings: {
        time_slots: ['morning', 'afternoon', 'evening'],
        classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        sections: ['A', 'B', 'C', 'D', 'E']
      }
    },
    {
      id: 'school2',
      name: 'Bright Future Academy',
      domain: 'brightfuture',
      address: '456 Learning Ave, Town',
      phone: '555-0202',
      email: 'admin@brightfuture.edu',
      logo_url: '',
      settings: {
        time_slots: ['morning', 'afternoon'],
        classes: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        sections: ['A', 'B', 'C']
      }
    }
  ],
  tenants: {
    school1: {
      students: [
        { id: 'student1', name: 'Alice Johnson', class: '10', section: 'A', photo_url: '', parent_id: 'parent1', school_id: 'school1' },
        { id: 'student2', name: 'Bob Smith', class: '10', section: 'A', photo_url: '', parent_id: 'parent1', school_id: 'school1' },
        { id: 'student3', name: 'Charlie Brown', class: '9', section: 'B', photo_url: '', parent_id: 'parent2', school_id: 'school1' }
      ],
      teachers: [
        { id: 'teacher1', name: 'John Teacher', class: '10', section: 'A', phone: '1234567890', photo_url: '', school_id: 'school1' },
        { id: 'teacher2', name: 'Jane Teacher', class: '9', section: 'B', phone: '0987654321', photo_url: '', school_id: 'school1' }
      ],
      parents: [
        { id: 'parent1', father_name: 'John Parent', mother_name: 'Mary Parent', children_ids: ['student1', 'student2'], phone: '5551234567', school_id: 'school1' },
        { id: 'parent2', father_name: 'Bob Parent', mother_name: 'Alice Parent', children_ids: ['student3'], phone: '5559876543', school_id: 'school1' }
      ],
      attendance: [
        { id: 'att1', student_id: 'student1', date: '2024-01-15', morning: true, afternoon: true, evening: false, captured_images: { morning: '', afternoon: '', evening: '' }, school_id: 'school1' },
        { id: 'att2', student_id: 'student2', date: '2024-01-15', morning: true, afternoon: false, evening: true, captured_images: { morning: '', afternoon: '', evening: '' }, school_id: 'school1' }
      ],
      examResults: [
        { id: 'exam1', student_id: 'student1', exam_type: 'quarterly', scores: { math: 90, english: 85, science: 88 }, date: '2024-01-10', school_id: 'school1' },
        { id: 'exam2', student_id: 'student2', exam_type: 'quarterly', scores: { math: 78, english: 92, science: 85 }, date: '2024-01-10', school_id: 'school1' }
      ],
      queries: [
        { id: 'query1', parent_id: 'parent1', student_id: 'student1', message: 'When is the next parent-teacher meeting?', status: 'pending', date: '2024-01-14', school_id: 'school1' }
      ],
      fees: [
        { 
          id: 'fee1', 
          student_id: 'student1', 
          academic_year: '2024-2025',
          total_amount: 50000,
          paid_amount: 30000,
          remaining_amount: 20000,
          due_date: '2024-12-31',
          status: 'partial',
          school_id: 'school1',
          installments: [
            { id: 'inst1', amount: 15000, due_date: '2024-06-30', paid_date: '2024-06-15', status: 'paid' },
            { id: 'inst2', amount: 15000, due_date: '2024-09-30', paid_date: '2024-09-20', status: 'paid' },
            { id: 'inst3', amount: 10000, due_date: '2024-12-31', paid_date: null, status: 'pending' },
            { id: 'inst4', amount: 10000, due_date: '2025-03-31', paid_date: null, status: 'pending' }
          ]
        },
        { 
          id: 'fee2', 
          student_id: 'student2', 
          academic_year: '2024-2025',
          total_amount: 50000,
          paid_amount: 50000,
          remaining_amount: 0,
          due_date: '2024-12-31',
          status: 'paid',
          school_id: 'school1',
          installments: [
            { id: 'inst5', amount: 15000, due_date: '2024-06-30', paid_date: '2024-06-10', status: 'paid' },
            { id: 'inst6', amount: 15000, due_date: '2024-09-30', paid_date: '2024-09-15', status: 'paid' },
            { id: 'inst7', amount: 10000, due_date: '2024-12-31', paid_date: '2024-12-20', status: 'paid' },
            { id: 'inst8', amount: 10000, due_date: '2025-03-31', paid_date: '2025-03-15', status: 'paid' }
          ]
        }
      ]
    },
    school2: {
      students: [
        { id: 'student4', name: 'David Wilson', class: '8', section: 'A', photo_url: '', parent_id: 'parent3', school_id: 'school2' },
        { id: 'student5', name: 'Emma Davis', class: '9', section: 'B', photo_url: '', parent_id: 'parent4', school_id: 'school2' }
      ],
      teachers: [
        { id: 'teacher3', name: 'Sarah Teacher', class: '8', section: 'A', phone: '1112223333', photo_url: '', school_id: 'school2' },
        { id: 'teacher4', name: 'Mike Teacher', class: '9', section: 'B', phone: '4445556666', photo_url: '', school_id: 'school2' }
      ],
      parents: [
        { id: 'parent3', father_name: 'Tom Wilson', mother_name: 'Lisa Wilson', children_ids: ['student4'], phone: '7778889999', school_id: 'school2' },
        { id: 'parent4', father_name: 'James Davis', mother_name: 'Anna Davis', children_ids: ['student5'], phone: '0001112222', school_id: 'school2' }
      ],
      attendance: [
        { id: 'att3', student_id: 'student4', date: '2024-01-15', morning: true, afternoon: false, captured_images: { morning: '', afternoon: '' }, school_id: 'school2' },
        { id: 'att4', student_id: 'student5', date: '2024-01-15', morning: false, afternoon: true, captured_images: { morning: '', afternoon: '' }, school_id: 'school2' }
      ],
      examResults: [
        { id: 'exam3', student_id: 'student4', exam_type: 'quarterly', scores: { math: 85, english: 90, science: 82 }, date: '2024-01-10', school_id: 'school2' },
        { id: 'exam4', student_id: 'student5', exam_type: 'quarterly', scores: { math: 92, english: 88, science: 95 }, date: '2024-01-10', school_id: 'school2' }
      ],
      queries: [
        { id: 'query2', parent_id: 'parent3', student_id: 'student4', message: 'How is my child performing in class?', status: 'pending', date: '2024-01-14', school_id: 'school2' }
      ],
      fees: [
        { 
          id: 'fee3', 
          student_id: 'student4', 
          academic_year: '2024-2025',
          total_amount: 45000,
          paid_amount: 0,
          remaining_amount: 45000,
          due_date: '2024-12-31',
          status: 'unpaid',
          school_id: 'school2',
          installments: [
            { id: 'inst9', amount: 15000, due_date: '2024-06-30', paid_date: null, status: 'pending' },
            { id: 'inst10', amount: 15000, due_date: '2024-09-30', paid_date: null, status: 'pending' },
            { id: 'inst11', amount: 15000, due_date: '2024-12-31', paid_date: null, status: 'pending' }
          ]
        }
      ]
    }
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Get current school domain from localStorage
const getCurrentSchoolDomain = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const school = JSON.parse(localStorage.getItem('school') || '{}');
  
  // Check if school domain is in user object first
  if (user.school?.domain) {
    return user.school.domain;
  }
  
  // Check if school domain is in separate school object
  if (school.domain) {
    return school.domain;
  }
  
  // Default fallback
  return 'stmarys';
};

// API base configuration with tenant support
const createApiInstance = () => {
  const schoolDomain = getCurrentSchoolDomain();
  
  console.log(`🏫 Creating API instance for school domain: ${schoolDomain}`);
  console.log(`🌐 Using BACKEND_URL: ${API_CONFIG.BACKEND_URL}`);
  
  const api = axios.create({
    baseURL: API_CONFIG.BACKEND_URL,
    timeout: 10000,
  });

  // Request interceptor to add auth token and school domain
  api.interceptors.request.use((config) => {
    console.log(`🌐 Making API request to: ${config.baseURL}${config.url}`);
    console.log(`🏫 School Domain Header: ${schoolDomain}`);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
      console.log('🔑 Adding auth token to request');
    }
    // Add school domain header for multi-tenancy
    config.headers['X-School-Domain'] = schoolDomain;
    return config;
  });

  // Response interceptor for error handling
  api.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response received: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error('❌ API Error:', error.response?.status, error.response?.data);
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return api;
};

// Helper function to make API calls
const makeApiCall = async (apiCall, mockCall) => {
  if (!API_CONFIG.ENABLED) {
    throw new Error('API is disabled');
  }

  console.log(`🔧 API Call Mode: ${API_CONFIG.MODE}`);
  console.log(`🌐 Backend URL: ${API_CONFIG.BACKEND_URL}`);

  if (API_CONFIG.MODE === 'mock') {
    console.log('📱 Using MOCK data (no real API calls)');
    return mockCall();
  } else {
    console.log('🚀 Making REAL API call to backend');
    try {
      const result = await apiCall();
      console.log('✅ Real API call successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Real API call failed, falling back to mock:', error);
      console.log('📱 Falling back to MOCK data');
      return mockCall();
    }
  }
};

// API functions with real backend support
export const schoolsAPI = {
  getAll: async () => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get('/schools');
        return response.data;
      },
      async () => {
        await delay(300);
        return mockData.schools.map(s => ({ id: s.id, name: s.name, domain: s.domain }));
      }
    );
  },
  
  getByDomain: async (domain) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get(`/schools/${domain}`);
        return response.data;
      },
      async () => {
        await delay(200);
        const school = mockData.schools.find(s => s.domain === domain);
        if (!school) throw new Error('School not found');
        return school;
      }
    );
  }
};

export const authAPI = {
  login: async (credentials) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.post('/login', credentials);
        return response.data;
      },
      async () => {
        await delay(500);
        
        // Get school by domain
        const school = mockData.schools.find(s => s.domain === credentials.school_domain);
        if (!school) {
          throw new Error('School not found');
        }
        
        const mockUsers = {
          school1: {
            'admin@stmarys.edu': { id: '1', name: 'Admin User', role: 'admin', password: 'admin123', school_id: 'school1' },
            'teacher@stmarys.edu': { id: '2', name: 'John Teacher', role: 'teacher', class: '10', section: 'A', password: 'teacher123', school_id: 'school1' },
            'parent@stmarys.edu': { id: '3', name: 'Parent User', role: 'parent', children: ['student1', 'student2'], password: 'parent123', school_id: 'school1' }
          },
          school2: {
            'admin@brightfuture.edu': { id: '4', name: 'Admin User', role: 'admin', password: 'admin123', school_id: 'school2' },
            'teacher@brightfuture.edu': { id: '5', name: 'Sarah Teacher', role: 'teacher', class: '8', section: 'A', password: 'teacher123', school_id: 'school2' },
            'parent@brightfuture.edu': { id: '6', name: 'Parent User', role: 'parent', children: ['student4'], password: 'parent123', school_id: 'school2' }
          }
        };
        
        const schoolUsers = mockUsers[school.id] || {};
        const user = schoolUsers[credentials.email];
        
        if (user && user.password === credentials.password) {
          return { 
            success: true, 
            user: { ...user, password: undefined },
            school: { ...school, id: undefined },
            token: 'mock-jwt-token' 
          };
        }
        throw new Error('Invalid credentials');
      }
    );
  }
};

export const studentsAPI = {
  getAll: async () => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get('/students');
        return response.data;
      }
    );
  },
  
  getById: async (id) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get(`/students/${id}`);
        return response.data;
      }
    );
  },
  
  getByParent: async (parentId) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get(`/students?parent_id=${parentId}`);
        return response.data;
      }
    );
  },
  
  create: async (studentData) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.post('/students', studentData);
        return response.data;
      }
    );
  },
  
  update: async (id, updates) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.put(`/students/${id}`, updates);
        return response.data;
      }
    );
  }
};

export const teachersAPI = {
  getAll: async () => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get('/teachers');
        return response.data;
      },
      async () => {
        await delay(300);
        const schoolDomain = getCurrentSchoolDomain();
        const school = mockData.schools.find(s => s.domain === schoolDomain);
        return mockData.tenants[school.id].teachers;
      }
    );
  },
  
  create: async (teacherData) => {
    await delay(400);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const newTeacher = {
      id: `teacher${Date.now()}`,
      ...teacherData,
      photo_url: '',
      school_id: school.id
    };
    mockData.tenants[school.id].teachers.push(newTeacher);
    return newTeacher;
  }
};

export const parentsAPI = {
  getAll: async () => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get('/parents');
        return response.data;
      },
      async () => {
        await delay(300);
        const schoolDomain = getCurrentSchoolDomain();
        const school = mockData.schools.find(s => s.domain === schoolDomain);
        return mockData.tenants[school.id].parents;
      }
    );
  },
  
  create: async (parentData) => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.post('/parents', parentData);
        return response.data;
      }
    );
  }
};

export const attendanceAPI = {
  getByStudent: async (studentId, range = 'monthly') => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get(`/attendance/student/${studentId}?range=${range}`);
        return response.data;
      },
      async () => {
        await delay(300);
        const schoolDomain = getCurrentSchoolDomain();
        const school = mockData.schools.find(s => s.domain === schoolDomain);
        return mockData.tenants[school.id].attendance.filter(a => a.student_id === studentId);
      }
    );
  },
  
  getByClass: async (classId, section, date) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const students = mockData.tenants[school.id].students.filter(s => s.class === classId && s.section === section);
    const studentIds = students.map(s => s.id);
    return mockData.tenants[school.id].attendance.filter(a => studentIds.includes(a.student_id) && a.date === date);
  },
  
  create: async (attendanceData) => {
    await delay(400);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const newAttendance = {
      id: `att${Date.now()}`,
      ...attendanceData,
      school_id: school.id
    };
    mockData.tenants[school.id].attendance.push(newAttendance);
    return newAttendance;
  },
  
  update: async (id, updates) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const index = mockData.tenants[school.id].attendance.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Attendance record not found');
    mockData.tenants[school.id].attendance[index] = { ...mockData.tenants[school.id].attendance[index], ...updates };
    return mockData.tenants[school.id].attendance[index];
  }
};

export const examResultsAPI = {
  getAll: async () => {
    return makeApiCall(
      async () => {
        const api = createApiInstance();
        const response = await api.get('/exam-results');
        return response.data;
      },
      async () => {
        await delay(300);
        const schoolDomain = getCurrentSchoolDomain();
        const school = mockData.schools.find(s => s.domain === schoolDomain);
        return mockData.tenants[school.id].examResults;
      }
    );
  },
  
  getByStudent: async (studentId) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    return mockData.tenants[school.id].examResults.filter(e => e.student_id === studentId);
  },
  
  getByClass: async (classId, section = null) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    
    // Get students in the class
    const students = mockData.tenants[school.id].students.filter(s => 
      s.class === classId && (!section || s.section === section)
    );
    const studentIds = students.map(s => s.id);
    
    // Get results for these students
    return mockData.tenants[school.id].examResults.filter(e => studentIds.includes(e.student_id));
  },
  
  getByExamType: async (examType) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    return mockData.tenants[school.id].examResults.filter(e => e.exam_type === examType);
  },
  
  create: async (examData) => {
    await delay(400);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const newExam = {
      id: `exam${Date.now()}`,
      ...examData,
      school_id: school.id
    };
    mockData.tenants[school.id].examResults.push(newExam);
    return newExam;
  },
  
  update: async (id, updates) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const index = mockData.tenants[school.id].examResults.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Exam result not found');
    mockData.tenants[school.id].examResults[index] = { ...mockData.tenants[school.id].examResults[index], ...updates };
    return mockData.tenants[school.id].examResults[index];
  },
  
  delete: async (id) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const index = mockData.tenants[school.id].examResults.findIndex(e => e.id === id);
    if (index === -1) throw new Error('Exam result not found');
    const deleted = mockData.tenants[school.id].examResults.splice(index, 1)[0];
    return deleted;
  }
};

export const queriesAPI = {
  getAll: async () => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    return mockData.tenants[school.id].queries;
  },
  
  getByStudent: async (studentId) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    return mockData.tenants[school.id].queries.filter(q => q.student_id === studentId);
  },
  
  create: async (queryData) => {
    await delay(400);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const newQuery = {
      id: `query${Date.now()}`,
      ...queryData,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      school_id: school.id
    };
    mockData.tenants[school.id].queries.push(newQuery);
    return newQuery;
  },
  
  update: async (id, updates) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const index = mockData.tenants[school.id].queries.findIndex(q => q.id === id);
    if (index === -1) throw new Error('Query not found');
    mockData.tenants[school.id].queries[index] = { ...mockData.tenants[school.id].queries[index], ...updates };
    return mockData.tenants[school.id].queries[index];
  }
};

export const feesAPI = {
  getAll: async () => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    return mockData.tenants[school.id].fees;
  },
  
  getByStudent: async (studentId) => {
    await delay(200);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    return mockData.tenants[school.id].fees.filter(f => f.student_id === studentId);
  },
  
  getById: async (id) => {
    await delay(200);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const fee = mockData.tenants[school.id].fees.find(f => f.id === id);
    if (!fee) throw new Error('Fee record not found');
    return fee;
  },
  
  create: async (feeData) => {
    await delay(400);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const newFee = {
      id: `fee${Date.now()}`,
      ...feeData,
      paid_amount: 0,
      remaining_amount: feeData.total_amount,
      status: 'unpaid',
      school_id: school.id,
      installments: feeData.installments || []
    };
    mockData.tenants[school.id].fees.push(newFee);
    return newFee;
  },
  
  update: async (id, updates) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const index = mockData.tenants[school.id].fees.findIndex(f => f.id === id);
    if (index === -1) throw new Error('Fee record not found');
    mockData.tenants[school.id].fees[index] = { ...mockData.tenants[school.id].fees[index], ...updates };
    return mockData.tenants[school.id].fees[index];
  },
  
  recordPayment: async (feeId, installmentId, paymentData) => {
    await delay(400);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const feeIndex = mockData.tenants[school.id].fees.findIndex(f => f.id === feeId);
    if (feeIndex === -1) throw new Error('Fee record not found');
    
    const fee = mockData.tenants[school.id].fees[feeIndex];
    const installmentIndex = fee.installments.findIndex(inst => inst.id === installmentId);
    if (installmentIndex === -1) throw new Error('Installment not found');
    
    // Update installment
    fee.installments[installmentIndex] = {
      ...fee.installments[installmentIndex],
      paid_date: paymentData.paid_date || new Date().toISOString().split('T')[0],
      status: 'paid'
    };
    
    // Update fee totals
    const totalPaid = fee.installments.reduce((sum, inst) => sum + (inst.status === 'paid' ? inst.amount : 0), 0);
    fee.paid_amount = totalPaid;
    fee.remaining_amount = fee.total_amount - totalPaid;
    fee.status = totalPaid === fee.total_amount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
    
    return fee;
  },
  
  addInstallment: async (feeId, installmentData) => {
    await delay(300);
    const schoolDomain = getCurrentSchoolDomain();
    const school = mockData.schools.find(s => s.domain === schoolDomain);
    const feeIndex = mockData.tenants[school.id].fees.findIndex(f => f.id === feeId);
    if (feeIndex === -1) throw new Error('Fee record not found');
    
    const newInstallment = {
      id: `inst${Date.now()}`,
      ...installmentData,
      paid_date: null,
      status: 'pending'
    };
    
    mockData.tenants[school.id].fees[feeIndex].installments.push(newInstallment);
    
    // Recalculate total amount
    const fee = mockData.tenants[school.id].fees[feeIndex];
    fee.total_amount = fee.installments.reduce((sum, inst) => sum + inst.amount, 0);
    fee.remaining_amount = fee.total_amount - fee.paid_amount;
    
    return fee;
  }
};

// Export the API instance for direct use if needed
export const api = createApiInstance();

// Test function to verify data structure
export const testDataStructure = () => {
  console.log('=== Testing Data Structure ===');
  console.log('Mock Data Schools:', mockData.schools);
  console.log('Mock Data Tenants:', mockData.tenants);
  
  // Test parent-child relationships
  const school1Students = mockData.tenants.school1.students;
  const school1Parents = mockData.tenants.school1.parents;
  
  console.log('School 1 Students:', school1Students);
  console.log('School 1 Parents:', school1Parents);
  
  // Check if students have parent_id that matches any parent
  school1Students.forEach(student => {
    const parent = school1Parents.find(p => p.id === student.parent_id);
    console.log(`Student ${student.name} (${student.id}) -> Parent: ${parent ? parent.father_name + ' & ' + parent.mother_name : 'NOT FOUND'} (${student.parent_id})`);
  });
  
  // Check parent children_ids
  school1Parents.forEach(parent => {
    const children = school1Students.filter(s => parent.children_ids.includes(s.id));
    console.log(`Parent ${parent.father_name} & ${parent.mother_name} (${parent.id}) -> Children: ${children.map(c => c.name).join(', ')}`);
  });
};

// Call the test function
testDataStructure(); 