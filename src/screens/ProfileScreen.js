import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await executeQuery(
        'SELECT * FROM settings WHERE user_id = ?',
        [user.id]
      );

      if (result.rows.length > 0) {
        const settings = result.rows.item(0);
        setNotificationsEnabled(settings.notifications_enabled === 1);
        setPrivacyMode(settings.privacy_mode === 1);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const updateSettings = async (field, value) => {
    try {
      await executeQuery(
        `UPDATE settings SET ${field} = ? WHERE user_id = ?`,
        [value ? 1 : 0, user.id]
      );
    } catch (error) {
      console.error('Error updating settings:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Профиль</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#6366f1" />
        </View>
        <Text style={styles.name}>{user?.name || 'Пользователь'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Настройки</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#6366f1" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Уведомления</Text>
              <Text style={styles.settingDescription}>
                Получать напоминания и советы
              </Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={(value) => {
              setNotificationsEnabled(value);
              updateSettings('notifications_enabled', value);
            }}
            trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="lock-closed-outline" size={24} color="#6366f1" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Режим конфиденциальности</Text>
              <Text style={styles.settingDescription}>
                Дополнительная защита данных
              </Text>
            </View>
          </View>
          <Switch
            value={privacyMode}
            onValueChange={(value) => {
              setPrivacyMode(value);
              updateSettings('privacy_mode', value);
            }}
            trackColor={{ false: '#d1d5db', true: '#6366f1' }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Информация</Text>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="help-circle-outline" size={24} color="#6366f1" />
          <Text style={styles.menuText}>Помощь и поддержка</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="document-text-outline" size={24} color="#6366f1" />
          <Text style={styles.menuText}>Политика конфиденциальности</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Ionicons name="information-circle-outline" size={24} color="#6366f1" />
          <Text style={styles.menuText}>О приложении</Text>
          <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        <Text style={styles.logoutText}>Выйти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  profileSection: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6b7280',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 12,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    padding: 20,
    paddingBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 12,
    padding: 18,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fee2e2',
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});

