import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/shared/hooks';
import { formatKoreanDate } from '@/shared/lib';
import { Mail, Profile, Waveform } from '@/shared/ui';

import { useElderHome } from './model/useElderHome';

/** Figma node 1408:5601 — 어르신 홈 */
export default function ElderHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { homeData, isLoading, isError, refetch } = useElderHome();

  const unrespondedMemoryCount =
    homeData?.recentMemories.filter((memory) => !memory.responded).length ?? 0;
  const latestMemoryTitle = homeData?.recentMemories[0]?.title;
  const hasMemories = (homeData?.recentMemories.length ?? 0) > 0;
  const hasNewMemory = unrespondedMemoryCount > 0;
  const hasTodayMessage = (homeData?.greeting.totalToday ?? 0) > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerName}>어르신</Text>
            <Text style={styles.headerDate}>{formatKoreanDate()}</Text>
          </View>
          <Profile size={53} color={colors.primary} />
        </View>

        <View style={styles.activityCard}>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>오늘의 인지 활동</Text>
            <Text style={styles.activitySubtitle}>5분이면 충분해요. 오늘도 함께 해요!</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/quiz')}
            style={({ pressed }) => [styles.activityButton, pressed && styles.pressed]}
          >
            <Text style={styles.activityButtonText}>활동 시작하기</Text>
          </Pressable>
        </View>

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>데이터를 불러오지 못했어요.</Text>
            <Pressable
              accessibilityRole="button"
              onPress={refetch}
              style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
            >
              <Text style={styles.retryText}>다시 시도</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/album')}
              style={({ pressed }) => [
                styles.notificationCard,
                !hasMemories && styles.notificationCardEmpty,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.notificationIconCircle}>
                <Mail size={24} color={colors.label.assistive} />
              </View>
              <View style={styles.notificationContent}>
                <View style={styles.notificationTitleRow}>
                  <Text style={styles.notificationTitle}>
                    {hasNewMemory ? '새 추억이 왔어요' : hasMemories ? '추억 앨범을 확인해요' : '추억이 없어요'}
                  </Text>
                  {hasNewMemory && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{unrespondedMemoryCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.notificationSubtitle} numberOfLines={1}>
                  {hasNewMemory
                    ? latestMemoryTitle
                    : hasMemories
                      ? '추억 앨범으로 기억을 돌아봐요'
                      : '아직 추억 앨범이 채워지지 않았어요'}
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/album')}
              style={({ pressed }) => [
                styles.notificationCard,
                !hasTodayMessage && styles.notificationCardEmpty,
                pressed && styles.pressed,
              ]}
            >
              <View style={[styles.notificationIconCircle, styles.notificationIconCirclePrimary]}>
                <Waveform size={20} color={colors.primary} />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>
                  {hasTodayMessage ? '하루 한마디 도착' : '입력된 한마디가 없어요'}
                </Text>
                <Text style={styles.notificationSubtitle}>
                  {hasTodayMessage
                    ? `가족이 보낸 메시지 ${homeData?.greeting.unread ?? 0}개`
                    : '아직 음성 메시지가 오지 않았어요'}
                </Text>
              </View>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const createStyles = ({ colors }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
      gap: 22,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      gap: 9,
    },
    headerName: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.56,
      lineHeight: 36,
    },
    headerDate: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.4,
      lineHeight: 26,
    },
    activityCard: {
      backgroundColor: '#fff3f0',
      borderRadius: 15,
      padding: 19,
      gap: 22,
    },
    activityContent: {
      gap: 5,
    },
    activityTitle: {
      fontSize: 28,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.56,
      lineHeight: 36,
    },
    activitySubtitle: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.36,
      lineHeight: 23,
    },
    activityButton: {
      backgroundColor: colors.primary,
      borderRadius: 10,
      height: 37,
      justifyContent: 'center',
      alignItems: 'center',
    },
    activityButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.background.normal,
      letterSpacing: -0.36,
      lineHeight: 23,
    },
    loader: {
      height: 88,
      justifyContent: 'center',
      alignItems: 'center',
    },
    errorBox: {
      height: 120,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    errorText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.alternative,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    retryText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.background.normal,
    },
    pressed: {
      opacity: 0.8,
    },
    notificationCard: {
      backgroundColor: colors.background.normal,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: colors.fill.neutral,
      padding: 23,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    },
    notificationCardEmpty: {
      backgroundColor: colors.background.neutral,
    },
    notificationIconCircle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.background.neutral,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationIconCirclePrimary: {
      backgroundColor: '#fff3f0',
      borderWidth: 1.087,
      borderColor: colors.primary,
    },
    notificationContent: {
      flex: 1,
      gap: 4,
    },
    notificationTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 19,
    },
    notificationTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.48,
      lineHeight: 31,
    },
    badge: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background.normal,
      letterSpacing: -0.32,
    },
    notificationSubtitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.32,
      lineHeight: 21,
    },
  });
