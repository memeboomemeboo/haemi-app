import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/hooks';

const logoSource = require('@/../assets/images/haemi-logo.png');
const familySource = require('@/../assets/images/haemi-family.png');

interface DoneStepProps {
  onRestart: () => void;
}

/** Figma node 1408:6014 — 하루 한마디 전달 완료 */
export function DoneStep({ onRestart }: DoneStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <Text style={styles.message}>{`오늘도 이야기\n들려주셔서 고맙습니다!`}</Text>
      </View>

      <Image source={familySource} style={styles.family} resizeMode="contain" />

      <Pressable
        accessibilityRole="button"
        onPress={onRestart}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      >
        <Text style={styles.buttonText}>처음으로</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: 90,
      paddingBottom: 24,
    },
    content: {
      alignItems: 'center',
      gap: 45,
    },
    logo: {
      width: 199,
      height: 79,
    },
    message: {
      fontSize: 32,
      fontWeight: '600',
      lineHeight: 41.6,
      letterSpacing: -0.64,
      color: colors.label.neutral,
      textAlign: 'center',
    },
    family: {
      width: 284,
      height: 187,
    },
    button: {
      width: '100%',
      height: 69,
      borderRadius: 15,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonText: {
      fontSize: 28,
      fontWeight: '600',
      letterSpacing: -0.56,
      color: colors.background.normal,
    },
    pressed: {
      opacity: 0.85,
    },
  });
