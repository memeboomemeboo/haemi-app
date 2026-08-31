import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useElderProfile } from '@/entities/elder';
import { authService, isApiError, isNetworkError } from '@/shared/api';
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

interface ElderLoginScreenProps {
  /** 이 기기를 어르신 모드에서 풀고 가족 로그인으로 돌아가는 경로. 없으면 버튼을 숨긴다. */
  onGuardianLoginPress?: () => void;
}

/** 어르신 PIN 로그인 화면 (Figma node 1408:5558) */
export default function ElderLoginScreen({ onGuardianLoginPress }: ElderLoginScreenProps = {}) {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useElderProfile();
  const { setToken, setRole } = useUserContext();

  const [digits, setDigits] = useState(() => shuffleArray(DIGITS));
  const [pin, setPin] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // 검증 중 지우기·재입력으로 두 번째 로그인 요청이 나가면 서버 실패 카운터를 두 배로 소모한다.
  const [isSubmitting, setSubmitting] = useState(false);

  const keypad = useMemo(() => buildKeypad(digits), [digits]);

  /** 로그인 실패 원인을 어르신이 이해할 수 있는 안내 문구로 바꾼다. */
  const toLoginErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return '인터넷 연결을 확인한 뒤 다시 해주세요.';
    }
    if (isApiError(error)) {
      if (error.code === 'AUTH_ACCOUNT_LOCKED' || error.statusCode === 423) {
        return '비밀번호를 여러 번 틀려서 잠겼어요.\n조금 뒤에 다시 해주세요.';
      }
      if (error.code === 'INVALID_CREDENTIALS' || error.statusCode === 401) {
        return '비밀번호가 올바르지 않아요.';
      }
      if (error.statusCode >= 500) {
        return '잠시 문제가 생겼어요. 조금 뒤에 다시 해주세요.';
      }
    }
    return '로그인하지 못했어요. 잠시 뒤에 다시 해주세요.';
  };

  const handleDigitPress = async (digit: string) => {
    if (isSubmitting || pin.length >= PIN_LENGTH) {
      return;
    }
    const nextPin = pin + digit;
    setPin(nextPin);
    setErrorMessage(null);

    if (nextPin.length !== PIN_LENGTH) {
      return;
    }

    setSubmitting(true);
    const loginId = await pinStorage.getElderLoginId();
    if (!loginId) {
      setPin('');
      setDigits(shuffleArray(DIGITS));
      setSubmitting(false);
      router.replace('/elder-signup' as Href);
      return;
    }

    let tokens;
    try {
      const deviceId = await getOrCreateDeviceId();
      tokens = await authService.loginWithPin({ loginId, pin: nextPin, deviceId });
    } catch (error) {
      setPin('');
      setDigits(shuffleArray(DIGITS));
      setErrorMessage(toLoginErrorMessage(error));
      setSubmitting(false);
      return;
    }

    // 로그인 자체는 성공했으므로, 이후 저장 실패는 비밀번호 오류로 안내하지 않는다.
    try {
      await setAuthToken(tokens.accessToken);
      await setRefreshToken(tokens.refreshToken);
    } catch {
      setPin('');
      setDigits(shuffleArray(DIGITS));
      setErrorMessage('로그인 정보를 저장하지 못했어요. 다시 해주세요.');
      setSubmitting(false);
      return;
    }

    setToken(tokens.accessToken);
    setRole('ELDER');
    router.replace('/elder-home' as Href);
  };

  const handleDelete = () => {
    if (isSubmitting) {
      return;
    }
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

          {onGuardianLoginPress ? (
            <Pressable
              onPress={onGuardianLoginPress}
              disabled={isSubmitting}
              hitSlop={8}
              accessibilityRole="button"
              style={styles.guardianLink}
            >
              <Text style={styles.guardianLinkText}>가족으로 로그인하기</Text>
            </Pressable>
          ) : null}
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
      textAlign: 'center',
      fontSize: 18,
      fontWeight: '500',
      color: status.error,
      letterSpacing: -0.36,
    },
    guardianLink: {
      alignSelf: 'center',
      paddingVertical: 12,
    },
    guardianLinkText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      textDecorationLine: 'underline',
      letterSpacing: -0.32,
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
