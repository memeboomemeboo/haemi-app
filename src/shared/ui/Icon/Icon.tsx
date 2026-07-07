import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { spacing, borderRadius } from '@/shared/constants';
import { IconName, IconProps } from './types';
import { ICON_SVG_MAP } from './icons';

export const ICON_SIZES = {
  xs: spacing.xs + spacing.xs,
  sm: spacing.md + spacing.xs,
  md: spacing.xl,
  lg: spacing['2xl'] + spacing.lg,
  xl: spacing['5xl'],
} as const;

const IconComponent: React.FC<IconProps> = ({
  name,
  size = ICON_SIZES.md,
  color = '#0c0c0d',
  style,
}) => {
  const svgContent = ICON_SVG_MAP[name];

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
    },
  });

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <div
          style={{
            width: size,
            height: size,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: borderRadius.xs,
          opacity: 0.3,
        }}
      />
    </View>
  );
};

export { IconComponent as Icon };
export type { IconName, IconProps };
export { ICON_SVG_MAP };
