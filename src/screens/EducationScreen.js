import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function EducationScreen() {
  const articles = [
    {
      id: 1,
      title: 'Что такое выгорание?',
      content: 'Выгорание - это состояние эмоционального, физического и умственного истощения, вызванное чрезмерным и длительным стрессом. Оно часто возникает, когда человек чувствует себя перегруженным, эмоционально истощенным и неспособным справляться с постоянными требованиями.',
      icon: 'flame',
      color: '#ef4444',
    },
    {
      id: 2,
      title: 'Техники управления стрессом',
      content: 'Существует множество эффективных техник для управления стрессом: глубокое дыхание, медитация, физические упражнения, ведение дневника, творческие практики. Регулярное применение этих техник помогает снизить уровень стресса и улучшить общее самочувствие.',
      icon: 'leaf',
      color: '#10b981',
    },
    {
      id: 3,
      title: 'Тревожность и как с ней справляться',
      content: 'Тревожность - это нормальная реакция на стресс, но когда она становится чрезмерной, это может мешать повседневной жизни. Техники осознанности, дыхательные упражнения и когнитивно-поведенческие стратегии могут помочь справиться с тревожностью.',
      icon: 'heart',
      color: '#f59e0b',
    },
    {
      id: 4,
      title: 'Важность сна для психического здоровья',
      content: 'Качественный сон критически важен для психического здоровья. Недостаток сна может усугубить симптомы депрессии, тревожности и стресса. Старайтесь спать 7-9 часов в сутки и соблюдайте регулярный режим сна.',
      icon: 'moon',
      color: '#8b5cf6',
    },
    {
      id: 5,
      title: 'СДВГ: понимание и поддержка',
      content: 'СДВГ (синдром дефицита внимания и гиперактивности) - это нейроразнообразие, которое влияет на внимание, импульсивность и гиперактивность. Понимание своих особенностей и использование стратегий управления временем и задачами может значительно помочь.',
      icon: 'flash',
      color: '#3b82f6',
    },
    {
      id: 6,
      title: 'Творчество как терапия',
      content: 'Творческие практики, такие как рисование, письмо, музыка, могут быть мощными инструментами для выражения эмоций и снижения стресса. Они помогают обработать сложные чувства и найти новые способы самовыражения.',
      icon: 'color-palette',
      color: '#ec4899',
    },
  ];

  const [expandedId, setExpandedId] = React.useState(null);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Образование</Text>
        <Text style={styles.subtitle}>
          Узнайте больше о психическом здоровье
        </Text>
      </View>

      {articles.map((article) => (
        <TouchableOpacity
          key={article.id}
          style={styles.articleCard}
          onPress={() =>
            setExpandedId(expandedId === article.id ? null : article.id)
          }
        >
          <View style={styles.articleHeader}>
            <View style={[styles.iconContainer, { backgroundColor: `${article.color}20` }]}>
              <Ionicons name={article.icon} size={24} color={article.color} />
            </View>
            <View style={styles.articleInfo}>
              <Text style={styles.articleTitle}>{article.title}</Text>
            </View>
            <Ionicons
              name={expandedId === article.id ? 'chevron-up' : 'chevron-down'}
              size={24}
              color="#9ca3af"
            />
          </View>
          {expandedId === article.id && (
            <Text style={styles.articleContent}>{article.content}</Text>
          )}
        </TouchableOpacity>
      ))}

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color="#6366f1" />
        <Text style={styles.infoText}>
          Эта информация носит образовательный характер и не заменяет профессиональную медицинскую помощь. Если вы испытываете серьезные проблемы с психическим здоровьем, обратитесь к специалисту.
        </Text>
      </View>
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
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  articleCard: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  articleInfo: {
    flex: 1,
  },
  articleTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  articleContent: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 22,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#eef2ff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#4b5563',
    marginLeft: 12,
    lineHeight: 18,
  },
});

