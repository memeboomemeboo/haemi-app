import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/shared/constants';

interface RoleSelectProps {
  onElderSelect: () => void;
  onGuardianSelect: () => void;
}

export default function RoleSelectScreen({ onElderSelect, onGuardianSelect }: RoleSelectProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Image source={require('@/../assets/images/haemi-logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>역할 선택</Text>
        </View>

        <View style={styles.roles}>
          <RoleButton
            image={require('@/../assets/images/role-elder.png')}
            title="어르신"
            description={'가족의 이야기를 듣고\n추억을 나눠보세요'}
            onPress={onElderSelect}
          />
          <View style={styles.divider} />
          <RoleButton
            image={require('@/../assets/images/role-guardian.png')}
            title="보호자"
            description={'가족의 추억과 일상을\n함께 기록해보세요'}
            onPress={onGuardianSelect}
          />
        </View>
      </View>
    </View>
  );
}

interface RoleButtonProps {
  image: number;
  title: string;
  description: string;
  onPress: () => void;
}

function RoleButton({ image, title, description, onPress }: RoleButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}로 시작`}
      onPress={onPress}
      style={({ pressed }) => [styles.roleButton, pressed && styles.pressed]}
    >
      <Image source={image} style={styles.roleImage} resizeMode="contain" />
      <View style={styles.roleCopy}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light.background.normal },
  content: { width: 330, height: 628, alignSelf: 'center', justifyContent: 'space-between', marginVertical: 'auto' },
  header: { alignItems: 'center', gap: 12 },
  logo: { width: 206, height: 82 },
  subtitle: { color: colors.light.label.assistive, fontSize: 20, fontWeight: '500', lineHeight: 26, letterSpacing: -0.4 },
  roles: { height: 414 },
  roleButton: { height: 207, flexDirection: 'row', alignItems: 'center', gap: 40, paddingHorizontal: 18 },
  roleImage: { width: 92, height: 92 },
  roleCopy: { width: 161, gap: 19 },
  roleTitle: { color: colors.light.label.neutral, fontSize: 24, fontWeight: '700', lineHeight: 31, letterSpacing: -0.48 },
  roleDescription: { color: colors.primary, fontSize: 18, fontWeight: '500', lineHeight: 24, letterSpacing: -0.36 },
  divider: { position: 'absolute', top: 207, left: 0, right: 0, height: 1.5, backgroundColor: colors.light.label.disabled },
  pressed: { opacity: 0.65 },
});
