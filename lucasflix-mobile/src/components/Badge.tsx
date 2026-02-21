import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface BadgeProps {
  text: string;
  variant?: 'primary' | 'success' | 'warning' | 'info';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ text, variant = 'primary', style }) => {
  const variantStyles = {
    primary: { backgroundColor: '#E50914' },
    success: { backgroundColor: '#0F9D58' },
    warning: { backgroundColor: '#F4B400' },
    info: { backgroundColor: '#6C7AE0' },
  };

  return (
    <View style={[styles.badge, variantStyles[variant], style]}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});
