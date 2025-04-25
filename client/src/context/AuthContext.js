import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      console.log('Fetching session from:', API_ENDPOINTS.session);
      const response = await axios.get(API_ENDPOINTS.session, {
        withCredentials: true
      });
      console.log('Session response:', response.data);
      
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Session fetch error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Attempting login to:', API_ENDPOINTS.login);
      const response = await axios.post(
        API_ENDPOINTS.login,
        { email, password },
        { withCredentials: true }
      );
      console.log('Login response:', response.data);
      
      if (response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: "Login failed - no user data received" };
    } catch (error) {
      console.error('Login error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      console.log('Attempting registration to:', API_ENDPOINTS.register);
      const response = await axios.post(
        API_ENDPOINTS.register,
        { username, email, password, role: 'user' },
        { withCredentials: true }
      );
      console.log('Registration response:', response.data);
      
      if (response.data.user) {
        setUser(response.data.user);
        return { success: true };
      }
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout to:', API_ENDPOINTS.logout);
      await axios.post(API_ENDPOINTS.logout, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 