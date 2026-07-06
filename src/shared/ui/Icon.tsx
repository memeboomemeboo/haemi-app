import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { spacing, borderRadius } from '@/shared/constants';

export type IconName =
  | 'Home'
  | 'Album'
  | 'Report'
  | 'Setting'
  | 'Alarm'
  | 'Profile'
  | 'Arrow'
  | 'Check'
  | 'Graph'
  | 'Plus'
  | 'Picture'
  | 'Calendar'
  | 'Map'
  | 'People'
  | 'Heart'
  | 'Comment'
  | 'More'
  | 'Sent'
  | 'Quiz'
  | 'Circle';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// Icon size presets from spacing tokens
export const ICON_SIZES = {
  xs: spacing.xs + spacing.xs, // 8
  sm: spacing.xl - spacing.sm, // 12
  md: spacing.xl, // 20
  lg: spacing['2xl'] + spacing.lg, // 40
  xl: spacing['3xl'] - spacing.md, // 20
} as const;

export const Icon: React.FC<IconProps> = ({
  name,
  size = ICON_SIZES.md,
  color = '#0c0c0d',
  style,
}) => {
  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
    },
    icon: {
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: borderRadius.xs,
      opacity: 0.3,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.icon} />
    </View>
  );
};