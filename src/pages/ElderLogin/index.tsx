import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useElderProfile } from '@/entities/elder';
import { authService } from '@/shared/api';
import { pinStorage } from '@/features/auth';
import { setAuthToken, setRefreshToken } from '@/shared/api/client';
import { useUserContext } from '@/shared/context/UserContext';
import { useTheme } from '@/shared/hooks';
import { getOrCreateDeviceId, shuffleArray } from '@/shared/lib';
import { Backspace } from '@/shared/ui';

const logoSource = require('../../../assets/images/haemi-logo.png');

const PIN_LENGTH = 6;
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

type KeypadCell = { type: 'digit'; value: string } | { type: 'empty' } | { type: 'delete' };

function buildKeypad(digits: string[]): KeypadCell[] {
  return [
    ...digits.slice(0, 9).map((value): KeypadCell => ({ type: 'digit', value })),
    { type: 'empty' },
    { type: 'digit', value: digits[9] },
    { type: 'delete' },
  ];
}

/** 어르신 PIN 로그인 화면 (Figma node 1408:5558) */
export default function ElderLoginScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useElderProfile();
  const { setToken, setRole } = useUserContext();

  const [digits, setDigits] = useState(() => shuffleArray(DIGITS));
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const keypad = useMemo(() => buildKeypad(digits), [digits]);

  const handleDigitPress = async (digit: string) => {
    if (pin.length >= PIN_LENGTH) {
      return;
    }
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMessage(null);

    if (nextPin.length === PIN_LENGTH) {
      try {
        const loginId = await pinStorage.getElderLoginId();
        if (!loginId) {
          setErrorMessage('먼저 초기 설정이 필요합니다.');
          setPin('');
          setDigits(shuffleArray(DIGITS));
          router.replace('/elder-signup' as Href);
          return;
        }
        const deviceId = await getOrCreateDeviceId();
        const tokens = await authService.loginWithPin({ loginId, pin: nextPin, deviceId });
        await setAuthToken(tokens.accessToken);
        await setRefreshToken(tokens.refreshToken);
        setToken(tokens.accessToken);
        setRole('ELDER');
        router.replace('/elder-home' as Href);
      } catch {
        setPin('');
        setDigits(shuffleArray(DIGITS));
        setErrorMessage('비밀번호가 올바르지 않아요.');
      }
    }
  };

  const handleDelete = () => {
    setPin((current) => current.slice(0, -1));
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.introGroup}>
            <View style={styles.logoTextGroup}>
              <Image source={logoSource} style={styles.logo} resizeMode="contain" />
              <View style={styles.textGroup}>
                <Text style={styles.title}>{profile?.honorificName ?? ''}, 반가워요</Text>
                <Text style={styles.subtitle}>비밀번호 {PIN_LENGTH}자리를 입력해주세요</Text>
              </View>
            </View>

            <View style={styles.dotsRow}>
              {Array.from({ length: PIN_LENGTH }, (_, index) => (
                <View key={index} style={[styles.dot, index < pin.length && styles.dotFilled]} />
              ))}
            </View>

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}
          </View>

          <View style={styles.divider} />

          <View style={styles.keypad}>
            {keypad.map((cell, index) => (
              <KeypadButton
                key={index}
                cell={cell}
                styles={styles}
                color={theme.colors.line.normal}
                onDigitPress={handleDigitPress}
                onDelete={handleDelete}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function KeypadButton({
  cell,
  styles,
  color,
  onDigitPress,
  onDelete,
}: {
  cell: KeypadCell;
  styles: ReturnType<typeof createStyles>;
  color: string;
  onDigitPress: (digit: string) => void;
  onDelete: () => void;
}) {
  if (cell.type === 'digit') {
    return (
      <Pressable
        style={({ pressed }) => [styles.keyCell, pressed && styles.keyCellPressed]}
        onPress={() => onDigitPress(cell.value)}
      >
        <Text style={styles.keyDigit}>{cell.value}</Text>
      </Pressable>
    );
  }

  if (cell.type === 'empty') {
    return <View style={styles.keyCell} />;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="지우기"
      style={({ pressed }) => [styles.keyCell, pressed && styles.keyCellPressed]}
      onPress={onDelete}
    >
      <Backspace size={24} color={color} />
    </Pressable>
  );
}

const createStyles = ({ colors, status }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'center',
    },
    content: {
      alignItems: 'center',
      paddingHorizontal: 24,
      gap: 40,
    },
    introGroup: {
      alignItems: 'center',
      gap: 73,
    },
    logoTextGroup: {
      alignItems: 'center',
      gap: 20,
    },
    logo: {
      width: 206,
      height: 82,
    },
    textGroup: {
      alignItems: 'center',
      gap: 8,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.label.neutral,
      letterSpacing: -0.64,
    },
    subtitle: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.4,
    },
    dotsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    dot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.label.disabled,
    },
    dotFilled: {
      backgroundColor: colors.primary,
    },
    errorText: {
      fontSize: 18,
      fontWeight: '500',
      color: status.error,
      letterSpacing: -0.36,
    },
    divider: {
      height: 3,
      width: '100%',
      backgroundColor: colors.label.disabled,
    },
    keypad: {
      width: '100%',
      maxWidth: 329,
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 45,
    },
    keyCell: {
      width: '33.33%',
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
    },
    keyCellPressed: {
      opacity: 0.6,
    },
    keyDigit: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.label.neutral,
      letterSpacing: -0.64,
    },
  });
