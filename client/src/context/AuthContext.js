import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserSession();
  }, []);

  const fetchUserSession = async () => {
    try {
      const response = await axios.get(`${API_URL}/session`, {
        withCredentials: true,
      });
      if (response.data.user) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.log("No user logged in");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/login`,
        { email, password },
        { withCredentials: true }
      );
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Login failed" };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post(`${API_URL}/register`, { username, email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
      setUser(null);
      return { success: true };
    } catch (error) {
      return { success: false, error: "Logout failed" };
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