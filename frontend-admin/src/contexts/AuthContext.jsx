/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user')); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const login = async (username, password) => {
    setLoading(true); setError('');
    try {
      // Backend LoginResponse: { token, role } — no username field
      const { data } = await api.post('/auth/login', { username, password });
      localStorage.setItem('admin_token', data.token);
      // Use the username from the login form (backend doesn't return it)
      const userData = { username, role: data.role };
      localStorage.setItem('admin_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Sai tên đăng nhập hoặc mật khẩu';
      setError(typeof msg === 'string' ? msg : 'Sai tên đăng nhập hoặc mật khẩu');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, password, role = 'OWNER') => {
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/register', { username, password, role });
      localStorage.setItem('admin_token', data.token);
      const userData = { username, role: data.role || role };
      localStorage.setItem('admin_user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Khong the dang ky tai khoan';
      setError(typeof msg === 'string' ? msg : 'Khong the dang ky tai khoan');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setUser(null);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isOwner = user?.role === 'OWNER';

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, error, isAdmin, isOwner }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
