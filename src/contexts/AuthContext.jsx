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
      try {
        // Check if Supabase is configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (!supabaseUrl) {
          console.warn('Supabase not configured. Using localStorage only.');
          // Try to restore from localStorage
          const storedUser = localStorage.getItem('projectflow_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch (e) {
              console.error('Failed to parse stored user:', e);
            }
          }
          setIsLoading(false);
          return;
        }

        // Restore session from Supabase
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError) {
          console.warn('Supabase auth error:', authError.message);
        }
        
        if (authData?.user) {
          // Load profile for normalized app user
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .limit(1);
          
          if (profileError) {
            console.warn('Supabase profile error:', profileError.message);
          } else {
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
        }
        
        // Preload student list
        const { data: fetchedUsers, error: usersError } = await supabase
          .from('profiles')
          .select('id,name,email,role,avatar');
        
        if (usersError) {
          console.warn('Supabase users error:', usersError.message);
        } else {
          setAllUsers(fetchedUsers || []);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Try to restore from localStorage as fallback
        const storedUser = localStorage.getItem('projectflow_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (e) {
            console.error('Failed to parse stored user:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Database not configured. Please contact the administrator or check your internet connection.' 
        };
      }

      // Check if Supabase URL is valid
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Database not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.' 
        };
      }

      let data, error;
      try {
        const result = await supabase.auth.signInWithPassword({ email, password });
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        // Handle network errors
        console.error('Network error during login:', fetchError);
        setIsLoading(false);
        if (fetchError.message?.includes('fetch') || fetchError.message?.includes('Failed to fetch')) {
          return { 
            success: false, 
            error: 'Network error: Unable to connect to the server. Please check your internet connection and try again.' 
          };
        }
        return { 
          success: false, 
          error: `Connection error: ${fetchError.message || 'Unable to reach the server. Please try again later.'}` 
        };
      }

      if (error) {
        setIsLoading(false);
        if (error.message?.includes('Invalid login credentials')) {
          return { success: false, error: 'Invalid email or password. Please try again.' };
        }
        return { success: false, error: error.message || 'Login failed. Please try again.' };
      }

      if (!data?.user) {
        setIsLoading(false);
        return { success: false, error: 'Login failed. Please try again.' };
      }

      const supaUser = data.user;
      let profiles, profileError;
      try {
        const profileResult = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supaUser.id)
          .limit(1);
        profiles = profileResult.data;
        profileError = profileResult.error;
      } catch (fetchError) {
        console.error('Network error during profile fetch:', fetchError);
        setIsLoading(false);
        if (fetchError.message?.includes('fetch') || fetchError.message?.includes('Failed to fetch')) {
          return { 
            success: false, 
            error: 'Network error: Unable to load profile. Please check your internet connection and try again.' 
          };
        }
        return { 
          success: false, 
          error: `Connection error: ${fetchError.message || 'Unable to load profile. Please try again later.'}` 
        };
      }
      
      if (profileError) {
        setIsLoading(false);
        return { success: false, error: profileError.message || 'Failed to load profile. Please try again.' };
      }
      
      const profile = profiles?.[0];
      if (!profile) {
        setIsLoading(false);
        return { success: false, error: 'Profile not found. Please contact support.' };
      }
      const userData = createUser(profile.id, profile.name, profile.email, profile.role, profile.avatar);
      setUser(userData);
      localStorage.setItem('projectflow_user', JSON.stringify(userData));
      setIsLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Unexpected error during login:', error);
      setIsLoading(false);
      // Check for network errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        return { 
          success: false, 
          error: 'Network error: Unable to connect to the server. Please check your internet connection and try again.' 
        };
      }
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again later.' 
      };
    }
  };

  const signup = async (name, email, password, role) => {
    setIsLoading(true);
    try {
      if (!name || !email || !password || !role) {
        setIsLoading(false);
        return { success: false, error: 'All fields are required' };
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Database not configured. Please contact the administrator or check your internet connection.' 
        };
      }

      // Check if Supabase URL is valid
      if (supabaseUrl === 'https://placeholder.supabase.co') {
        setIsLoading(false);
        return { 
          success: false, 
          error: 'Database not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.' 
        };
      }

      let data, error;
      try {
        const result = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name, role } }
        });
        data = result.data;
        error = result.error;
      } catch (fetchError) {
        // Handle network errors
        console.error('Network error during signup:', fetchError);
        setIsLoading(false);
        if (fetchError.message?.includes('fetch') || fetchError.message?.includes('Failed to fetch')) {
          return { 
            success: false, 
            error: 'Network error: Unable to connect to the server. Please check your internet connection and try again.' 
          };
        }
        return { 
          success: false, 
          error: `Connection error: ${fetchError.message || 'Unable to reach the server. Please try again later.'}` 
        };
      }

      if (error) {
        setIsLoading(false);
        // Provide more user-friendly error messages
        if (error.message?.includes('already registered')) {
          return { success: false, error: 'This email is already registered. Please try logging in instead.' };
        }
        if (error.message?.includes('Invalid email')) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (error.message?.includes('Password')) {
          return { success: false, error: 'Password must be at least 6 characters long.' };
        }
        return { success: false, error: error.message || 'Sign up failed. Please try again.' };
      }

      if (!data?.user) {
        setIsLoading(false);
        return { success: false, error: 'Sign up failed. Please try again.' };
      }

      const supaUser = data.user;
      const avatar = role === 'teacher' ? '👩‍🏫' : '👨‍🎓';
      
      // Create profile row (RLS should allow insert by authenticated user)
      let insertError;
      try {
        const insertResult = await supabase.from('profiles').insert({
          id: supaUser.id,
          name,
          email,
          role,
          avatar
        });
        insertError = insertResult.error;
      } catch (fetchError) {
        console.error('Network error during profile creation:', fetchError);
        setIsLoading(false);
        if (fetchError.message?.includes('fetch') || fetchError.message?.includes('Failed to fetch')) {
          return { 
            success: false, 
            error: 'Network error: Unable to create profile. Please check your internet connection and try again.' 
          };
        }
        return { 
          success: false, 
          error: `Connection error: ${fetchError.message || 'Unable to create profile. Please try again later.'}` 
        };
      }
      
      if (insertError) {
        setIsLoading(false);
        return { success: false, error: insertError.message || 'Failed to create profile. Please try again.' };
      }
      
      const userData = createUser(supaUser.id, name, email, role, avatar);
      setUser(userData);
      localStorage.setItem('projectflow_user', JSON.stringify(userData));
      
      // Refresh cached users list (non-blocking)
      try {
        const { data: fetchedUsers } = await supabase
          .from('profiles')
          .select('id,name,email,role,avatar');
        if (fetchedUsers) {
          setAllUsers(fetchedUsers);
        }
      } catch (e) {
        console.warn('Failed to refresh users list:', e);
        // Don't fail signup if this fails
      }
      
      setIsLoading(false);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Unexpected error during signup:', error);
      setIsLoading(false);
      // Check for network errors
      if (error.message?.includes('fetch') || error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        return { 
          success: false, 
          error: 'Network error: Unable to connect to the server. Please check your internet connection and try again.' 
        };
      }
      return { 
        success: false, 
        error: error.message || 'Sign up failed. Please try again later.' 
      };
    }
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
