import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  PanResponder,
} from 'react-native';
import { Svg, Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { executeQuery } from '../database/db';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;

export default function DrawingExerciseScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);

  const colors = ['#6366f1', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#000000'];

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const newPath = `M ${locationX} ${locationY}`;
        setCurrentPath(newPath);
        setIsDrawing(true);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setCurrentPath((prev) => {
          if (!prev) return `M ${locationX} ${locationY}`;
          return `${prev} L ${locationX} ${locationY}`;
        });
      },
      onPanResponderRelease: () => {
        if (currentPath) {
          setPaths((prevPaths) => [...prevPaths, { path: currentPath, color, size: brushSize }]);
        }
        setCurrentPath('');
        setIsDrawing(false);
      },
    })
  ).current;

  const clearCanvas = () => {
    Alert.alert(
      'Очистить холст?',
      'Вы уверены, что хотите очистить рисунок?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Очистить',
          style: 'destructive',
          onPress: () => {
            setPaths([]);
            setCurrentPath('');
          },
        },
      ]
    );
  };

  const saveDrawing = async () => {
    try {
      await executeQuery(
        `INSERT INTO exercises (user_id, exercise_type, exercise_data, duration, created_at) 
         VALUES (?, ?, ?, ?, datetime("now"))`,
        [user.id, 'drawing', JSON.stringify({ paths: paths.length }), 0]
      );
      Alert.alert('Успешно', 'Рисунок сохранен в журнал упражнений');
      navigation.goBack();
    } catch (error) {
      console.error('Error saving drawing:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить рисунок');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Творческое рисование</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.canvasContainer} {...panResponder.panHandlers}>
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          {paths.map((item, index) => (
            <Path
              key={index}
              d={item.path}
              stroke={item.color}
              strokeWidth={item.size}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {currentPath && (
            <Path
              d={currentPath}
              stroke={color}
              strokeWidth={brushSize}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          )}
        </Svg>
      </View>

      <View style={styles.controls}>
        <View style={styles.colorPicker}>
          {colors.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.colorButton,
                { backgroundColor: c },
                color === c && styles.colorButtonSelected,
              ]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        <View style={styles.brushControls}>
          <Text style={styles.brushLabel}>Размер кисти:</Text>
          <View style={styles.brushSizes}>
            {[2, 4, 6, 8].map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.brushButton,
                  brushSize === size && styles.brushButtonSelected,
                ]}
                onPress={() => setBrushSize(size)}
              >
                <View
                  style={[
                    styles.brushIndicator,
                    { width: size * 2, height: size * 2 },
                  ]}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.clearButton} onPress={clearCanvas}>
            <Ionicons name="trash-outline" size={20} color="#ef4444" />
            <Text style={styles.clearButtonText}>Очистить</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={saveDrawing}>
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Выразите свои эмоции через рисование. Не нужно быть художником - просто рисуйте то, что чувствуете.
        </Text>
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
  canvasContainer: {
    margin: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
  },
  controls: {
    padding: 20,
    backgroundColor: '#fff',
  },
  colorPicker: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  colorButtonSelected: {
    borderColor: '#6366f1',
    borderWidth: 3,
  },
  brushControls: {
    marginBottom: 20,
  },
  brushLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  brushSizes: {
    flexDirection: 'row',
    gap: 12,
  },
  brushButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brushButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  brushIndicator: {
    borderRadius: 50,
    backgroundColor: '#6366f1',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ef4444',
    gap: 8,
  },
  clearButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});

