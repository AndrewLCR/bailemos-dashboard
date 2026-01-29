import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Environment variables - base URL with paths concatenated
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://bailemos-api.vercel.app').replace(/\/$/, '');
const API_AUTH_LOGIN = `${API_BASE_URL}/api/auth/login`;
const API_AUTH_REGISTER = `${API_BASE_URL}/api/auth/register`;
const STORAGE_TOKEN_KEY = import.meta.env.VITE_STORAGE_TOKEN_KEY || 'token';
const STORAGE_USER_KEY = import.meta.env.VITE_STORAGE_USER_KEY || 'user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_TOKEN_KEY);
    const userData = localStorage.getItem(STORAGE_USER_KEY);
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try { 
      const res = await axios.post(API_AUTH_LOGIN, { email, password });
      localStorage.setItem(STORAGE_TOKEN_KEY, res.data.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.data));
      setUser(res.data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const res = await axios.post(API_AUTH_REGISTER, userData);
      localStorage.setItem(STORAGE_TOKEN_KEY, res.data.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(res.data));
      setUser(res.data);
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
