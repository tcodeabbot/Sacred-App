import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/constants/colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gradient?: readonly string[];
  padding?: number;
}

export function Card({ children, style, gradient, padding = 20 }: CardProps) {
  if (gradient) {
    return (
      <LinearGradient
        colors={gradient as unknown as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { padding }, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  
  return (
    <View style={[styles.card, styles.solidCard, { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  solidCard: {
    backgroundColor: colors.card,
  },
});
