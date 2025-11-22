import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';

export default function MoodEntryScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();
  const entryId = route.params?.entryId;

  const [moodScore, setMoodScore] = useState(5);
  const [emotions, setEmotions] = useState('');
  const [notes, setNotes] = useState('');
  const [physicalSymptoms, setPhysicalSymptoms] = useState('');
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (entryId) {
      loadEntry();
    }
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [entryId]);

  const loadEntry = async () => {
    try {
      const result = await executeQuery(
        'SELECT * FROM mood_entries WHERE id = ?',
        [entryId]
      );

      if (result.rows.length > 0) {
        const entry = result.rows.item(0);
        setMoodScore(entry.mood_score);
        setEmotions(entry.emotions || '');
        setNotes(entry.notes || '');
        setPhysicalSymptoms(entry.physical_symptoms || '');
        setAudioUri(entry.audio_path);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        Alert.alert('Ошибка', 'Нужно разрешение на запись аудио');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (error) {
      console.error('Failed to start recording', error);
      Alert.alert('Ошибка', 'Не удалось начать запись');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri);
      setRecording(null);
    } catch (error) {
      console.error('Failed to stop recording', error);
    }
  };

  const playRecording = async () => {
    if (!audioUri) return;

    try {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
      setSound(sound);
      await sound.playAsync();
    } catch (error) {
      console.error('Failed to play recording', error);
    }
  };

  const saveEntry = async () => {
    try {
      if (entryId) {
        await executeQuery(
          `UPDATE mood_entries 
           SET mood_score = ?, emotions = ?, notes = ?, physical_symptoms = ?, audio_path = ?
           WHERE id = ?`,
          [moodScore, emotions, notes, physicalSymptoms, audioUri, entryId]
        );
        Alert.alert('Успешно', 'Запись обновлена');
      } else {
        await executeQuery(
          `INSERT INTO mood_entries 
           (user_id, mood_score, emotions, notes, physical_symptoms, audio_path) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          [user.id, moodScore, emotions, notes, physicalSymptoms, audioUri]
        );
        Alert.alert('Успешно', 'Запись сохранена');
      }
      navigation.goBack();
    } catch (error) {
      console.error('Error saving entry:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить запись');
    }
  };

  const renderMoodButton = (score) => {
    const emojis = ['😢', '😔', '😐', '🙂', '😊'];
    const emoji = emojis[Math.floor((score - 1) / 2)];
    const isSelected = moodScore === score;

    return (
      <TouchableOpacity
        key={score}
        style={[styles.moodButton, isSelected && styles.moodButtonSelected]}
        onPress={() => setMoodScore(score)}
      >
        <Text style={styles.moodEmoji}>{emoji}</Text>
        <Text style={styles.moodNumber}>{score}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FAFAFA']}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {entryId ? 'Редактировать запись' : 'Новая запись настроения'}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="heart" size={24} color="#8B7EC8" />
          <Text style={styles.sectionTitle}>Оценка настроения</Text>
        </View>
        <View style={styles.moodButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(renderMoodButton)}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="happy-outline" size={24} color="#8B7EC8" />
          <Text style={styles.sectionTitle}>Эмоции</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Опишите свои эмоции (например: тревога, радость, грусть)"
          placeholderTextColor="#A0AEC0"
          value={emotions}
          onChangeText={setEmotions}
          multiline
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="document-text-outline" size={24} color="#8B7EC8" />
          <Text style={styles.sectionTitle}>Заметки</Text>
        </View>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Что произошло сегодня? Как вы себя чувствуете?"
          placeholderTextColor="#A0AEC0"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="body-outline" size={24} color="#8B7EC8" />
          <Text style={styles.sectionTitle}>Физические симптомы</Text>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Головная боль, усталость, напряжение и т.д."
          placeholderTextColor="#A0AEC0"
          value={physicalSymptoms}
          onChangeText={setPhysicalSymptoms}
          multiline
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аудиозапись</Text>
        <View style={styles.audioControls}>
          {!recording && !audioUri && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={startRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#8B7EC8', '#A594D9']}
                style={styles.audioButtonGradient}
              >
                <Ionicons name="mic" size={24} color="#fff" />
                <Text style={styles.audioButtonText}>Начать запись</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {recording && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={stopRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E88A8A', '#F5A5A5']}
                style={styles.audioButtonGradient}
              >
                <Ionicons name="stop" size={24} color="#fff" />
                <Text style={styles.audioButtonText}>Остановить</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          {audioUri && !recording && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={playRecording}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#7FB3A3', '#9FC5B5']}
                style={styles.audioButtonGradient}
              >
                <Ionicons name="play" size={24} color="#fff" />
                <Text style={styles.audioButtonText}>Воспроизвести</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.saveButton} 
        onPress={saveEntry}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#8B7EC8', '#A594D9']}
          style={styles.saveButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.saveButtonText}>Сохранить</Text>
        </LinearGradient>
      </TouchableOpacity>
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
    letterSpacing: -0.8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 28,
    marginTop: 16,
    marginHorizontal: 24,
    borderRadius: 28,
    shadowColor: 'rgba(0, 0, 0, 0.04)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '400',
    color: '#3A3A3A',
    letterSpacing: -0.4,
  },
  moodButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E0F5',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  moodButtonSelected: {
    borderColor: '#8B7EC8',
    backgroundColor: '#F5F0FF',
    shadowColor: '#8B7EC8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodNumber: {
    fontSize: 11,
    color: '#718096',
    marginTop: 4,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E8E0F5',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#2D3748',
    backgroundColor: '#F7FAFC',
    minHeight: 50,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  audioControls: {
    flexDirection: 'row',
  },
  audioButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#8B7EC8',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  audioButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    gap: 10,
  },
  audioButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#8B7EC8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonGradient: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

