import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/hooks';

interface EmotionOption {
  key: string;
  emoji: string;
  label: string;
}

const EMOTION_OPTIONS: EmotionOption[] = [
  { key: 'love', emoji: '🩷', label: '사랑' },
  { key: 'miss-you', emoji: '👋', label: '그리움' },
  { key: 'love-letter', emoji: '💌', label: '보고싶음' },
  { key: 'happy', emoji: '🥰', label: '행복' },
  { key: 'joy', emoji: '😆', label: '즐거움' },
  { key: 'sad', emoji: '😢', label: '슬픔' },
];
const MAX_SELECTION = 2;

interface EmotionSelectStepProps {
  onSent: () => void;
}

/** Figma node 1466:3023 — 이모지로 마음 전하기 (최대 2개 선택) */
export function EmotionSelectStep({ onSent }: EmotionSelectStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [selected, setSelected] = useState<string[]>([]);

  const toggleEmotion = (key: string) => {
    setSelected((current) => {
      if (current.includes(key)) {
        return current.filter((item) => item !== key);
      }
      if (current.length >= MAX_SELECTION) {
        return current;
      }
      return [...current, key];
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.intro}>
        <Text style={styles.title}>원하는 마음을 골라주세요</Text>
        <Text style={styles.subtitle}>최대 2개까지 고를 수 있어요</Text>
      </View>

      <View style={styles.grid}>
        {EMOTION_OPTIONS.map((option) => {
          const isSelected = selected.includes(option.key);
          return (
            <Pressable
              key={option.key}
              accessibilityRole="button"
              accessibilityLabel={option.label}
              accessibilityState={{ selected: isSelected }}
              onPress={() => toggleEmotion(option.key)}
              style={[styles.card, isSelected && styles.cardSelected]}
            >
              <Text style={styles.emoji}>{option.emoji}</Text>
              <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="마음 전하기"
        disabled={selected.length === 0}
        onPress={onSent}
        style={[styles.submitButton, selected.length === 0 && styles.buttonDisabled]}
      >
        <Text style={styles.submitButtonText}>마음 전하기</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      gap: 40,
    },
    intro: {
      alignItems: 'center',
      gap: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 41.6,
      letterSpacing: -0.64,
      color: colors.label.neutral,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 24,
      fontWeight: '500',
      lineHeight: 31.2,
      letterSpacing: -0.48,
      color: colors.label.alternative,
      textAlign: 'center',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    card: {
      width: '47%',
      height: 138,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.line.alternative,
      backgroundColor: colors.background.alternative,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
    },
    cardSelected: {
      borderColor: colors.background.normal,
      backgroundColor: colors.primary,
    },
    emoji: {
      fontSize: 40,
    },
    cardLabel: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.label.alternative,
    },
    cardLabelSelected: {
      color: colors.background.normal,
    },
    submitButton: {
      height: 69,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    submitButtonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.background.normal,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
  });
