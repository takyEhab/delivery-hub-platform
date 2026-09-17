import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on initial load
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('deliveryhub_token');
      const storedUser = localStorage.getItem('deliveryhub_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to restore authentication state:', e);
      localStorage.removeItem('deliveryhub_token');
      localStorage.removeItem('deliveryhub_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for unauthorized events triggered by the Axios response interceptor
  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = useCallback(async (phone, password) => {
    const data = await apiLogin({ phone, password });
    // data: { token, user: { id, name, phone, email, role } }
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('deliveryhub_token', data.token);
    localStorage.setItem('deliveryhub_user', JSON.stringify(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('deliveryhub_token');
    localStorage.removeItem('deliveryhub_user');
  }, []);

  const value = {
    user,
    token,
    isLoading,
    isAuthenticated: Boolean(token && user),
    isOwner: user?.role === 'owner',
    isDriver: user?.role === 'driver',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
