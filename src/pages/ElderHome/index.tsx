import { ScrollView, StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';

import { useTheme } from '@/shared/hooks';

const PROFILE_ICON = 'https://www.figma.com/api/mcp/asset/c1ca85c6-9a42-43d2-be9d-1350bd51ad78.svg';

export default function ElderHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const userName = '순자님';
  const currentDate = '9월 8일 화요일';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 헤더: 이름 + 날짜 + 프로필 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerName}>{userName}</Text>
            <Text style={styles.headerDate}>{currentDate}</Text>
          </View>
          <Image
            source={{ uri: PROFILE_ICON }}
            style={styles.profileIcon}
            resizeMode="contain"
          />
        </View>

        {/* 오늘의 인지 활동 카드 */}
        <View style={styles.activityCard}>
          <View style={styles.activityContent}>
            <Text style={styles.activityTitle}>오늘의 인지 활동</Text>
            <Text style={styles.activitySubtitle}>5분이면 충분해요. 오늘도 함께 해요!</Text>
          </View>
          <Pressable
            onPress={() => router.push('/quiz')}
            style={({ pressed }) => [
              styles.activityButton,
              pressed && styles.activityButtonPressed,
            ]}
          >
            <Text style={styles.activityButtonText}>활동 시작하기</Text>
          </Pressable>
        </View>

        {/* 새 추억이 왔어요 카드 */}
        <Pressable
          onPress={() => router.push('/album')}
          style={({ pressed }) => [
            styles.notificationCard,
            pressed && styles.notificationCardPressed,
          ]}
        >
          <View style={styles.notificationIcon} />
          <View style={styles.notificationContent}>
            <View style={styles.notificationTitleRow}>
              <Text style={styles.notificationTitle}>새 추억이 왔어요</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>1</Text>
              </View>
            </View>
            <Text style={styles.notificationSubtitle}>딸 정은님이 추억을 보냈어요</Text>
          </View>
        </Pressable>

        {/* 하루 한마디 도착 카드 */}
        <Pressable
          onPress={() => router.push('/daily-message')}
          style={({ pressed }) => [
            styles.notificationCard,
            pressed && styles.notificationCardPressed,
          ]}
        >
          <View style={styles.notificationIcon} />
          <View style={styles.notificationContent}>
            <Text style={styles.notificationTitle}>하루 한마디 도착</Text>
            <Text style={styles.notificationSubtitle}>
              딸이 보낸 음성 메세지 · 00:24
            </Text>
          </View>
        </Pressable>
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
      paddingBottom: 100,
      gap: 22,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
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
      textAlign: 'center',
    },
    profileIcon: {
      width: 53,
      height: 53,
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
    activityButtonPressed: {
      opacity: 0.8,
    },
    activityButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.background.normal,
      letterSpacing: -0.36,
      lineHeight: 23,
    },
    notificationCard: {
      backgroundColor: colors.background.normal,
      borderRadius: 15,
      borderWidth: 1.5,
      borderColor: colors.fill.neutral,
      padding: 23,
      flexDirection: 'row',
      gap: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 6,
      elevation: 2,
    },
    notificationCardPressed: {
      opacity: 0.8,
    },
    notificationIcon: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: colors.background.neutral,
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
