import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, type Href } from 'expo-router';

import { useHomeData, type HomeMemory } from '@/features/home';
import { Alarm, Arrow, Comment, Picture, Report } from '@/shared/ui/Icon';
import { BottomNavigation } from '@/shared/ui';

const logoSource = require('../../../assets/images/haemi-logo-small.png');
const familySource = require('../../../assets/images/haemi-family.png');
const memorySource = require('../../../assets/images/album-sample.png');

type NoticeType = 'reply' | 'summary' | 'photo' | 'report';

type Notice = {
  id: string;
  type: NoticeType;
  title: string;
  description: string;
  time: string;
};

const NOTICE_ICONS: Record<NoticeType, typeof Comment> = {
  reply: Comment,
  summary: Alarm,
  photo: Picture,
  report: Report,
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data, isLoading, error, refetch } = useHomeData();
  const todayReminiscence = data?.todayReminiscence;
  const firstRecallCard = todayReminiscence?.cards?.[0];
  const notices = buildNotices(data?.memories ?? [], data?.elderName ?? '어르신');

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top + 7, 24) }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#fd6941" />}
      >
        <View style={styles.header}>
          <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          <Pressable accessibilityLabel="알림 보기" hitSlop={10}>
            <Alarm size={23} color="#dadbdc" />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text style={styles.greetingTitle}>{data?.userName ?? '가족'}님, 안녕하세요</Text>
          <Text style={styles.greetingDescription}>{data?.elderName ?? '어르신'}과의 소중한 추억을 함께 만들어가요.</Text>
          {error && <Text style={styles.errorText}>일부 정보를 불러오지 못했어요. 아래로 당겨 다시 시도해 주세요.</Text>}
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.connectionCard}>
            <View style={styles.connectionHeading}>
              <Image source={logoSource} style={styles.cardLogo} resizeMode="contain" />
              <Text style={styles.connectionSuffix}>로</Text>
            </View>
            <Text style={styles.connectionDescription}>{data?.elderName ?? '어르신'}과 가족 연결</Text>
            <Text style={styles.connectionDays}>{data?.connectionDays ?? '-'}일째</Text>
            <Image source={familySource} style={styles.familyImage} resizeMode="contain" />
          </View>

          <View style={styles.metricsColumn}>
            <MetricCard label="오늘의 추억" value={`${data?.todayMemoryCount ?? 0}개`} icon="▣" />
            <MetricCard label="이번 주 대화 시간" value={`${data?.weeklyConversationMinutes ?? 0}분`} icon="◷" />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>오늘의 회상 카드</Text>
          {firstRecallCard ? (
            <View style={styles.recallCard}>
              <Image source={memorySource} style={styles.memoryImage} />
              <View style={styles.recallContent}>
                <Text style={styles.recallTitle}>오늘의 회상</Text>
                <Text style={styles.recallDescription} numberOfLines={2}>
                  {firstRecallCard.promptText}
                </Text>
                <Pressable style={styles.detailButton} onPress={() => router.push('/family-memories')}>
                  <Text style={styles.detailButtonText}>자세히 보기</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={styles.emptyRecallContainer}>
              <Text style={styles.emptyRecallText}>아직 오늘의 회상 카드가 없어요.</Text>
            </View>
          )}
        </View>

        <View style={styles.noticeSection}>
          <Pressable style={styles.noticeHeading} onPress={() => router.push('/family-memories')}>
            <Text style={styles.sectionTitle}>최근 알림</Text>
            <Arrow size={14} color="#3c3e3f" />
          </Pressable>
          <View style={styles.noticeList}>
            {notices.map((notice) => (
              <NoticeRow key={notice.id} notice={notice} onPress={() => router.push(notice.route)} />
            ))}
            {!isLoading && notices.length === 0 && <Text style={styles.emptyNotice}>새로운 알림이 없어요.</Text>}
            {isLoading && !data && <ActivityIndicator color="#fd6941" />}
          </View>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Home" />
    </View>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricIcon}>{icon}</Text>
    </View>
  );
}

function NoticeRow({ notice, onPress }: { notice: Notice & { route: Href }; onPress: () => void }) {
  const NoticeIcon = NOTICE_ICONS[notice.type];

  return (
    <Pressable style={styles.noticeRow} onPress={onPress}>
      <View style={styles.noticeIcon}>
        <NoticeIcon size={20} color="#76787a" />
      </View>
      <View style={styles.noticeCopy}>
        <Text style={styles.noticeTitle} numberOfLines={1}>{notice.title}</Text>
        <Text style={styles.noticeDescription} numberOfLines={1}>{notice.description}</Text>
      </View>
      <Text style={styles.noticeTime}>{notice.time}</Text>
    </Pressable>
  );
}

function buildNotices(memories: HomeMemory[], elderName: string): (Notice & { route: Href })[] {
  const memoryNotices = memories.slice(0, 3).map((memory) => ({
    id: memory.memoryId,
    type: (memory.media?.some((media) => media.type === 'IMAGE') ? 'photo' : 'summary') as NoticeType,
    title: `${memory.authorName || '가족'}님이 추억을 남겼어요`,
    description: memory.textContent || `${elderName}과 함께 볼 새로운 추억이에요`,
    time: formatRelativeTime(memory.createdAt),
    route: '/family-memories' as Href,
  }));

  return memoryNotices;
}

function formatRelativeTime(value?: string): string {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diff / 60_000));
  if (minutes < 1) return '방금';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return days === 1 ? '어제' : `${days}일 전`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    paddingHorizontal: 21,
    paddingBottom: 28,
  },
  header: {
    height: 42,
    paddingHorizontal: 9,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  logo: {
    width: 62,
    height: 24,
  },
  greeting: {
    marginTop: 12,
    marginHorizontal: 9,
    gap: 7,
  },
  greetingTitle: {
    color: '#3c3e3f',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 31,
    letterSpacing: -0.48,
  },
  greetingDescription: {
    color: '#76787a',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.28,
  },
  errorText: {
    color: '#ee2a2b',
    fontSize: 12,
    lineHeight: 16,
  },
  summaryRow: {
    height: 202,
    marginTop: 32,
    flexDirection: 'row',
    gap: 12,
  },
  connectionCard: {
    flex: 1.29,
    paddingTop: 15,
    paddingHorizontal: 18,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f2f2f2',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  connectionHeading: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  cardLogo: {
    width: 62,
    height: 24,
  },
  connectionSuffix: {
    color: '#76787a',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
  },
  connectionDescription: {
    marginTop: 6,
    color: '#76787a',
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  connectionDays: {
    marginTop: 4,
    color: '#5a5c5d',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  familyImage: {
    position: 'absolute',
    right: 11,
    bottom: 8,
    width: 137,
    height: 90,
  },
  metricsColumn: {
    flex: 1,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    paddingTop: 11,
    paddingHorizontal: 13,
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#fed7cd',
  },
  metricLabel: {
    color: '#fd6035',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
  metricValue: {
    marginTop: 2,
    color: '#5a5c5d',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  metricIcon: {
    position: 'absolute',
    right: 14,
    bottom: 8,
    color: '#fd8d70',
    fontSize: 42,
    fontWeight: '400',
    lineHeight: 44,
  },
  section: {
    marginTop: 32,
    gap: 16,
  },
  sectionTitle: {
    marginHorizontal: 9,
    color: '#3c3e3f',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  recallCard: {
    height: 114,
    padding: 16,
    paddingLeft: 21,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 15,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyRecallContainer: {
    height: 114,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyRecallText: {
    color: '#76787a',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.28,
    textAlign: 'center',
  },
  memoryImage: {
    width: 81,
    height: 81,
    borderRadius: 15,
  },
  recallContent: {
    flex: 1,
    alignSelf: 'stretch',
  },
  recallTitle: {
    color: '#3c3e3f',
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    letterSpacing: -0.36,
  },
  recallDescription: {
    marginTop: 2,
    color: '#76787a',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.28,
  },
  detailButton: {
    height: 25,
    marginTop: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: '#fd6941',
  },
  detailButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: -0.28,
  },
  noticeSection: {
    marginTop: 25,
    gap: 12,
  },
  noticeHeading: {
    paddingRight: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noticeList: {
    gap: 8,
  },
  emptyNotice: {
    paddingVertical: 20,
    color: '#76787a',
    fontSize: 14,
    textAlign: 'center',
  },
  noticeRow: {
    minHeight: 49,
    paddingHorizontal: 11,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 5,
    backgroundColor: '#f7f7f7',
  },
  noticeIcon: {
    width: 35,
    height: 35,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#e8e8e9',
  },
  noticeCopy: {
    flex: 1,
  },
  noticeTitle: {
    color: '#3c3e3f',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  noticeDescription: {
    color: '#76787a',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: -0.24,
  },
  noticeTime: {
    color: '#c1c2c3',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
});
