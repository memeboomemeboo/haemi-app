import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { BottomNavigation } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { ElderTodayTasks } from '@/widgets/ElderTodayTasks';
import { colors } from '@/shared/constants';

import { useElderHome } from './model/useElderHome';

const light = colors.light;

export default function ElderHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { homeData, isLoading, isError, taskStatus, handleTaskPress, refetch } = useElderHome();

  const userName = '어르신';

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
            <ActivityIndicator size="large" color={light.primary} />
          </View>
        ) : isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>데이터를 불러오지 못했어요.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={refetch}
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.tasks}>
            <ElderTodayTasks status={taskStatus} onTaskPress={handleTaskPress} />
            {homeData && homeData.training.streak > 0 && (
              <Text style={styles.streak}>
                {`${homeData.training.streak}일 연속 인지 훈련 중!`}
              </Text>
            )}
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/daily-message')}
          style={({ pressed }) => [styles.dailyMessageButton, pressed && styles.actionButtonPressed]}
        >
          <Text style={styles.dailyMessageButtonText}>하루 한마디 전하기</Text>
        </Pressable>

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
    backgroundColor: light.background.normal,
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
    color: light.label.neutral,
    textAlign: 'center',
  },
  loader: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '500',
    color: light.label.alternative,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: light.primary,
  },
  retryButtonPressed: {
    opacity: 0.7,
  },
  retryText: {
    fontSize: 15,
    fontWeight: '600',
    color: light.label.buttonText,
  },
  tasks: {
    marginBottom: 24,
  },
  streak: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: light.primary,
    marginTop: -8,
    marginBottom: 12,
  },
  dailyMessageButton: {
    height: 69,
    borderRadius: 15,
    backgroundColor: light.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyMessageButtonText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: light.background.normal,
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
    borderColor: light.line.alternative,
    backgroundColor: light.background.alternative,
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
    color: light.label.alternative,
  },
});
