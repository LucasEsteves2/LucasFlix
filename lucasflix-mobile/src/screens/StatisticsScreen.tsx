import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';

export default function StatisticsScreen() {
  const { people, sessions, loading } = useData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const totalMovies = sessions.reduce((sum, s) => sum + (s.movies?.length || 0), 0);
  const totalNaps = people.reduce((sum, p) => sum + (p.stats?.totalNaps || 0), 0);
  const totalSleepMinutes = people.reduce((sum, p) => sum + (p.stats?.totalSleepMinutes || 0), 0);
  const avgSleepMinutes = totalNaps > 0 ? Math.round(totalSleepMinutes / totalNaps) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Estatísticas</Text>
      </View>

      <View style={styles.section}>
        <Card gradient={true} style={styles.statCard}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Sessões Realizadas</Text>
        </Card>

        <Card gradient={true} style={styles.statCard}>
          <Text style={styles.statValue}>{totalMovies}</Text>
          <Text style={styles.statLabel}>Filmes Assistidos</Text>
        </Card>

        <Card gradient={true} style={styles.statCard}>
          <Text style={styles.statValue}>{totalNaps}</Text>
          <Text style={styles.statLabel}>Sonecas Totais</Text>
        </Card>

        <Card gradient={true} style={styles.statCard}>
          <Text style={styles.statValue}>{avgSleepMinutes} min</Text>
          <Text style={styles.statLabel}>Média de Soneca</Text>
        </Card>
      </View>

      {/* Estatísticas por Pessoa */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Por Pessoa</Text>
        {people.filter(p => !p.isAlternative && p.isVisible).map(person => (
          <Card key={person.id} style={styles.personCard}>
            <Text style={styles.personName}>{person.name}</Text>
            <View style={styles.personStats}>
              <View style={styles.personStat}>
                <Text style={styles.personStatValue}>{person.stats.totalSessions}</Text>
                <Text style={styles.personStatLabel}>Sessões</Text>
              </View>
              <View style={styles.personStat}>
                <Text style={styles.personStatValue}>{person.stats.totalSurvived}</Text>
                <Text style={styles.personStatLabel}>Acordado</Text>
              </View>
              <View style={styles.personStat}>
                <Text style={styles.personStatValue}>{person.stats.totalNaps}</Text>
                <Text style={styles.personStatLabel}>Sonecas</Text>
              </View>
              <View style={styles.personStat}>
                <Text style={styles.personStatValue}>
                  {person.stats.totalSessions > 0
                    ? Math.round((person.stats.totalSurvived / person.stats.totalSessions) * 100)
                    : 0}
                  %
                </Text>
                <Text style={styles.personStatLabel}>Taxa</Text>
              </View>
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
  statCard: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#E50914',
  },
  statLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  personCard: {
    marginBottom: 12,
  },
  personName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  personStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  personStat: {
    alignItems: 'center',
  },
  personStatValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#6C7AE0',
  },
  personStatLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
