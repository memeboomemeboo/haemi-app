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
 * Figma 스펙 플로팅 버튼 (node 68-4124/68-4125):
 * 47px 주황 원 안에 + 글리프 23px (40px 아이콘 박스의 20.83% inset)
 */
export const Fab: React.FC<FabProps> = ({ onPress, accessibilityLabel, style }) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [styles.fab, style, pressed && styles.pressed]}
    onPress={onPress}
  >
    <Plus size={23} color="#f5f5f5" />
  </Pressable>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 47,
    height: 47,
    borderRadius: 24,
    backgroundColor: '#fd6941',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
