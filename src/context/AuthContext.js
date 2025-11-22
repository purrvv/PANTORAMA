import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { executeQuery } from '../database/db';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const result = await executeQuery(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (result.rows.length > 0) {
        const userData = result.rows.item(0);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Пользователь не найден' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Ошибка входа' };
    }
  };

  const register = async (name, email) => {
    try {
      const result = await executeQuery(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [name, email]
      );

      const userId = result.insertId;
      const userData = { id: userId, name, email };

      // Создаем настройки по умолчанию
      await executeQuery(
        'INSERT INTO settings (user_id) VALUES (?)',
        [userId]
      );

      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Ошибка регистрации' };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

