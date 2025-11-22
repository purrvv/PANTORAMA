import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';
import { format } from 'date-fns';

export default function MoodDiaryScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    loadEntries();
    const unsubscribe = navigation.addListener('focus', loadEntries);
    return unsubscribe;
  }, [navigation]);

  const loadEntries = async () => {
    try {
      const result = await executeQuery(
        `SELECT * FROM mood_entries 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 50`,
        [user.id]
      );

      const entriesList = [];
      for (let i = 0; i < result.rows.length; i++) {
        entriesList.push(result.rows.item(i));
      }
      setEntries(entriesList);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const getMoodEmoji = (score) => {
    if (score >= 8) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 4) return '😐';
    if (score >= 2) return '😔';
    return '😢';
  };

  const getMoodColor = (score) => {
    if (score >= 8) return '#10b981';
    if (score >= 6) return '#3b82f6';
    if (score >= 4) return '#f59e0b';
    if (score >= 2) return '#ef4444';
    return '#dc2626';
  };

  const renderEntry = ({ item }) => {
    const date = new Date(item.created_at);
    const formattedDate = format(date, 'd MMM, HH:mm');
  
    return (
      <TouchableOpacity
        style={styles.entryCard}
        onPress={() => navigation.navigate('MoodEntry', { entryId: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.entryCardContent}>
          <View style={styles.entryHeader}>
            <View style={[styles.moodIndicator, { backgroundColor: getMoodColor(item.mood_score) }]}>
              <Text style={styles.moodEmoji}>{getMoodEmoji(item.mood_score)}</Text>
            </View>
            <View style={styles.entryInfo}>
              <Text style={styles.entryScore}>{item.mood_score}/10</Text>
              <Text style={styles.entryDate}>{formattedDate}</Text>
            </View>
          </View>
          {item.emotions && (
            <View style={styles.emotionsTag}>
              <Text style={styles.entryEmotions}>{item.emotions}</Text>
            </View>
          )}
          {item.notes && (
            <Text style={styles.entryNotes} numberOfLines={2}>
              {item.notes}
            </Text>
          )}
          {item.audio_path && (
            <View style={styles.audioBadge}>
              <Ionicons name="mic" size={14} color="#8B7EC8" />
              <Text style={styles.audioText}>Аудиозапись</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };  

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Дневник настроения</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('MoodEntry')}
            activeOpacity={0.7}
          >
            <View style={styles.addButtonContent}>
              <Ionicons name="add" size={24} color="#C4B5E8" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {entries.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="journal-outline" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>Пока нет записей</Text>
          <Text style={styles.emptySubtext}>
            Начните отслеживать свое настроение
          </Text>
        </View>
      ) : (
        <FlatList
          data={entries}
          renderItem={renderEntry}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  headerGradient: {
    paddingTop: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: '#3A3A3A',
    letterSpacing: -0.8,
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  addButtonContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 24,
  },
  entryCard: {
    marginBottom: 20,
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
  entryCardContent: {
    padding: 24,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  moodIndicator: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  moodEmoji: {
    fontSize: 36,
  },
  entryInfo: {
    flex: 1,
  },
  entryScore: {
    fontSize: 28,
    fontWeight: '300',
    color: '#3A3A3A',
    marginBottom: 6,
    letterSpacing: -0.6,
  },
  entryDate: {
    fontSize: 14,
    color: '#8A8A8A',
    fontWeight: '400',
  },
  emotionsTag: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginBottom: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  entryEmotions: {
    fontSize: 15,
    color: '#5A5A5A',
    fontWeight: '400',
  },
  entryNotes: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
    marginBottom: 8,
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#E8E0F5',
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  audioText: {
    fontSize: 12,
    color: '#8B7EC8',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#718096',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#A0AEC0',
    marginTop: 8,
    textAlign: 'center',
  },
});

