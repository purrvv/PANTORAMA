import axios from 'axios';
import { executeQuery } from '../database/db';

const PERPLEXITY_API_KEY = 'YOUR_PERPLEXITY_API_KEY'; // Замените на ваш Perplexity API ключ
const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions';

export const getAIRecommendation = async (userId, moodHistory, currentMood) => {
  try {
    // Получаем историю настроения пользователя
    const moodData = await executeQuery(
      `SELECT mood_score, emotions, notes, created_at 
       FROM mood_entries 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 7`,
      [userId]
    );

    const recentMoods = [];
    for (let i = 0; i < moodData.rows.length; i++) {
      recentMoods.push(moodData.rows.item(i));
    }

    // Формируем промпт для ИИ
    const prompt = `Ты - персональный помощник по психическому здоровью. 
    Пользователь испытывает следующие эмоции: ${currentMood.emotions || 'не указано'}.
    Оценка настроения: ${currentMood.mood_score}/10.
    Последние записи: ${JSON.stringify(recentMoods.slice(0, 3))}.
    
    Предложи персональную рекомендацию для улучшения состояния. 
    Это может быть дыхательное упражнение, творческая практика, медитация или другой способ снятия стресса.
    Ответ должен быть коротким (2-3 предложения) и поддерживающим.`;

    // Если API ключ не настроен, возвращаем дефолтные рекомендации
    if (!PERPLEXITY_API_KEY || PERPLEXITY_API_KEY === 'YOUR_PERPLEXITY_API_KEY') {
      return getDefaultRecommendation(currentMood);
    }

    const response = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: 'sonar-medium-online',
        messages: [
          {
            role: 'system',
            content: 'Ты - заботливый помощник по психическому здоровью. Отвечай на русском языке. Давай короткие, поддерживающие рекомендации (2-3 предложения).'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const recommendation = response.data.choices[0].message.content;

    // Сохраняем рекомендацию в базу данных
    await executeQuery(
      'INSERT INTO ai_recommendations (user_id, recommendation_text, created_at) VALUES (?, ?, datetime("now"))',
      [userId, recommendation]
    );

    return recommendation;
  } catch (error) {
    console.error('AI recommendation error:', error);
    return getDefaultRecommendation(currentMood);
  }
};

const getDefaultRecommendation = (currentMood) => {
  const score = currentMood.mood_score || 5;
  
  if (score <= 3) {
    return 'Рекомендую попробовать дыхательное упражнение "4-7-8" для успокоения. Также попробуйте нарисовать что-то абстрактное - это поможет выразить эмоции.';
  } else if (score <= 6) {
    return 'Попробуйте короткую медитацию на 5 минут или прогуляйтесь на свежем воздухе. Небольшие физические упражнения также помогут улучшить настроение.';
  } else {
    return 'Отлично, что вы чувствуете себя хорошо! Поддерживайте это состояние с помощью регулярных практик осознанности и творческих упражнений.';
  }
};

export const analyzeMoodTrends = async (userId) => {
  try {
    const result = await executeQuery(
      `SELECT mood_score, created_at 
       FROM mood_entries 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT 30`,
      [userId]
    );

    const moods = [];
    for (let i = 0; i < result.rows.length; i++) {
      moods.push(result.rows.item(i));
    }

    const avgMood = moods.length > 0
      ? moods.reduce((sum, m) => sum + m.mood_score, 0) / moods.length
      : 0;

    const trend = moods.length >= 2
      ? moods[0].mood_score - moods[moods.length - 1].mood_score
      : 0;

    return {
      average: avgMood,
      trend: trend > 0 ? 'improving' : trend < 0 ? 'declining' : 'stable',
      dataPoints: moods.length,
    };
  } catch (error) {
    console.error('Mood analysis error:', error);
    return { average: 0, trend: 'stable', dataPoints: 0 };
  }
};

