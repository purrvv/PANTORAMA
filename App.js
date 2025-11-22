import React, { useEffect, useState } from 'react';
import { Platform, View, Text, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

import { initDatabase } from './src/database/db';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import MoodDiaryScreen from './src/screens/MoodDiaryScreen';
import ExercisesScreen from './src/screens/ExercisesScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import EducationScreen from './src/screens/EducationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import MoodEntryScreen from './src/screens/MoodEntryScreen';
import DrawingExerciseScreen from './src/screens/DrawingExerciseScreen';
import BreathingExerciseScreen from './src/screens/BreathingExerciseScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Настройка уведомлений (только для мобильных платформ)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Diary') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'Exercises') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Education') {
            iconName = focused ? 'library' : 'library-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#C4B5E8',
        tabBarInactiveTintColor: '#B8B8B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0F0F0',
          height: 64,
          paddingBottom: 10,
          paddingTop: 10,
          shadowColor: 'rgba(0, 0, 0, 0.04)',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 1,
          shadowRadius: 12,
          elevation: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Diary" component={MoodDiaryScreen} />
      <Tab.Screen name="Exercises" component={ExercisesScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Education" component={EducationScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDatabase();
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
      
      // Уведомления работают только на мобильных платформах
      if (Platform.OS !== 'web') {
        setupNotifications();
      }
    };
    
    initialize();
  }, []);

  const setupNotifications = async () => {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Время для записи настроения",
            body: "Как вы себя чувствуете сегодня?",
          },
          trigger: { hour: 20, minute: 0, repeats: true },
        });
      }
    } catch (error) {
      console.error('Failed to setup notifications:', error);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7FAFC' }}>
        <Text style={{ fontSize: 18, color: '#8B7EC8' }}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="MoodEntry" component={MoodEntryScreen} />
            <Stack.Screen name="DrawingExercise" component={DrawingExerciseScreen} />
            <Stack.Screen name="BreathingExercise" component={BreathingExerciseScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  const [error, setError] = useState(null);

  useEffect(() => {
    // Глобальная обработка ошибок
    const errorHandler = (error, isFatal) => {
      console.error('Global error:', error);
      setError(error.message);
    };

    // В React Native ошибки обрабатываются через ErrorUtils
    if (typeof ErrorUtils !== 'undefined') {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        errorHandler(error, isFatal);
        if (originalHandler) {
          originalHandler(error, isFatal);
        }
      });
    }
  }, []);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, marginBottom: 10 }}>Произошла ошибка</Text>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>{error}</Text>
        <TouchableOpacity 
          onPress={() => setError(null)}
          style={{ padding: 10, backgroundColor: '#8B7EC8', borderRadius: 8 }}
        >
          <Text style={{ color: '#fff' }}>Попробовать снова</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

