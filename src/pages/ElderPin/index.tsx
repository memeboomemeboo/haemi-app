import { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const LOGO_URL = 'https://www.figma.com/api/mcp/asset/8b004ad9-6304-4831-aaba-cd1edadad30d.png';
const DELETE_ICON = 'https://www.figma.com/api/mcp/asset/7d43a2a9-60ff-43cc-a1b1-77e43fc23c74.svg';

const PAD_NUMBERS = [0, 6, 3, 4, 2, 5, 1, 7, 9];

interface ElderPinScreenProps {
  userName?: string;
  onComplete?: (pin: string) => void;
}

export default function ElderPinScreen({ userName = '순자님', onComplete }: ElderPinScreenProps) {
  const insets = useSafeAreaInsets();
  const [pin, setPin] = useState('');

  const handleNumberPress = (num: number) => {
    if (pin.length < 6) {
      const newPin = pin + num.toString();
      setPin(newPin);
      if (newPin.length === 6) {
        onComplete?.(newPin);
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleRearrange = () => {
    setPin('');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {/* 로고 */}
        <Image
          source={{ uri: LOGO_URL }}
          style={styles.logo}
          resizeMode="contain"
        />

        {/* 인사말 */}
        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>{`${userName}, 반가워요`}</Text>
          <Text style={styles.greetingSubtitle}>비밀번호 6자리를 입력해주세요</Text>
        </View>

        {/* PIN 입력 표시 - 동적 */}
        <View style={styles.pinDisplay}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                index < pin.length && styles.pinDotActive,
              ]}
            />
          ))}
        </View>

        {/* 구분선 */}
        <View style={styles.divider} />

        {/* 숫자 패드 */}
        <View style={styles.pad}>
          {/* 첫 세 행 (0-9) */}
          {[0, 1, 2].map((rowIdx) => (
            <View key={rowIdx} style={styles.padRow}>
              {PAD_NUMBERS.slice(rowIdx * 3, rowIdx * 3 + 3).map((num) => (
                <Pressable
                  key={num}
                  onPress={() => handleNumberPress(num)}
                  style={({ pressed }) => [
                    styles.padButton,
                    pressed && styles.padButtonPressed,
                  ]}
                >
                  <Text style={styles.padButtonText}>{num}</Text>
                </Pressable>
              ))}
            </View>
          ))}

          {/* 마지막 행 (재배열, 8, 삭제) */}
          <View style={styles.padRow}>
            <Pressable
              onPress={handleRearrange}
              style={({ pressed }) => [
                styles.padSpecialButton,
                pressed && styles.padButtonPressed,
              ]}
            >
              <Text style={styles.padSpecialButtonText}>재배열</Text>
            </Pressable>

            <Pressable
              onPress={() => handleNumberPress(8)}
              style={({ pressed }) => [
                styles.padButton,
                pressed && styles.padButtonPressed,
              ]}
            >
              <Text style={styles.padButtonText}>8</Text>
            </Pressable>

            <Pressable
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed && styles.padButtonPressed,
              ]}
            >
              <Image
                source={{ uri: DELETE_ICON }}
                style={styles.deleteIcon}
                resizeMode="contain"
              />
            </Pressable>
          </View>
        </View>
      </View>

      {/* 홈 인디케이터 */}
      <View style={styles.homeIndicator}>
        <View style={styles.homeIndicatorBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 206,
    height: 82,
    marginBottom: 73,
  },
  greeting: {
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  greetingTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.64,
    lineHeight: 42,
    textAlign: 'center',
  },
  greetingSubtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.4,
    lineHeight: 26,
    textAlign: 'center',
  },
  pinDisplay: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 73,
    justifyContent: 'center',
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e6e6e7',
  },
  pinDotActive: {
    backgroundColor: '#fd6941',
  },
  divider: {
    width: 329,
    height: 3,
    backgroundColor: '#e6e6e7',
    marginBottom: 45,
  },
  pad: {
    width: 329,
    gap: 45,
  },
  padRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 37,
  },
  padButton: {
    width: 62,
    height: 37,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padButtonText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.64,
    lineHeight: 42,
  },
  padButtonPressed: {
    opacity: 0.7,
  },
  padSpecialButton: {
    width: 62,
    justifyContent: 'center',
    alignItems: 'center',
  },
  padSpecialButtonText: {
    fontSize: 24,
    fontWeight: '400',
    color: 'transparent',
    letterSpacing: -0.48,
    lineHeight: 31,
  },
  deleteButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    width: 24,
    height: 24,
  },
  homeIndicator: {
    height: 34,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 8,
  },
  homeIndicatorBar: {
    width: 144,
    height: 5,
    borderRadius: 100,
    backgroundColor: '#000',
  },
});
