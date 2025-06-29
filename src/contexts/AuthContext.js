import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      // Mock API call - replace with actual backend call
      const response = await mockLoginAPI(credentials);
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          name: response.user.name,
          role: response.user.role,
          token: response.token,
          ...response.user
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const mockLoginAPI = async (credentials) => {
    // Mock users for demonstration
    const mockUsers = {
      'admin@school.com': { id: '1', name: 'Admin User', role: 'admin', password: 'admin123' },
      'teacher@school.com': { id: '2', name: 'John Teacher', role: 'teacher', class: '10', section: 'A', password: 'teacher123' },
      'parent@school.com': { id: '3', name: 'Parent User', role: 'parent', children: ['student1', 'student2'], password: 'parent123' }
    };

    const user = mockUsers[credentials.email];
    
    if (user && user.password === credentials.password) {
      return {
        success: true,
        user: { id: user.id, name: user.name, role: user.role, class: user.class, section: user.section, children: user.children },
        token: 'mock-jwt-token'
      };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 