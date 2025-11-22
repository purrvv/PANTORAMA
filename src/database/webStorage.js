// Web storage fallback для веб-версии
import AsyncStorage from '@react-native-async-storage/async-storage';

class WebStorageDB {
  constructor() {
    this.tables = {
      users: [],
      mood_entries: [],
      exercises: [],
      ai_recommendations: [],
      settings: [],
    };
    this.nextIds = {
      users: 1,
      mood_entries: 1,
      exercises: 1,
      ai_recommendations: 1,
      settings: 1,
    };
  }

  async init() {
    try {
      // Загружаем данные из AsyncStorage
      const stored = await AsyncStorage.getItem('pantorama_db');
      if (stored) {
        const data = JSON.parse(stored);
        this.tables = data.tables || this.tables;
        this.nextIds = data.nextIds || this.nextIds;
      }
    } catch (error) {
      console.error('Error loading web storage:', error);
    }
  }

  async save() {
    try {
      await AsyncStorage.setItem('pantorama_db', JSON.stringify({
        tables: this.tables,
        nextIds: this.nextIds,
      }));
    } catch (error) {
      console.error('Error saving web storage:', error);
    }
  }

  async executeQuery(query, params = []) {
    await this.init();
    
    const queryLower = query.toLowerCase().trim();
    const tableName = this.getTableName(queryLower);
    
    // CREATE TABLE
    if (queryLower.includes('create table')) {
      // Таблицы уже созданы в конструкторе
      return { rows: { length: 0 } };
    }
    
    // INSERT
    if (queryLower.includes('insert into')) {
      return this.handleInsert(queryLower, tableName, params);
    }
    
    // SELECT
    if (queryLower.includes('select')) {
      return this.handleSelect(queryLower, tableName, params);
    }
    
    // UPDATE
    if (queryLower.includes('update')) {
      return this.handleUpdate(queryLower, tableName, params);
    }
    
    // DELETE
    if (queryLower.includes('delete')) {
      return this.handleDelete(queryLower, tableName, params);
    }
    
    return { rows: { length: 0 } };
  }

  getTableName(query) {
    const tables = ['users', 'mood_entries', 'exercises', 'ai_recommendations', 'settings'];
    for (const table of tables) {
      if (query.includes(table)) {
        return table;
      }
    }
    return null;
  }

  handleInsert(query, tableName, params) {
    if (!tableName || !this.tables[tableName]) {
      return { insertId: null, rows: { length: 0 } };
    }

    const id = this.nextIds[tableName]++;
    const row = { id, ...this.parseInsertParams(query, params) };
    
    // Добавляем created_at если нужно
    if (!row.created_at) {
      row.created_at = new Date().toISOString();
    }
    
    this.tables[tableName].push(row);
    this.save();
    
    return {
      insertId: id,
      rows: {
        length: 1,
        item: (index) => this.tables[tableName][this.tables[tableName].length - 1],
      },
    };
  }

  parseInsertParams(query, params) {
    const row = {};
    let paramIndex = 0;
    
    // Простой парсинг VALUES
    const valuesMatch = query.match(/values\s*\([^)]+\)/i);
    if (valuesMatch) {
      const values = valuesMatch[0].replace(/values\s*\(|\)/gi, '').split(',').map(v => v.trim());
      const columnsMatch = query.match(/insert\s+into\s+\w+\s*\(([^)]+)\)/i);
      if (columnsMatch) {
        const columns = columnsMatch[1].split(',').map(c => c.trim());
        columns.forEach((col, idx) => {
          if (values[idx] === '?') {
            row[col] = params[paramIndex++];
          } else if (values[idx]?.includes('datetime')) {
            row[col] = new Date().toISOString();
          }
        });
      }
    }
    
    return row;
  }

  handleSelect(query, tableName, params) {
    if (!tableName || !this.tables[tableName]) {
      return { rows: { length: 0 } };
    }

    let results = [...this.tables[tableName]];

    // WHERE clause
    if (query.includes('where')) {
      const whereMatch = query.match(/where\s+(.+?)(?:\s+order|\s+limit|$)/i);
      if (whereMatch) {
        const condition = whereMatch[1];
        results = results.filter(row => {
          // Простая обработка WHERE user_id = ?
          if (condition.includes('user_id') && condition.includes('=')) {
            return row.user_id === params[0];
          }
          if (condition.includes('id') && condition.includes('=')) {
            return row.id === params[0];
          }
          if (condition.includes('email') && condition.includes('=')) {
            return row.email === params[0];
          }
          return true;
        });
      }
    }

    // ORDER BY
    if (query.includes('order by')) {
      const orderMatch = query.match(/order\s+by\s+(\w+)\s+(asc|desc)?/i);
      if (orderMatch) {
        const column = orderMatch[1];
        const direction = (orderMatch[2] || 'asc').toLowerCase();
        results.sort((a, b) => {
          if (direction === 'desc') {
            return b[column] > a[column] ? 1 : -1;
          }
          return a[column] > b[column] ? 1 : -1;
        });
      }
    }

    // LIMIT
    if (query.includes('limit')) {
      const limitMatch = query.match(/limit\s+(\d+)/i);
      if (limitMatch) {
        results = results.slice(0, parseInt(limitMatch[1]));
      }
    }

    return {
      rows: {
        length: results.length,
        item: (index) => results[index],
      },
    };
  }

  handleUpdate(query, tableName, params) {
    if (!tableName || !this.tables[tableName]) {
      return { rowsAffected: 0 };
    }

    const whereMatch = query.match(/where\s+(.+?)$/i);
    let updated = 0;

    this.tables[tableName].forEach((row, index) => {
      let shouldUpdate = true;
      
      if (whereMatch) {
        const condition = whereMatch[1];
        if (condition.includes('id') && condition.includes('=')) {
          shouldUpdate = row.id === params[params.length - 1];
        }
      }

      if (shouldUpdate) {
        // Простой парсинг SET
        const setMatch = query.match(/set\s+(.+?)(?:\s+where|$)/i);
        if (setMatch) {
          const sets = setMatch[1].split(',').map(s => s.trim());
          sets.forEach((set, idx) => {
            const [key] = set.split('=').map(s => s.trim());
            if (set.includes('?')) {
              row[key] = params[idx];
            }
          });
          updated++;
        }
      }
    });

    if (updated > 0) {
      this.save();
    }

    return { rowsAffected: updated };
  }

  handleDelete(query, tableName, params) {
    if (!tableName || !this.tables[tableName]) {
      return { rowsAffected: 0 };
    }

    const whereMatch = query.match(/where\s+(.+?)$/i);
    let deleted = 0;

    if (whereMatch) {
      const condition = whereMatch[1];
      this.tables[tableName] = this.tables[tableName].filter(row => {
        if (condition.includes('id') && condition.includes('=')) {
          const shouldDelete = row.id === params[0];
          if (shouldDelete) deleted++;
          return !shouldDelete;
        }
        return true;
      });
    }

    if (deleted > 0) {
      this.save();
    }

    return { rowsAffected: deleted };
  }
}

const webDB = new WebStorageDB();

export const initDatabase = async () => {
  await webDB.init();
  return Promise.resolve();
};

export const executeQuery = async (query, params = []) => {
  return await webDB.executeQuery(query, params);
};

export default webDB;

