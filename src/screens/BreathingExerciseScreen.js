import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';

const { width } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.6;

export default function BreathingExerciseScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale
  const [phaseText, setPhaseText] = useState('Вдох');
  const [scale] = useState(new Animated.Value(1));
  const [duration, setDuration] = useState(0);
  const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (isActive) {
      startBreathingCycle();
      const interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
      setTimer(interval);
    } else {
      if (timer) clearInterval(timer);
      setDuration(0);
      scale.setValue(1);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isActive]);

  const startBreathingCycle = () => {
    const cycle = () => {
      // Вдох (4 секунды)
      setPhase('inhale');
      setPhaseText('Вдох');
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 4000,
        useNativeDriver: true,
      }).start(() => {
        // Задержка (2 секунды)
        setPhase('hold');
        setPhaseText('Задержка');
        setTimeout(() => {
          // Выдох (6 секунд)
          setPhase('exhale');
          setPhaseText('Выдох');
          Animated.timing(scale, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }).start(() => {
            if (isActive) {
              cycle();
            }
          });
        }, 2000);
      });
    };
    cycle();
  };

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const stopExercise = async () => {
    setIsActive(false);
    if (duration > 0) {
      try {
        await executeQuery(
          `INSERT INTO exercises (user_id, exercise_type, exercise_data, duration, created_at) 
           VALUES (?, ?, ?, ?, datetime("now"))`,
          [user.id, 'breathing', JSON.stringify({}), duration]
        );
      } catch (error) {
        console.error('Error saving exercise:', error);
      }
    }
    navigation.goBack();
  };

  const getPhaseColor = () => {
    switch (phase) {
      case 'inhale':
        return ['#10b981', '#34d399'];
      case 'hold':
        return ['#3b82f6', '#60a5fa'];
      case 'exhale':
        return ['#8b5cf6', '#a78bfa'];
      default:
        return ['#6366f1', '#818cf8'];
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Дыхательное упражнение</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        <Text style={styles.instruction}>
          Следуйте за кругом: вдох, задержка, выдох
        </Text>

        <View style={styles.circleContainer}>
          <Animated.View
            style={[
              styles.circleWrapper,
              {
                transform: [{ scale }],
              },
            ]}
          >
            <LinearGradient
              colors={getPhaseColor()}
              style={styles.circle}
            >
              <Text style={styles.phaseText}>{phaseText}</Text>
            </LinearGradient>
          </Animated.View>
        </View>

        <View style={styles.controls}>
          <View style={styles.timerContainer}>
            <Ionicons name="time-outline" size={24} color="#6366f1" />
            <Text style={styles.timerText}>{formatTime(duration)}</Text>
          </View>

          {!isActive ? (
            <TouchableOpacity
              style={styles.startButton}
              onPress={toggleExercise}
            >
              <Ionicons name="play" size={32} color="#fff" />
              <Text style={styles.buttonText}>Начать</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.pauseButton}
              onPress={toggleExercise}
            >
              <Ionicons name="pause" size={32} color="#fff" />
              <Text style={styles.buttonText}>Пауза</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.stopButton}
            onPress={stopExercise}
          >
            <Ionicons name="stop" size={24} color="#ef4444" />
            <Text style={styles.stopButtonText}>Завершить</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Техника 4-7-8</Text>
          <Text style={styles.infoText}>
            • Вдох через нос на 4 счета{'\n'}
            • Задержка дыхания на 7 счетов{'\n'}
            • Выдох через рот на 8 счетов{'\n'}
            {'\n'}
            Эта техника помогает снизить тревожность и улучшить сон.
          </Text>
        </View>
      </View>
    </View>
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  instruction: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
  },
  circleWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  phaseText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  timerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6366f1',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    gap: 12,
    marginBottom: 16,
  },
  pauseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f59e0b',
    padding: 20,
    borderRadius: 16,
    width: '80%',
    gap: 12,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    width: '80%',
    gap: 8,
  },
  stopButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
  },
});

