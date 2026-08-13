import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { Plus } from './Icon';

interface FabProps {
  onPress?: () => void;
  accessibilityLabel?: string;
  /** 페이지별 위치(bottom 등)는 페이지가 제어한다 */
  style?: ViewStyle;
}

/**
 * Figma 스펙 플로팅 버튼:
 * 60px 주황 원 안에 + 글리프를 중앙 정렬한다.
 */
export const Fab: React.FC<FabProps> = ({ onPress, accessibilityLabel, style }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.fab, style, pressed && styles.pressed]}
    onPress={onPress}
  >
    <Plus size={51} color="#f5f5f5" />
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fd6941',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2.4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.8,
    elevation: 5,
  },
  pressed: {
    opacity: 0.85,
  },
});
