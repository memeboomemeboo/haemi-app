import { useState } from 'react';
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
  { key: 'voice', label: '말하기', icon: Mic, iconSize: 40 },
  { key: 'emotion', label: '마음 전하기', icon: Heart, iconSize: 30 },
  { key: 'photo', label: '사진 고르기', icon: Picture, iconSize: 34 },
];

interface MethodSelectStepProps {
  onNext: (method: DailyMessageMethod) => void;
}

/** Figma node 1408:5896 — 하루 한마디 전달 방법 선택 (3개 중 하나만) */
export function MethodSelectStep({ onNext }: MethodSelectStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selectedMethod, setSelectedMethod] = useState<DailyMessageMethod | null>(null);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{`어떻게 이야기를\n전달하실건가요?`}</Text>

      <View style={styles.buttonGroup}>
        {METHOD_OPTIONS.map(({ key, label, icon: MethodIcon, iconSize }) => {
          const isSelected = selectedMethod === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={label}
              onPress={() => setSelectedMethod(key)}
              style={({ pressed }) => [
                styles.methodButton,
                isSelected && styles.methodButtonSelected,
                pressed && styles.pressed,
              ]}
            >
              <MethodIcon
                size={iconSize}
                color={isSelected ? colors.background.normal : colors.label.assistive}
                style={styles.methodIcon}
              />
              <Text style={[styles.methodLabel, isSelected && styles.methodLabelSelected]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.footnote}>※ 마음에 드는 방법을 골라주세요</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="다음"
        disabled={!selectedMethod}
        onPress={() => selectedMethod && onNext(selectedMethod)}
        style={[styles.nextButton, !selectedMethod && styles.nextButtonDisabled]}
      >
        <Text style={styles.nextButtonText}>다음</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: 48,
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
      borderWidth: 2,
      borderColor: colors.line.alternative,
      backgroundColor: colors.background.alternative,
      justifyContent: 'center',
      alignItems: 'center',
    },
    methodButtonSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
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
      color: colors.label.assistive,
    },
    methodLabelSelected: {
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
    nextButton: {
      width: '100%',
      height: 69,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    nextButtonDisabled: {
      opacity: 0.5,
    },
    nextButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.background.normal,
    },
  });
