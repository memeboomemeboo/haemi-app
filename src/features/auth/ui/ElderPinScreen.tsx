import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { colors } from '@/shared/constants';
import { getErrorMessage } from '@/shared/api';

const KEYS = ['0', '6', '3', '4', '2', '5', '1', '7', '9', '', '8', 'delete'] as const;

interface ElderPinScreenProps {
  onComplete: (pin: string) => Promise<void> | void;
  onBack: () => void;
}

export function ElderPinScreen({ onComplete, onBack }: ElderPinScreenProps) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (pin.length !== 6 || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    void Promise.resolve(onComplete(pin)).catch((caught: unknown) => {
      setPin('');
      setError(getErrorMessage(caught));
      isSubmittingRef.current = false;
    });
  }, [onComplete, pin]);

  const handleKey = (key: (typeof KEYS)[number]) => {
    setError('');
    if (key === 'delete') {
      setPin((value) => value.slice(0, -1));
      return;
    }
    if (key && pin.length < 6) setPin((value) => value + key);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Pressable accessibilityRole="button" accessibilityLabel="역할 선택으로 돌아가기" onPress={onBack} style={styles.backButton} hitSlop={12}>
        <Ionicons name="chevron-back" size={24} color={colors.light.label.neutral} />
      </Pressable>
      <View style={styles.main}>
        <View style={styles.header}>
          <Image source={require('@/../assets/images/haemi-logo.png')} style={styles.logo} resizeMode="contain" />
          <View style={styles.copy}>
            <Text style={styles.title}>어르신, 반가워요</Text>
            <Text style={styles.description}>비밀번호 6자리를 입력해주세요</Text>
          </View>
        </View>

        <View style={styles.dots} accessibilityLabel={`PIN ${pin.length}자리 입력됨`}>
          {Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.dot, index < pin.length && styles.dotFilled]} />)}
        </View>
        <Text style={styles.error}>{error}</Text>
        <View style={styles.divider} />
        <View style={styles.keypad}>
          {KEYS.map((key, index) => (
            <Pressable
              key={`${key}-${index}`}
              disabled={!key}
              accessibilityRole={key ? 'button' : undefined}
              accessibilityLabel={key === 'delete' ? '한 자리 지우기' : key || undefined}
              onPress={() => handleKey(key)}
              style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}
            >
              {key === 'delete'
                ? <Ionicons name="backspace-outline" size={32} color={colors.light.label.neutral} />
                : <Text style={styles.keyText}>{key}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background.normal },
  backButton: { position: 'absolute', top: 58, left: 20, zIndex: 1, padding: 8 },
  main: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { alignItems: 'center', gap: 20 },
  logo: { width: 206, height: 82 },
  copy: { alignItems: 'center', gap: 8 },
  title: { color: colors.light.label.neutral, fontSize: 32, fontWeight: '700', lineHeight: 42, letterSpacing: -0.64 },
  description: { color: colors.light.label.assistive, fontSize: 20, fontWeight: '500', lineHeight: 26, letterSpacing: -0.4 },
  dots: { height: 24, flexDirection: 'row', alignItems: 'center', gap: 13, marginTop: 73 },
  dot: { width: 24, height: 24, borderRadius: 12, backgroundColor: colors.light.label.disabled },
  dotFilled: { backgroundColor: colors.primary },
  error: { width: 330, height: 22, marginTop: 10, color: colors.status.error, fontSize: 15, lineHeight: 21, textAlign: 'center' },
  divider: { width: '100%', height: 3, marginTop: 28, backgroundColor: colors.light.label.disabled },
  keypad: { width: 330, flexDirection: 'row', flexWrap: 'wrap', marginTop: 37 },
  key: { width: 110, height: 64, alignItems: 'center', justifyContent: 'center', borderRadius: 32 },
  keyPressed: { backgroundColor: colors.light.fill.normal },
  keyText: { color: colors.light.label.neutral, fontSize: 32, fontWeight: '700', lineHeight: 42, letterSpacing: -0.64 },
});
