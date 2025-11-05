import React, { createContext, useContext, useState, useEffect } from 'react';
import { createUser } from '../types';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext(undefined);

// Profiles cache (fetched from Supabase)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    const init = async () => {
      // Restore session from Supabase
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        // Load profile for normalized app user
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .limit(1);
        const profile = profiles?.[0];
        if (profile) {
          const normalized = createUser(
            profile.id,
            profile.name,
            profile.email,
            profile.role,
            profile.avatar
          );
          setUser(normalized);
          localStorage.setItem('projectflow_user', JSON.stringify(normalized));
        }
      }
      // Preload student list
      const { data: fetchedUsers } = await supabase
        .from('profiles')
        .select('id,name,email,role,avatar');
      setAllUsers(fetchedUsers || []);
      setIsLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
    const supaUser = data.user;
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supaUser.id)
      .limit(1);
    const profile = profiles?.[0];
    if (!profile) {
      setIsLoading(false);
      return { success: false, error: 'Profile not found' };
    }
    const userData = createUser(profile.id, profile.name, profile.email, profile.role, profile.avatar);
    setUser(userData);
    localStorage.setItem('projectflow_user', JSON.stringify(userData));
    setIsLoading(false);
    return { success: true, user: userData };
  };

  const signup = async (name, email, password, role) => {
    setIsLoading(true);
    if (!name || !email || !password || !role) {
      setIsLoading(false);
      return { success: false, error: 'All fields are required' };
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } }
    });
    if (error) {
      setIsLoading(false);
      return { success: false, error: error.message };
    }
    const supaUser = data.user;
    const avatar = role === 'teacher' ? '👩‍🏫' : '👨‍🎓';
    // Create profile row (RLS should allow insert by authenticated user)
    await supabase.from('profiles').insert({
      id: supaUser.id,
      name,
      email,
      role,
      avatar
    });
    const userData = createUser(supaUser.id, name, email, role, avatar);
    setUser(userData);
    localStorage.setItem('projectflow_user', JSON.stringify(userData));
    // Refresh cached users list
    const { data: fetchedUsers } = await supabase
      .from('profiles')
      .select('id,name,email,role,avatar');
    setAllUsers(fetchedUsers || []);
    setIsLoading(false);
    return { success: true, user: userData };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('projectflow_user');
    supabase.auth.signOut();
  };

  const getStudents = () => {
    return allUsers.filter(u => u.role === 'student');
  };

  const getStudentsByTeacher = (teacherId) => {
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
