import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

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

const DEFAULT_SIZE = 24;

export const Icon: React.FC<IconProps> = ({
  name,
  size = DEFAULT_SIZE,
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
  });

  const renderIcon = () => {
    // Icon placeholder - SVG or image assets would be imported here
    // For now, returning a colored square as placeholder
    return (
      <View
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: 4,
          opacity: 0.3,
        }}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderIcon()}
    </View>
  );
};

// Icon size presets
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 48,
} as const;