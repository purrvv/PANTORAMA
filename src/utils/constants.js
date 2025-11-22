// Константы приложения - Премиальная белая палитра

export const COLORS = {
  // Основные цвета - мягкие, расслабляющие тона
  primary: '#C4B5E8', // Очень мягкий лавандовый
  primaryLight: '#D8CDEF',
  primaryDark: '#A896D4',
  secondary: '#E8E0F5', // Почти белый с легким оттенком
  accent: '#F5F0FF', // Почти белый
  
  // Функциональные цвета - очень мягкие
  success: '#B8D4C8', // Мягкий мятный
  warning: '#F5D5B8', // Мягкий персиковый
  error: '#F5C8C8', // Мягкий розовый
  info: '#C8D8E8', // Мягкий голубой
  
  // Текст - мягкие серые
  text: {
    primary: '#3A3A3A', // Мягкий темно-серый
    secondary: '#8A8A8A', // Средний серый
    light: '#B8B8B8', // Светлый серый
    white: '#FFFFFF',
    muted: '#D0D0D0',
  },
  
  // Фоны - белые и кремовые тона
  background: {
    primary: '#FFFFFF', // Чистый белый
    secondary: '#FAFAFA', // Почти белый
    tertiary: '#F5F5F5', // Очень светлый серый
    cream: '#FFFBF5', // Кремовый
    soft: '#FEFEFE', // Почти белый с легким теплом
    gradient: ['#FFFFFF', '#FAFAFA', '#F5F5F5'],
    warm: ['#FFFBF5', '#FFFFFF', '#FAFAFA'],
  },
  
  // Градиенты - очень мягкие, едва заметные
  gradients: {
    primary: ['#F5F0FF', '#FFFFFF', '#FAFAFA'],
    calm: ['#F0F8F5', '#FFFFFF', '#FAFAFA'],
    energy: ['#FFF8F0', '#FFFFFF', '#FAFAFA'],
    peace: ['#F8F5FF', '#FFFFFF', '#FAFAFA'],
    soft: ['#FFFFFF', '#FAFAFA', '#F5F5F5'],
  },
  
  // Тени - очень мягкие
  shadow: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.08)',
    soft: 'rgba(200, 200, 200, 0.3)',
  },
  
  // Границы - едва заметные
  border: {
    light: '#F0F0F0',
    medium: '#E8E8E8',
    soft: '#F5F5F5',
  },
};

export const MOOD_EMOJIS = {
  1: '😢',
  2: '😔',
  3: '😐',
  4: '🙂',
  5: '😊',
};

export const MOOD_COLORS = {
  1: '#dc2626',
  2: '#ef4444',
  3: '#f59e0b',
  4: '#3b82f6',
  5: '#10b981',
};

export const EXERCISE_TYPES = {
  BREATHING: 'breathing',
  DRAWING: 'drawing',
  MEDITATION: 'meditation',
  RELAXATION: 'relaxation',
};

export const NOTIFICATION_TIMES = {
  MORNING: { hour: 9, minute: 0 },
  EVENING: { hour: 20, minute: 0 },
};

