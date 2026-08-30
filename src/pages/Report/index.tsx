import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Arrow, BottomNavigation, Profile } from '@/shared/ui';
import { colors } from '@/shared/constants/tokens';
import {
  ELDER_STATUS_MAP,
  REPORT_COLORS,
  REPORT_COPY,
  REPORT_TONE_STYLES,
  type ReportTone,
} from '@/pages/Report/constants';
import { useReport } from '@/pages/Report/model/useReport';
import { HomeHeader } from '@/widgets/HomeHeader';
import type { ElderReportCard } from '@/shared/types/report';

const light = colors.light;
const palette = colors.palette;

export default function ReportScreen() {
  const { fixedTopPaddingTop, openReportDetail, elders, isLoading } = useReport();

  return (
    <View style={styles.container}>
      <View style={[styles.fixedTop, { paddingTop: fixedTopPaddingTop }]}>
        <HomeHeader style={styles.homeHeader} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{REPORT_COPY.title}</Text>
          <Text style={styles.caption}>{REPORT_COPY.caption}</Text>
        </View>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} color={light.primary} size="large" />
        ) : elders.length === 0 ? (
          <Text style={styles.emptyText}>등록된 어르신이 없어요.</Text>
        ) : (
          <View style={styles.reportList}>
            {elders.map((elder) => (
              <ReportCard key={elder.elderId} elder={elder} onOpenDetail={openReportDetail} />
            ))}
          </View>
        )}
      </ScrollView>

      <BottomNavigation activeTab="Report" />
    </View>
  );
}

function ReportCard({
  elder,
  onOpenDetail,
}: {
  elder: ElderReportCard;
  onOpenDetail: (elderId: string) => void;
}) {
  const { label: statusLabel, tone: statusTone } = ELDER_STATUS_MAP[elder.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.profileGroup}>
            <View style={styles.avatar}>
              <Profile size={41} color={REPORT_COLORS.avatarIcon} />
            </View>
            <View style={styles.profileText}>
              <Text style={styles.name}>{elder.name}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{elder.age}세</Text>
                <Text style={styles.meta}>·</Text>
                <Text style={styles.meta}>{elder.roleLabel}</Text>
              </View>
            </View>
          </View>

          <StatusPill label={statusLabel} tone={statusTone} />
        </View>

        <View style={styles.divider} />

        <View style={styles.attendedRow}>
          <Text style={styles.attendedLabel}>오늘 참여</Text>
          <Text
            style={[
              styles.attendedValue,
              { color: elder.attendedToday ? light.primary : palette.red[60] },
            ]}
          >
            {elder.attendedToday ? '완료' : '미참여'}
          </Text>
        </View>
      </View>

      <Pressable
        style={styles.detailButton}
        accessibilityRole="button"
        onPress={() => onOpenDetail(elder.elderId)}
      >
        <Text style={styles.detailText}>{REPORT_COPY.detailButton}</Text>
        <Arrow size={12} color={light.label.alternative} />
      </Pressable>
    </View>
  );
}

function StatusPill({
  label,
  tone,
}: {
  label: string;
  tone: Extract<ReportTone, 'success' | 'danger' | 'primary'>;
}) {
  const toneStyle = REPORT_TONE_STYLES[tone];

  return (
    <View style={[styles.statusPill, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.statusText, { color: toneStyle.color }]}>{label}</Text>
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
  fixedTop: {
    paddingHorizontal: 16,
    backgroundColor: light.background.normal,
    position: 'relative',
    zIndex: 20,
  },
  homeHeader: {
    paddingHorizontal: 10,
    marginBottom: 26,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 0,
    paddingBottom: 28,
  },
  header: {
    width: '100%',
    maxWidth: 348,
    gap: 8,
  },
  loader: {
    marginTop: 60,
  },
  emptyText: {
    marginTop: 60,
    color: light.label.assistive,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  title: {
    color: light.label.neutral,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: 0,
  },
  caption: {
    color: light.label.assistive,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '400',
    letterSpacing: 0,
  },
  reportList: {
    width: '100%',
    maxWidth: 348,
    gap: 24,
    marginTop: 36,
  },
  card: {
    borderRadius: 10,
    backgroundColor: light.background.normal,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardBody: {
    gap: 16,
  },
  cardHeader: {
    minHeight: 41,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  profileGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    flexShrink: 1,
  },
  avatar: {
    width: 41,
    height: 41,
    borderRadius: 20.5,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: REPORT_COLORS.avatarBackground,
  },
  profileText: {
    flexShrink: 1,
  },
  name: {
    color: light.label.neutral,
    fontSize: 18,
    lineHeight: 23.4,
    fontWeight: '600',
    letterSpacing: 0,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  meta: {
    color: light.label.assistive,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  statusPill: {
    height: 19,
    minWidth: 44,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  divider: {
    height: 1.5,
    backgroundColor: light.fill.normal,
  },
  attendedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attendedLabel: {
    color: light.label.assistive,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  attendedValue: {
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '600',
    letterSpacing: 0,
  },
  detailButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  detailText: {
    color: light.label.alternative,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
});
