import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Debug function to log request details
const logRequest = (method, url, data = null) => {
  console.log(`[${method}] ${url}`);
  if (data) console.log('Request data:', data);
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    const url = API_ENDPOINTS.session;
    logRequest('GET', url);
    
    try {
      const response = await axios.get(url, {
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
        console.error('Error URL:', error.config.url);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const url = API_ENDPOINTS.login;
    const data = { email, password };
    logRequest('POST', url, data);
    
    try {
      const response = await axios.post(url, data, {
        withCredentials: true
      });
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
        console.error('Error URL:', error.config.url);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || "Login failed" 
      };
    }
  };

  const register = async (username, email, password) => {
    const url = API_ENDPOINTS.register;
    const data = { username, email, password, role: 'user' };
    logRequest('POST', url, data);
    
    try {
      const response = await axios.post(url, data, {
        withCredentials: true
      });
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
        console.error('Error URL:', error.config.url);
      }
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    const url = API_ENDPOINTS.logout;
    logRequest('POST', url);
    
    try {
      await axios.post(url, {}, { withCredentials: true });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error URL:', error.config.url);
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