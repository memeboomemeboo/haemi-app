import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/hooks';
import { Heart, Mic, Picture } from '@/shared/ui';

interface MethodSelectStepProps {
  onSelectVoice: () => void;
  onSelectEmotion: () => void;
}

/** Figma node 1408:5896 — 하루 한마디 전달 방법 선택 */
export function MethodSelectStep({ onSelectVoice, onSelectEmotion }: MethodSelectStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const handleSelectPhoto = () => {
    Alert.alert('준비 중이에요', '사진으로 전하기는 곧 만나볼 수 있어요.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`어떻게 이야기를\n전달하실건가요?`}</Text>

      <View style={styles.buttonGroup}>
        <Pressable
          accessibilityRole="button"
          onPress={onSelectVoice}
          style={({ pressed }) => [styles.methodButton, pressed && styles.pressed]}
        >
          <Mic size={40} color={colors.background.normal} style={styles.methodIcon} />
          <Text style={styles.methodLabel}>말하기</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={onSelectEmotion}
          style={({ pressed }) => [styles.methodButton, pressed && styles.pressed]}
        >
          <Heart size={30} color={colors.background.normal} style={styles.methodIcon} />
          <Text style={styles.methodLabel}>마음 전하기</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={handleSelectPhoto}
          style={({ pressed }) => [styles.methodButton, pressed && styles.pressed]}
        >
          <Picture size={34} color={colors.background.normal} style={styles.methodIcon} />
          <Text style={styles.methodLabel}>사진 고르기</Text>
        </Pressable>
      </View>

      <Text style={styles.footnote}>※ 마음에 드는 방법을 골라주세요</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 64,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 41.6,
      letterSpacing: -0.64,
      color: colors.label.neutral,
      textAlign: 'center',
    },
    buttonGroup: {
      width: '100%',
      gap: 24,
    },
    methodButton: {
      height: 86,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    methodIcon: {
      position: 'absolute',
      left: 28,
    },
    methodLabel: {
      fontSize: 28,
      fontWeight: '600',
      lineHeight: 36.4,
      letterSpacing: -0.56,
      color: colors.background.normal,
    },
    pressed: {
      opacity: 0.85,
    },
    footnote: {
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 31.2,
      letterSpacing: -0.48,
      color: colors.label.alternative,
      textAlign: 'center',
    },
  });
