import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import jwt_decode from 'jwt-decode';

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
    fetchUserFromToken();
  }, []);
  

  const fetchUserFromToken = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwt_decode(token);
        setUser(decoded);
      } catch (err) {
        console.error('Invalid token');
        localStorage.removeItem('token');
      }
    } else {
      setUser(null);
    }
  };
  

  const login = async (email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.login, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };
  

  const register = async (username, email, password) => {
    try {
      const response = await axios.post(API_ENDPOINTS.register, {
        username,
        email,
        password,
        role: 'user'
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };
  

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
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