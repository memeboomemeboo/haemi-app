import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/hooks';
import { Heart, Mic, Picture } from '@/shared/ui';

export type DailyMessageMethod = 'voice' | 'emotion' | 'photo';

interface MethodOption {
  key: DailyMessageMethod;
  label: string;
  icon: React.ComponentType<{ size: number; color: string; style?: object }>;
  iconSize: number;
}

const METHOD_OPTIONS: MethodOption[] = [
  { key: 'voice', label: '말하기', icon: Mic, iconSize: 58 },
  { key: 'emotion', label: '마음 전하기', icon: Heart, iconSize: 43 },
  { key: 'photo', label: '사진 고르기', icon: Picture, iconSize: 48 },
];

interface MethodSelectStepProps {
  onNext: (method: DailyMessageMethod) => void;
}

/** Figma node 1408:5896 — 하루 한마디 전달 방법 선택 (3개 중 하나만) */
export function MethodSelectStep({ onNext }: MethodSelectStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`어떻게 이야기를\n전달하실건가요?`}</Text>

      <View style={styles.buttonGroup}>
        {METHOD_OPTIONS.map(({ key, label, icon: MethodIcon, iconSize }) => {
          return (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => onNext(key)}
              style={({ pressed }) => [styles.methodButton, pressed && styles.pressed]}
            >
              <MethodIcon
                size={iconSize}
                color={colors.background.normal}
                style={styles.methodIcon}
              />
              <Text style={styles.methodLabel}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footnote}>※ 마음에 드는 방법을 골라주세요</Text>

    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingTop: 82,
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
      marginTop: -21,
    },
  });
