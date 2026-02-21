import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useData } from '../context/DataContext';
import { Card } from '../components/Card';

export default function SessionsScreen() {
  const { sessions, people, loading } = useData();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E50914" />
      </View>
    );
  }

  const getPerson = (id: string) => people.find(p => p.id === id);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }} edges={['top']}>
      <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Todas as Sessões</Text>
        <Text style={styles.subtitle}>{sessions.length} sessões registradas</Text>
      </View>

      {sessions.slice().reverse().map(session => (
        <Card key={session.id} style={styles.card}>
          <Text style={styles.date}>{session.dateISO}</Text>
          <Text style={styles.participants}>
            👥 {session.participantIds.map(id => getPerson(id)?.name || 'Desconhecido').join(', ')}
          </Text>
          {session.movies && session.movies.length > 0 && (
            <View style={styles.moviesSection}>
              <Text style={styles.moviesTitle}>🎬 Filmes:</Text>
              {session.movies.map((movie, idx) => (
                <Text key={idx} style={styles.movieItem}>
                  {idx + 1}. {movie.title}
                </Text>
              ))}
            </View>
          )}
          {session.sleepTimes && session.sleepTimes.length > 0 && (
            <View style={styles.sleepSection}>
              <Text style={styles.sleepTitle}>😴 Dormiram:</Text>
              {session.sleepTimes.map((st, idx) => (
                <Text key={idx} style={styles.sleepItem}>
                  • {getPerson(st.personId)?.name} às {st.time}
                </Text>
              ))}
            </View>
          )}
        </Card>
      ))}
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
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  card: {
    margin: 16,
    marginBottom: 8,
  },
  date: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E50914',
    marginBottom: 8,
  },
  participants: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 12,
  },
  moviesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  moviesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  movieItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
    marginBottom: 4,
  },
  sleepSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  sleepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C7AE0',
    marginBottom: 8,
  },
  sleepItem: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 8,
    marginBottom: 4,
  },
  bottomPadding: {
    height: 20,
  },
});
