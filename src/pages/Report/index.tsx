import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Arrow, BottomNavigation, Profile } from '@/shared/ui';
import { colors } from '@/shared/constants/tokens';
import {
  REPORT_METRIC_COLORS,
  REPORT_TONE_STYLES,
  type ReportTone,
  type WeeklyReport,
  type WeeklyReportTag,
} from '@/pages/Report/constants';
import { useReport } from '@/pages/Report/model/useReport';
import { HomeHeader } from '@/widgets/HomeHeader';

const light = colors.light;

export default function ReportScreen() {
  const { fixedTopPaddingTop, openReportDetail, reports } = useReport();

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
          <Text style={styles.title}>리포트</Text>
          <Text style={styles.caption}>※관찰이 필요한 순으로 매주 월요일마다 정렬돼요.</Text>
        </View>

        <View style={styles.reportList}>
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onOpenDetail={openReportDetail} />
          ))}
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Report" />
    </View>
  );
}

function ReportCard({
  report,
  onOpenDetail,
}: {
  report: WeeklyReport;
  onOpenDetail: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <View style={styles.cardMain}>
          <View style={styles.cardHeader}>
            <View style={styles.profileGroup}>
              <View style={styles.avatar}>
                <Profile size={41} color="#fd8768" />
              </View>

              <View style={styles.profileText}>
                <Text style={styles.name}>{report.name}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.meta}>{report.period}</Text>
                  <Text style={styles.meta}>·</Text>
                  <Text style={styles.meta}>{report.type}</Text>
                </View>
              </View>
            </View>

            <StatusPill label={report.status.label} tone={report.status.tone} />
          </View>

          <View style={styles.tagRow}>
            {report.tags.map((tag) => (
              <Tag key={`${report.id}-${tag.label}`} label={tag.label} tone={tag.tone} />
            ))}
          </View>

          <Text style={styles.summary}>{report.summary}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.metricPanel}>
          {report.metrics.map((metric) => (
            <View key={`${report.id}-${metric.label}`} style={styles.metricItem}>
              <Text style={[styles.metricValue, { color: REPORT_METRIC_COLORS[metric.tone] }]}>
                {metric.value}
              </Text>
              <Text style={styles.metricLabel} numberOfLines={1} adjustsFontSizeToFit>
                {metric.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Pressable
        style={styles.detailButton}
        accessibilityRole="button"
        onPress={onOpenDetail}
      >
        <Text style={styles.detailText}>자세히 보기</Text>
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
  tone: Extract<ReportTone, 'success' | 'danger'>;
}) {
  const toneStyle = REPORT_TONE_STYLES[tone];

  return (
    <View style={[styles.statusPill, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.statusText, { color: toneStyle.color }]}>{label}</Text>
    </View>
  );
}

function Tag({ label, tone }: WeeklyReportTag) {
  const toneStyle = REPORT_TONE_STYLES[tone];

  return (
    <View style={[styles.tag, { backgroundColor: toneStyle.backgroundColor }]}>
      <Text style={[styles.tagText, { color: toneStyle.color }]}>{label}</Text>
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
    minHeight: 330,
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
    gap: 24,
  },
  cardMain: {
    gap: 24,
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
    backgroundColor: '#fed7cd',
  },
  profileText: {
    width: 140,
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
  tagRow: {
    minHeight: 19,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    height: 19,
    minWidth: 43,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  tagText: {
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  summary: {
    color: light.label.alternative,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  divider: {
    height: 2,
    backgroundColor: light.fill.normal,
  },
  metricPanel: {
    height: 73,
    borderRadius: 10,
    backgroundColor: light.background.neutral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
  },
  metricItem: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    gap: 3,
  },
  metricValue: {
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: 0,
  },
  metricLabel: {
    width: '100%',
    color: light.label.assistive,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: 0,
  },
  detailButton: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 13,
  },
  detailText: {
    color: light.label.alternative,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
});
