import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Загрузка текущего пользователя при старте
  useEffect(() => {
    const savedUser = localStorage.getItem('dnd_current_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Регистрация — всегда читаем свежих пользователей из localStorage
  const register = (email, password, role) => {
    const stored = localStorage.getItem('dnd_users');
    const currentUsers = stored ? JSON.parse(stored) : [];
    const existing = currentUsers.find(u => u.email === email);
    if (existing) {
      return { success: false, message: 'Пользователь с таким email уже существует' };
    }
    const newUser = { email, password, role };
    const updatedUsers = [...currentUsers, newUser];
    localStorage.setItem('dnd_users', JSON.stringify(updatedUsers));
    return { success: true };
  };

  // Логин — тоже читаем напрямую из localStorage
  const login = (email, password) => {
    const stored = localStorage.getItem('dnd_users');
    const users = stored ? JSON.parse(stored) : [];
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const userData = { email: user.email, role: user.role };
      setCurrentUser(userData);
      localStorage.setItem('dnd_current_user', JSON.stringify(userData));
      return { success: true };
    }
    return { success: false, message: 'Неверный email или пароль' };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('dnd_current_user');
  };

  const value = {
    currentUser,
    register,
    login,
    logout,
    isAuthenticated: !!currentUser,
    isMaster: currentUser?.role === 'master',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};