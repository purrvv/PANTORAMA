import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('Ошибка', 'Пожалуйста, введите email');
      return;
    }

    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) {
        Alert.alert('Ошибка', result.error);
      }
    } else {
      if (!name) {
        Alert.alert('Ошибка', 'Пожалуйста, введите имя');
        return;
      }
      const result = await register(name, email);
      if (!result.success) {
        Alert.alert('Ошибка', result.error);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#F5F5F5']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🌿</Text>
            </View>
          </View>
          <Text style={styles.title}>Pantorama</Text>
          <Text style={styles.subtitle}>
            Ваш персональный помощник{'\n'}по психическому здоровью
          </Text>

          <View style={styles.formContainer}>
            {!isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#8B7EC8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Имя"
                  placeholderTextColor="#A0AEC0"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            )}

            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#8B7EC8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#A0AEC0"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {isLogin && (
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8B7EC8" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Пароль (опционально)"
                  placeholderTextColor="#A0AEC0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            )}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleSubmit}
              activeOpacity={0.7}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>
                  {isLogin ? 'Войти' : 'Зарегистрироваться'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.switchButton}
            onPress={() => setIsLogin(!isLogin)}
          >
            <Text style={styles.switchText}>
              {isLogin
                ? 'Нет аккаунта? Зарегистрироваться'
                : 'Уже есть аккаунт? Войти'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  logoEmoji: {
    fontSize: 56,
  },
  title: {
    fontSize: 48,
    fontWeight: '200',
    color: '#3A3A3A',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1.2,
  },
  subtitle: {
    fontSize: 17,
    color: '#8A8A8A',
    textAlign: 'center',
    marginBottom: 56,
    lineHeight: 26,
    fontWeight: '400',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginBottom: 20,
    paddingHorizontal: 20,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  inputIcon: {
    marginRight: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 20,
    fontSize: 17,
    color: '#3A3A3A',
    fontWeight: '400',
  },
  button: {
    borderRadius: 20,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#C4B5E8',
  },
  buttonContent: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#C4B5E8',
    fontSize: 18,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  switchButton: {
    marginTop: 32,
    alignItems: 'center',
    paddingVertical: 16,
  },
  switchText: {
    color: '#C4B5E8',
    fontSize: 16,
    fontWeight: '400',
  },
});

