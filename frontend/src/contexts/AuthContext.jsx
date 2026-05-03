import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка текущего пользователя при старте
  useEffect(() => {
    const loadUser = async () => {
      const accessToken = localStorage.getItem('access_token');
      // Если уже есть пользователь в памяти, не загружаем снова
      if (accessToken && !currentUser) {
        setLoading(true);
        try {
          const response = await axiosInstance.get('/users/me/');
          setCurrentUser(response.data);
        } catch (err) {
          console.error('Ошибка загрузки пользователя:', err);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        } finally {
          setLoading(false);
        }
      }
    };

    loadUser();
  }, []);

  // Регистрация
  const register = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.password_confirm,
        avatar_url: formData.avatar_url || null,
      });

      const loginResponse = await axiosInstance.post('/auth/login/', {
        username: formData.username,
        password: formData.password,
      });

      const { access, refresh, user } = loginResponse.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setCurrentUser(user);

      return { success: true, data: user };
    } catch (err) {
      console.error('Registration error:', err.response?.data);

      let message = 'Ошибка при регистрации';
      const errorData = err.response?.data;

      if (typeof errorData === 'string') {
        message = errorData;
      } else if (errorData?.message) {
        message = errorData.message;
      } else if (typeof errorData === 'object') {
        const firstError = Object.values(errorData)[0];
        if (Array.isArray(firstError)) {
          message = firstError[0];
        } else if (typeof firstError === 'string') {
          message = firstError;
        }
      }

      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Логин
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post('/auth/login/', {
        username,
        password,
      });

      const { access, refresh, user } = response.data;

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setCurrentUser(user);
      return { success: true, data: user };
    } catch (err) {
      const message = err.response?.data?.detail ||
        err.response?.data?.message ||
        'Неверное имя пользователя или пароль';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Выход
  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setCurrentUser(null);
    window.location.href = '/'; // Редирект на главную
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    loading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};