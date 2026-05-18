import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore session from localStorage on startup
  useEffect(() => {
    const storedUser = localStorage.getItem('auth_user');
    const storedToken = localStorage.getItem('auth_token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/login', { email, password });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const errMsg = err.response?.data?.message || 'Login failed. Please check credentials.';
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Register handler
  const register = async (name, email, password, passwordConfirmation, role) => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.post('/register', {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
        role
      });
      const { access_token, user: userData } = response.data;

      localStorage.setItem('auth_token', access_token);
      localStorage.setItem('auth_user', JSON.stringify(userData));

      setUser(userData);
      setLoading(false);
      return userData;
    } catch (err) {
      setLoading(false);
      const errs = err.response?.data?.errors;
      let errMsg = 'Registration failed. Please correct input.';
      if (errs) {
        errMsg = Object.values(errs).flat().join(' ');
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message;
      }
      setError(errMsg);
      throw new Error(errMsg);
    }
  };

  // Logout handler
  const logout = async () => {
    setLoading(true);
    try {
      await API.post('/logout');
    } catch (err) {
      console.error('Logout error on server', err);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, setError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
