import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { colors } from '@/shared/constants';
import { formatKoreanDate } from '@/shared/lib/date';
import { useElderProfile } from '@/entities/elder';
import { useElderHomeSummary } from '@/entities/elderHome';
import {
  ElderActivityCard,
  ElderDailyMessageCard,
  ElderHomeHeader,
  ElderMemoryCard,
} from '@/widgets';

const light = colors.light;

export default function ElderHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useElderProfile();
  const {
    summary,
    isLoading: isSummaryLoading,
    error: summaryError,
    refetch: refetchSummary,
  } = useElderHomeSummary();

  const isLoading = isProfileLoading || isSummaryLoading;
  const hasError = Boolean(profileError || summaryError);
  const dateLabel = formatKoreanDate();

  const retry = () => {
    void refetchProfile();
    void refetchSummary();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ElderHomeHeader
          honorificName={profile?.honorificName ?? '순자님'}
          dateLabel={dateLabel}
          onProfilePress={() => router.push('/my-page')}
        />

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={light.primary} />
          </View>
        ) : hasError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>데이터를 불러오지 못했어요.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={retry}
              style={({ pressed }) => [styles.retryButton, pressed && styles.retryButtonPressed]}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : summary ? (
          <>
            <View style={styles.activityCard}>
              <ElderActivityCard onStartPress={() => router.push('/quiz')} />
            </View>
            <View style={styles.notificationList}>
              <ElderMemoryCard notification={summary.memory} />
              <ElderDailyMessageCard notification={summary.dailyMessage} />
            </View>
          </>
        ) : (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>표시할 홈 정보가 없어요.</Text>
          </View>
        )}
      </ScrollView>
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
    width: '100%',
    maxWidth: 402,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 34,
  },
  loader: {
    height: 426,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorBox: {
    height: 426,
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
  activityCard: {
    marginTop: 50,
  },
  notificationList: {
    gap: 22,
    marginTop: 72,
  },
});
