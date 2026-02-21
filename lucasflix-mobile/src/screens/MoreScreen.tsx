import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mais Opções</Text>
      <Text style={styles.subtitle}>Em breve: Mural do Sono, Daily Movies, Conquistas...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
});
