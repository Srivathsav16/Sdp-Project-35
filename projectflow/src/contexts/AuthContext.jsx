import React, { createContext, useContext, useState, useEffect } from 'react';
import { createUser, createAuthContext } from '../types';

const AuthContext = createContext(undefined);

// Simple password hashing function (for demo purposes)
const hashPassword = (password) => {
  // In a real app, you'd use bcrypt or similar
  return btoa(password + 'salt');
};

// Users database with hashed passwords
const mockUsers = [];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState(mockUsers);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('projectflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Find user in all users data
    const foundUser = allUsers.find(u => u.email === email);
    
    if (foundUser && foundUser.password === hashPassword(password)) {
      const userData = createUser(
        foundUser.id,
        foundUser.name,
        foundUser.email,
        foundUser.role,
        foundUser.avatar
      );
      setUser(userData);
      localStorage.setItem('projectflow_user', JSON.stringify(userData));
      setIsLoading(false);
      return { success: true, user: userData };
    }
    
    setIsLoading(false);
    return { success: false, error: 'Invalid email or password' };
  };

  const signup = async (name, email, password, role) => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUser = allUsers.find(u => u.email === email);
    if (existingUser) {
      setIsLoading(false);
      return { success: false, error: 'User with this email already exists' };
    }
    
    // Validate input
    if (!name || !email || !password || !role) {
      setIsLoading(false);
      return { success: false, error: 'All fields are required' };
    }
    
    if (password.length < 6) {
      setIsLoading(false);
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashPassword(password),
      role,
      avatar: role === 'teacher' ? '👩‍🏫' : '👨‍🎓'
    };
    
    // Add to users database
    const updatedUsers = [...allUsers, newUser];
    setAllUsers(updatedUsers);
    
    const userData = createUser(
      newUser.id,
      newUser.name,
      newUser.email,
      newUser.role,
      newUser.avatar
    );
    
    setUser(userData);
    localStorage.setItem('projectflow_user', JSON.stringify(userData));
    setIsLoading(false);
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('projectflow_user');
  };

  const getStudents = () => {
    return allUsers.filter(u => u.role === 'student');
  };

  const getStudentsByTeacher = (teacherId) => {
    // In a real app, this would filter students assigned to specific teacher
    // For now, return all students
    return allUsers.filter(u => u.role === 'student');
  };

  const contextValue = {
    user,
    login,
    logout,
    signup,
    isLoading,
    getStudents,
    getStudentsByTeacher,
    allUsers
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
