import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useUserContext } from '@/shared/context/UserContext';
import { BottomNavigation } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { ElderTodayTasks } from '@/widgets/ElderTodayTasks';

import { useElderHome } from './model/useElderHome';

export default function ElderHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { group } = useUserContext();
  const { homeData, isLoading, taskStatus, handleTaskPress } = useElderHome();

  const userName = group?.elders?.[0]?.name ?? '어르신';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <HomeHeader />
        </View>

        <View style={styles.welcome}>
          <Text style={styles.welcomeText}>{`${userName} 해미에\n오신것을 환영해요!`}</Text>
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color="#fd6941" />
          </View>
        ) : (
          <View style={styles.tasks}>
            <ElderTodayTasks status={taskStatus} onTaskPress={handleTaskPress} />
            {homeData && homeData.training.streak > 0 && (
              <Text style={styles.streak}>
                {`🔥 ${homeData.training.streak}일 연속 인지 훈련 중!`}
              </Text>
            )}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/album')}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.actionButtonText}>추억 앨범</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/album')}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
          >
            <Text style={styles.actionButtonText}>설정</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  welcome: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: '#3c3e3f',
    textAlign: 'center',
  },
  loader: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tasks: {
    marginBottom: 24,
  },
  streak: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#fd6941',
    marginTop: -8,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 69,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#e8e8e9',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: '#5a5c5d',
  },
});
