import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';
import { getAIRecommendation } from '../services/aiService';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState('');
  const [todayMood, setTodayMood] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Получаем сегодняшнюю запись настроения
      const today = new Date().toISOString().split('T')[0];
      const moodResult = await executeQuery(
        `SELECT * FROM mood_entries 
         WHERE user_id = ? AND date(created_at) = date(?) 
         ORDER BY created_at DESC LIMIT 1`,
        [user.id, today]
      );

      if (moodResult.rows.length > 0) {
        const mood = moodResult.rows.item(0);
        setTodayMood(mood);
        
        // Получаем рекомендацию ИИ
        const aiRec = await getAIRecommendation(user.id, [], mood);
        setRecommendation(aiRec);
      } else {
        // Если записи нет, предлагаем создать
        setRecommendation('Создайте запись настроения, чтобы получить персональные рекомендации');
      }
    } catch (error) {
      console.error('Error loading home data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA', '#F5F5F5']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Привет, {user?.name || 'Друг'} 👋</Text>
            <Text style={styles.subtitle}>Как вы себя чувствуете сегодня?</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.6}
          >
            <View style={styles.profileIconContainer}>
              <Ionicons name="person" size={22} color="#C4B5E8" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {todayMood ? (
        <View style={styles.moodCard}>
          <View style={styles.moodCardContent}>
            <View style={styles.moodHeader}>
              <View style={styles.moodEmojiContainer}>
                <Text style={styles.moodEmoji}>{getMoodEmoji(todayMood.mood_score)}</Text>
              </View>
              <View style={styles.moodInfo}>
                <Text style={styles.moodScore}>{todayMood.mood_score}/10</Text>
                <Text style={styles.moodDate}>Сегодня</Text>
              </View>
            </View>
            {todayMood.emotions && (
              <View style={styles.emotionsContainer}>
                <Text style={styles.moodEmotions}>{todayMood.emotions}</Text>
              </View>
            )}
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.addMoodCard}
          onPress={() => navigation.navigate('MoodEntry')}
          activeOpacity={0.7}
        >
          <View style={styles.addMoodContent}>
            <View style={styles.addMoodIconContainer}>
              <View style={styles.addMoodIconCircle}>
                <Ionicons name="add" size={32} color="#C4B5E8" />
              </View>
            </View>
            <Text style={styles.addMoodText}>Добавить запись настроения</Text>
            <Text style={styles.addMoodSubtext}>Начните отслеживать свое самочувствие</Text>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.recommendationCard}>
        <View style={styles.recommendationContent}>
          <View style={styles.recommendationHeader}>
            <View style={styles.recommendationIconContainer}>
              <Ionicons name="sparkles" size={20} color="#C4B5E8" />
            </View>
            <Text style={styles.cardTitle}>Персональная рекомендация</Text>
          </View>
          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Быстрые действия</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('BreathingExercise')}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0F8F5' }]}>
                <Ionicons name="leaf" size={28} color="#B8D4C8" />
              </View>
              <Text style={styles.actionText}>Дыхание</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('DrawingExercise')}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#FFF8F0' }]}>
                <Ionicons name="color-palette" size={28} color="#F5D5B8" />
              </View>
              <Text style={styles.actionText}>Рисование</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Exercises')}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F0F5FA' }]}>
                <Ionicons name="fitness" size={28} color="#C8D8E8" />
              </View>
              <Text style={styles.actionText}>Упражнения</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Analytics')}
            activeOpacity={0.7}
          >
            <View style={styles.actionCardContent}>
              <View style={[styles.actionIconContainer, { backgroundColor: '#F8F5FF' }]}>
                <Ionicons name="stats-chart" size={28} color="#C4B5E8" />
              </View>
              <Text style={styles.actionText}>Аналитика</Text>
            </View>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerContent: {
    flex: 1,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '300',
    color: '#3A3A3A',
    marginBottom: 6,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8A8A8A',
    lineHeight: 24,
    fontWeight: '400',
  },
  profileButton: {
    marginLeft: 16,
  },
  profileIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  moodCard: {
    margin: 24,
    marginTop: 20,
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
  moodCardContent: {
    padding: 28,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  moodEmojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  moodEmoji: {
    fontSize: 44,
  },
  moodInfo: {
    flex: 1,
  },
  moodScore: {
    fontSize: 40,
    fontWeight: '300',
    color: '#3A3A3A',
    marginBottom: 6,
    letterSpacing: -1,
  },
  moodDate: {
    fontSize: 15,
    color: '#8A8A8A',
    fontWeight: '400',
  },
  emotionsContainer: {
    backgroundColor: '#FAFAFA',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  moodEmotions: {
    fontSize: 16,
    color: '#5A5A5A',
    lineHeight: 24,
    fontWeight: '400',
  },
  addMoodCard: {
    margin: 24,
    marginTop: 20,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
    borderStyle: 'dashed',
  },
  addMoodContent: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoodIconContainer: {
    marginBottom: 20,
  },
  addMoodIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#F0F0F0',
  },
  addMoodText: {
    fontSize: 18,
    color: '#C4B5E8',
    fontWeight: '500',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  addMoodSubtext: {
    fontSize: 14,
    color: '#B8B8B8',
    fontWeight: '400',
  },
  recommendationCard: {
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
  recommendationContent: {
    padding: 28,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  recommendationIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#3A3A3A',
    flex: 1,
    letterSpacing: -0.4,
  },
  recommendationText: {
    fontSize: 16,
    color: '#5A5A5A',
    lineHeight: 26,
    fontWeight: '400',
  },
  quickActions: {
    padding: 24,
    paddingTop: 12,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#3A3A3A',
    marginBottom: 24,
    letterSpacing: -0.6,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    borderRadius: 24,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  actionCardContent: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  actionText: {
    fontSize: 16,
    color: '#5A5A5A',
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
});

