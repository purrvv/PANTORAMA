import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';
import { analyzeMoodTrends } from '../services/aiService';
import { format, subDays } from 'date-fns';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const { user } = useAuth();
  const [moodData, setMoodData] = useState([]);
  const [stats, setStats] = useState({
    average: 0,
    trend: 'stable',
    dataPoints: 0,
  });
  const [exerciseStats, setExerciseStats] = useState({
    total: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Загружаем данные настроения за последние 30 дней
      const result = await executeQuery(
        `SELECT mood_score, created_at 
         FROM mood_entries 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 30`,
        [user.id]
      );

      const moods = [];
      for (let i = 0; i < result.rows.length; i++) {
        moods.push(result.rows.item(i));
      }

      // Группируем по дням
      const dailyMoods = {};
      moods.forEach((mood) => {
        const date = format(new Date(mood.created_at), 'yyyy-MM-dd');
        if (!dailyMoods[date]) {
          dailyMoods[date] = [];
        }
        dailyMoods[date].push(mood.mood_score);
      });

      // Вычисляем среднее за день
      const chartData = [];
      const labels = [];
      for (let i = 29; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayMoods = dailyMoods[dateStr] || [];
        const avg = dayMoods.length > 0
          ? dayMoods.reduce((a, b) => a + b, 0) / dayMoods.length
          : null;

        if (avg !== null) {
          chartData.push(avg);
          labels.push(format(date, 'd MMM'));
        }
      }

      setMoodData({ labels, datasets: [{ data: chartData }] });

      // Анализ трендов
      const analysis = await analyzeMoodTrends(user.id);
      setStats(analysis);

      // Статистика упражнений
      const exerciseResult = await executeQuery(
        `SELECT COUNT(*) as total,
         SUM(CASE WHEN date(created_at) >= date('now', '-7 days') THEN 1 ELSE 0 END) as this_week
         FROM exercises WHERE user_id = ?`,
        [user.id]
      );

      if (exerciseResult.rows.length > 0) {
        setExerciseStats({
          total: exerciseResult.rows.item(0).total || 0,
          thisWeek: exerciseResult.rows.item(0).this_week || 0,
        });
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const getTrendText = () => {
    switch (stats.trend) {
      case 'improving':
        return 'Улучшается 📈';
      case 'declining':
        return 'Снижается 📉';
      default:
        return 'Стабильно ➡️';
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'improving':
        return '#10b981';
      case 'declining':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Аналитика</Text>
      </View>

      {moodData.labels && moodData.labels.length > 0 ? (
        <>
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Динамика настроения (30 дней)</Text>
            <LineChart
              data={moodData}
              width={width - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#fff',
                backgroundGradientFrom: '#fff',
                backgroundGradientTo: '#fff',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#6366f1',
                },
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
              withVerticalLabels={true}
              withHorizontalLabels={true}
            />
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.average.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Среднее настроение</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statValue, { color: getTrendColor() }]}>
                {getTrendText()}
              </Text>
              <Text style={styles.statLabel}>Тренд</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.dataPoints}</Text>
              <Text style={styles.statLabel}>Всего записей</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{exerciseStats.total}</Text>
              <Text style={styles.statLabel}>Всего упражнений</Text>
            </View>
          </View>

          <View style={styles.statsCard}>
            <Text style={styles.cardTitle}>Упражнения на этой неделе</Text>
            <Text style={styles.exerciseCount}>{exerciseStats.thisWeek}</Text>
            <Text style={styles.exerciseText}>
              {exerciseStats.thisWeek === 0
                ? 'Начните выполнять упражнения для улучшения самочувствия'
                : 'Отличная работа! Продолжайте в том же духе'}
            </Text>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyText}>Пока нет данных</Text>
          <Text style={styles.emptySubtext}>
            Создайте несколько записей настроения, чтобы увидеть аналитику
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chartCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 12,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#10b981',
    textAlign: 'center',
    marginVertical: 16,
  },
  exerciseText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

