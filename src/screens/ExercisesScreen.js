import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function ExercisesScreen() {
  const navigation = useNavigation();

  const exercises = [
    {
      id: 1,
      title: 'Дыхательное упражнение',
      description: 'Техника глубокого дыхания для снятия стресса',
      icon: 'leaf',
      gradient: ['#A8D5E2', '#B8E0D2'],
      screen: 'BreathingExercise',
    },
    {
      id: 2,
      title: 'Творческое рисование',
      description: 'Выразите эмоции через рисование',
      icon: 'color-palette',
      gradient: ['#FFD6A5', '#FFE5B4'],
      screen: 'DrawingExercise',
    },
    {
      id: 3,
      title: 'Медитация осознанности',
      description: 'Короткая практика для концентрации',
      icon: 'flower',
      gradient: ['#C8A8E9', '#D4B8F0'],
      screen: 'MeditationExercise',
    },
    {
      id: 4,
      title: 'Прогрессивная мышечная релаксация',
      description: 'Техника расслабления мышц',
      icon: 'body',
      gradient: ['#8BA9D4', '#A8C5E2'],
      screen: 'RelaxationExercise',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Упражнения</Text>
          <Text style={styles.subtitle}>
            Выберите упражнение для улучшения самочувствия
          </Text>
        </View>
      </LinearGradient>

      {exercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          style={styles.exerciseCard}
          onPress={() => {
            if (exercise.screen === 'BreathingExercise') {
              navigation.navigate('BreathingExercise');
            } else if (exercise.screen === 'DrawingExercise') {
              navigation.navigate('DrawingExercise');
            } else {
              // Для других упражнений можно добавить экраны позже
              alert('Это упражнение скоро будет доступно!');
            }
          }}
          activeOpacity={0.8}
        >
          <View style={styles.exerciseCardContent}>
            <View style={styles.exerciseContent}>
              <View style={styles.iconContainer}>
                <Ionicons name={exercise.icon} size={32} color="#C4B5E8" />
              </View>
              <View style={styles.exerciseInfo}>
                <Text style={styles.exerciseTitle}>{exercise.title}</Text>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#B8B8B8" style={styles.chevron} />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.infoCard}>
        <View style={styles.infoIconContainer}>
          <Ionicons name="information-circle" size={24} color="#8B7EC8" />
        </View>
        <Text style={styles.infoText}>
          Регулярные упражнения помогают улучшить эмоциональное состояние и снизить уровень стресса.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#3A3A3A',
    marginBottom: 10,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    lineHeight: 24,
    fontWeight: '400',
  },
  exerciseCard: {
    margin: 24,
    marginTop: 0,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  exerciseCardContent: {
    padding: 28,
  },
  exerciseContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#3A3A3A',
    marginBottom: 8,
    letterSpacing: -0.4,
  },
  exerciseDescription: {
    fontSize: 15,
    color: '#8A8A8A',
    lineHeight: 22,
    fontWeight: '400',
  },
  chevron: {
    opacity: 0.6,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA',
    margin: 24,
    marginTop: 0,
    padding: 24,
    borderRadius: 28,
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoIconContainer: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#4A5568',
    lineHeight: 22,
    fontWeight: '500',
  },
});

