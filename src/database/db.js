import { Platform } from 'react-native';

// Импортируем веб-версию для fallback
let webStorage;
let SQLite;

if (Platform.OS === 'web') {
  webStorage = require('./webStorage');
} else {
  SQLite = require('expo-sqlite');
}

// На веб используем WebStorage, на мобильных - SQLite
let db = null;
if (Platform.OS !== 'web' && SQLite) {
  try {
    db = SQLite.openDatabase('pantorama.db');
  } catch (error) {
    console.error('Failed to open SQLite database:', error);
  }
}

export const initDatabase = async () => {
  // На веб используем WebStorage
  if (Platform.OS === 'web') {
    if (webStorage) {
      return await webStorage.initDatabase();
    }
    return Promise.resolve();
  }
  
  // На мобильных используем SQLite
  if (!db) {
    console.error('SQLite database not available');
    return Promise.reject(new Error('Database not available'));
  }
  
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      // Таблица пользователей
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );`
      );

      // Таблица записей настроения
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS mood_entries (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          mood_score INTEGER,
          emotions TEXT,
          notes TEXT,
          audio_path TEXT,
          physical_symptoms TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      // Таблица упражнений
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS exercises (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          exercise_type TEXT,
          exercise_data TEXT,
          duration INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      // Таблица рекомендаций ИИ
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS ai_recommendations (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          recommendation_text TEXT,
          exercise_type TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );

      // Таблица настроек
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          notifications_enabled INTEGER DEFAULT 1,
          privacy_mode INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        );`
      );
    }, (error) => {
      console.error('Database initialization error:', error);
      reject(error);
    }, () => {
      console.log('Database initialized successfully');
      resolve();
    });
  });
};

export const executeQuery = async (query, params = []) => {
  // На веб используем WebStorage
  if (Platform.OS === 'web') {
    if (webStorage) {
      return await webStorage.executeQuery(query, params);
    }
    return { rows: { length: 0 } };
  }
  
  // На мобильных используем SQLite
  if (!db) {
    console.error('SQLite database not available');
    return Promise.reject(new Error('Database not available'));
  }
  
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        query,
        params,
        (_, result) => resolve(result),
        (_, error) => {
          console.error('Query error:', error);
          reject(error);
        }
      );
    });
  });
};

export default db;

