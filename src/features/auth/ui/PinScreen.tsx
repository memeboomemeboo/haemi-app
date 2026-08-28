import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useRef, useState } from 'react';
import { colors } from '@/shared/constants';
import { getErrorMessage } from '@/shared/api';

const KEYS = ['0', '6', '3', '4', '2', '5', '1', '7', '9', '', '8', 'delete'] as const;

interface PinScreenProps {
  mode: 'setup' | 'login';
  onComplete: (pin: string) => Promise<void> | void;
  onBackToSignup?: () => void;
}

export function PinScreen({ mode, onComplete, onBackToSignup }: PinScreenProps) {
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
  }, [mode, onComplete, pin]);

  const handleKey = (key: (typeof KEYS)[number]) => {
    setError('');
    if (key === 'delete') {
      setPin((value) => value.slice(0, -1));
      return;
    }
    if (key && pin.length < 6) setPin((value) => value + key);
  };

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 54) }]}>
      <View style={styles.hero}>
        <Image source={require('@/../assets/images/haemi-logo.png')} style={styles.logo} resizeMode="contain" />
        <View style={styles.copy}>
          <Text style={styles.title}>만나서 반가워요</Text>
          <Text style={styles.description}>간편 PIN 6자리를 입력해주세요</Text>
        </View>
      </View>
      <View style={styles.dots} accessibilityLabel={`PIN ${pin.length}자리 입력됨`}>
        {Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.dot, index < pin.length && styles.dotFilled]} />)}
      </View>
      <Text style={styles.error} numberOfLines={2}>{error}</Text>
      <View style={styles.divider} />
      <View style={styles.keypad}>
        {KEYS.map((key, index) => (
          <Pressable key={`${key}-${index}`} disabled={!key} accessibilityRole={key ? 'button' : undefined} accessibilityLabel={key === 'delete' ? '한 자리 지우기' : key || undefined} onPress={() => handleKey(key)} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
            <Text style={key === 'delete' ? styles.delete : styles.keyText}>{key === 'delete' ? '⌫' : key}</Text>
          </Pressable>
        ))}
      </View>
      {onBackToSignup ? <Pressable onPress={onBackToSignup} style={styles.signupLink}><Text style={styles.signupLinkText}>{mode === 'login' ? '다른 계정으로 회원 가입' : '회원가입 정보 다시 입력'}</Text></Pressable> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: colors.light.background.normal },
  hero: { alignItems: 'center', gap: 20, marginTop: 54 }, logo: { width: 206, height: 82 }, copy: { alignItems: 'center', gap: 8 },
  title: { color: colors.light.label.neutral, fontSize: 24, fontWeight: '700', lineHeight: 31, letterSpacing: -0.48 },
  description: { color: colors.light.label.assistive, fontSize: 14, fontWeight: '500', lineHeight: 18, letterSpacing: -0.28 },
  dots: { height: 18, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 73 }, dot: { width: 14, height: 14, borderRadius: 7, backgroundColor: colors.light.fill.alternative }, dotFilled: { backgroundColor: colors.primary },
  error: { width: 330, minHeight: 36, marginTop: 8, color: colors.status.error, fontSize: 13, lineHeight: 18, textAlign: 'center' }, divider: { width: '100%', height: 2, marginTop: 8, backgroundColor: colors.light.fill.normal },
  keypad: { width: 330, flexDirection: 'row', flexWrap: 'wrap', marginTop: 25 }, key: { width: 110, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: 38 }, keyPressed: { backgroundColor: colors.light.fill.normal },
  keyText: { color: colors.light.label.neutral, fontSize: 24, fontWeight: '700', lineHeight: 31, letterSpacing: -0.48 }, delete: { color: colors.light.label.neutral, fontSize: 30, lineHeight: 32 },
  signupLink: { padding: 12 }, signupLinkText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
});
