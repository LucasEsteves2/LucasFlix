import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function SessionDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Detalhes da Sessão</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});
