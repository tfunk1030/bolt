import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

interface CardSubComponentProps {
  children: React.ReactNode;
  style?: ViewStyle | TextStyle;
}

export const Card = ({ children, style }: CardProps) => (
  <View style={[styles.card, style]}>{children}</View>
);

export const CardHeader = ({ children, style }: CardSubComponentProps) => (
  <View style={[styles.header, style]}>{children}</View>
);

export const CardTitle = ({ children, style }: CardSubComponentProps) => (
  <Text style={[styles.title, style]}>{children}</Text>
);

export const CardDescription = ({ children, style }: CardSubComponentProps) => (
  <Text style={[styles.description, style]}>{children}</Text>
);

export const CardContent = ({ children, style }: CardSubComponentProps) => (
  <View style={[styles.content, style]}>{children}</View>
);

export const CardFooter = ({ children, style }: CardSubComponentProps) => (
  <View style={[styles.footer, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#374151',
    marginVertical: 8,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F9FAFB',
  },
  description: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  content: {
    padding: 16,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});
