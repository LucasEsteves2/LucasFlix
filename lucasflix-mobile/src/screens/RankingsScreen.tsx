import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';
import { Avatar } from '../components/Avatar';
import { Badge } from '../components/Badge';

export default function RankingsScreen() {
  const { people, sessions, loading } = useData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const visiblePeople = people.filter(p => !p.isAlternative && p.isVisible);

  // Ranking de Acordados
  const awakeRanking = visiblePeople
    .map(p => ({
      person: p,
      count: p.stats.totalSurvived,
    }))
    .sort((a, b) => b.count - a.count);

  // Ranking de Dorminhoco
  const sleepRanking = visiblePeople
    .map(p => ({
      person: p,
      count: p.stats.totalNaps,
    }))
    .sort((a, b) => b.count - a.count);

  // Ranking de Participações
  const participationRanking = visiblePeople
    .map(p => ({
      person: p,
      count: p.stats.totalSessions,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🏆 Rankings</Text>
      </View>

      {/* Mais Acordado */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👑 Mais Acordado</Text>
        {awakeRanking.map((item, index) => (
          <Card key={item.person.id} style={styles.rankCard}>
            <View style={styles.rankContent}>
              <Text style={styles.rankPosition}>#{index + 1}</Text>
              <Avatar name={item.person.name} size={50} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.person.name}</Text>
                <Text style={styles.rankStat}>{item.count} sessões acordado</Text>
              </View>
              {index === 0 && <Badge text="👑" variant="warning" />}
            </View>
          </Card>
        ))}
      </View>

      {/* Mais Dorminhoco */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>😴 Mais Dorminhoco</Text>
        {sleepRanking.map((item, index) => (
          <Card key={item.person.id} style={styles.rankCard}>
            <View style={styles.rankContent}>
              <Text style={styles.rankPosition}>#{index + 1}</Text>
              <Avatar name={item.person.name} size={50} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.person.name}</Text>
                <Text style={styles.rankStat}>{item.count} sonecas</Text>
              </View>
              {index === 0 && <Badge text="😴" variant="info" />}
            </View>
          </Card>
        ))}
      </View>

      {/* Mais Participativo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Mais Participativo</Text>
        {participationRanking.map((item, index) => (
          <Card key={item.person.id} style={styles.rankCard}>
            <View style={styles.rankContent}>
              <Text style={styles.rankPosition}>#{index + 1}</Text>
              <Avatar name={item.person.name} size={50} />
              <View style={styles.rankInfo}>
                <Text style={styles.rankName}>{item.person.name}</Text>
                <Text style={styles.rankStat}>{item.count} participações</Text>
              </View>
              {index === 0 && <Badge text="⭐" variant="success" />}
            </View>
          </Card>
        ))}
      </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  rankCard: {
    marginBottom: 12,
  },
  rankContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rankPosition: {
    fontSize: 24,
    fontWeight: '900',
    color: '#E50914',
    width: 40,
  },
  rankInfo: {
    flex: 1,
  },
  rankName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  rankStat: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  bottomPadding: {
    height: 20,
  },
});
