import { Image } from 'expo-image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HaemiIcon } from '@/components/haemi-icons';
import { generateReport, getReportMetrics, markReportViewed, ReportApiError } from '@/shared/api/report';
import type { CognitiveMetricResult, CognitiveReportResult } from '@/shared/types/report';

const LOGO_URL = 'https://www.figma.com/api/mcp/asset/3340f72f-9dcc-4a58-a4f2-84f75e3cfb54';
const DEFAULT_ELDER_ID = process.env.EXPO_PUBLIC_HAEMI_ELDER_ID ?? 'elder-001';
const DEFAULT_ALBUM_ID = process.env.EXPO_PUBLIC_HAEMI_ALBUM_ID;

const ORANGE = '#fd6941';
const ORANGE_DEEP = '#fd6035';
const ORANGE_SOFT = '#fff3f0';
const ORANGE_LINE = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE = '#dadbdc';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';
const ERROR = '#ee2a2b';
const YELLOW = '#efd406';
const YELLOW_SOFT = '#fef8cd';
const BLUE = '#0694f9';
const BLUE_SOFT = '#cdeafe';

type ReportMode = 'ready' | 'insufficient';

const FALLBACK_METRICS: CognitiveMetricResult[] = [
  { metricDate: '2026-06-15', trainingSessionCount: 4, trainingAccuracyRate: 60, averageResponseSeconds: 11 },
  { metricDate: '2026-06-16', trainingSessionCount: 8, trainingAccuracyRate: 25, averageResponseSeconds: 14 },
  { metricDate: '2026-06-17', trainingSessionCount: 6, trainingAccuracyRate: 35, averageResponseSeconds: 12 },
  { metricDate: '2026-06-18', trainingSessionCount: 7, trainingAccuracyRate: 90, averageResponseSeconds: 9 },
  { metricDate: '2026-06-19', trainingSessionCount: 1, trainingAccuracyRate: 65, averageResponseSeconds: 12 },
  { metricDate: '2026-06-20', trainingSessionCount: 3, trainingAccuracyRate: 65, averageResponseSeconds: 12 },
  { metricDate: '2026-06-21', trainingSessionCount: 5, trainingAccuracyRate: 50, averageResponseSeconds: 13 },
  { metricDate: '2026-06-22', trainingSessionCount: 6, trainingAccuracyRate: 75, averageResponseSeconds: 10 },
];

const FALLBACK_REPORT: CognitiveReportResult = {
  periodStart: '2026-06-15',
  periodEnd: '2026-06-22',
  participationCount: 5,
  averageAccuracyRate: 78,
  averageResponseSeconds: 12,
  changeSummary: '지난주보다 반응 시간이 조금 늘었어요. 가족과 함께 쉬운 회상 활동을 해보는 것을 추천해요.',
};

export default function ReportScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [rangeEnd, setRangeEnd] = useState(() => new Date('2026-06-22T00:00:00'));
  const [reportMode, setReportMode] = useState<ReportMode>('ready');
  const [metrics, setMetrics] = useState<CognitiveMetricResult[]>(FALLBACK_METRICS);
  const [report, setReport] = useState<CognitiveReportResult>(FALLBACK_REPORT);
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 393);

  const dateRange = useMemo(() => getWeeklyDateRange(rangeEnd), [rangeEnd]);
  const reportData = useMemo(() => buildReportData(metrics, report, dateRange), [metrics, report, dateRange]);

  const loadReport = useCallback(async () => {
    try {
      const [metricResult, reportResult] = await Promise.all([
        getReportMetrics({ elderId: DEFAULT_ELDER_ID, from: dateRange.from, to: dateRange.to }),
        generateReport({
          elderId: DEFAULT_ELDER_ID,
          albumId: DEFAULT_ALBUM_ID,
          period: 'WEEKLY',
          deliveryMethod: 'IN_APP',
        }),
      ]);

      setMetrics(metricResult ?? []);
      setReport(reportResult ?? {});
      setReportMode((metricResult?.length ?? 0) < 7 ? 'insufficient' : 'ready');

      if (reportResult?.reportId) {
        markReportViewed({ reportId: reportResult.reportId }).catch(() => undefined);
      }
    } catch (error) {
      if (isInsufficientDataError(error)) {
        setReportMode('insufficient');
        return;
      }

      setReportMode('ready');
      setMetrics(FALLBACK_METRICS);
      setReport(FALLBACK_REPORT);
    }
  }, [dateRange.from, dateRange.to]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadReport();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadReport]);

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <Header onToggleMenu={() => setMenuOpen((value) => !value)} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>인지 리포트</Text>

          <PeriodControl
            from={reportData.periodStart}
            to={reportData.periodEnd}
            onPrevious={() => setRangeEnd((value) => shiftWeek(value, -1))}
            onNext={() => setRangeEnd((value) => shiftWeek(value, 1))}
          />

          {reportMode === 'ready' ? (
            <>
              <SummaryCards data={reportData} />
              <View style={styles.chartSection}>
                <LineChart title="정답률 변화" labels={reportData.labels} values={reportData.accuracyRates} />
                <BarChart title="참여 횟수 변화" labels={reportData.labels} values={reportData.participationCounts} />
              </View>
              <ReportTip summary={reportData.changeSummary} />
            </>
          ) : (
            <ReportState />
          )}
        </ScrollView>

        {menuOpen && (
          <ProfileMenu
            onEdit={() => setMenuOpen(false)}
            onLogout={() => {
              setMenuOpen(false);
              setLogoutOpen(true);
            }}
          />
        )}
      </SafeAreaView>

      <LogoutDialog visible={logoutOpen} onCancel={() => setLogoutOpen(false)} onConfirm={() => setLogoutOpen(false)} />
    </View>
  );
}

function Header({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <View style={styles.header}>
      <Image source={LOGO_URL} style={styles.logo} contentFit="contain" />
      <View style={styles.headerActions}>
        <HaemiIcon name="alarm" color={LINE} size={30} />
        <Pressable accessibilityRole="button" accessibilityLabel="설정 메뉴" hitSlop={8} onPress={onToggleMenu}>
          <HaemiIcon name="gear" color={LINE} size={28} />
        </Pressable>
      </View>
    </View>
  );
}

function PeriodControl({
  from,
  to,
  onPrevious,
  onNext,
}: {
  from: string;
  to: string;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <View style={styles.periodRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="이전 리포트 기간" hitSlop={8} onPress={onPrevious}>
        <Text style={[styles.periodArrow, styles.periodArrowDisabled]}>‹</Text>
      </Pressable>
      <Text style={styles.periodText}>{formatDisplayDate(from)}</Text>
      <Text style={styles.periodText}>~</Text>
      <Text style={styles.periodText}>{formatDisplayDate(to)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="다음 리포트 기간" hitSlop={8} onPress={onNext}>
        <Text style={styles.periodArrow}>›</Text>
      </Pressable>
    </View>
  );
}

function SummaryCards({ data }: { data: ReportDisplayData }) {
  return (
    <View style={styles.summaryRow}>
      <SummaryCard value={`${data.participationCount}회`} label="훈련 참여" color={ORANGE_DEEP} backgroundColor={ORANGE_SOFT} />
      <SummaryCard value={`${Math.round(data.averageAccuracyRate)}%`} label="평균 반응 시간" color={YELLOW} backgroundColor={YELLOW_SOFT} />
      <SummaryCard value={`${Math.round(data.averageResponseSeconds)}초`} label="평균 정답률" color={BLUE} backgroundColor={BLUE_SOFT} />
    </View>
  );
}

function SummaryCard({
  value,
  label,
  color,
  backgroundColor,
}: {
  value: string;
  label: string;
  color: string;
  backgroundColor: string;
}) {
  return (
    <View style={[styles.summaryCard, { backgroundColor }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function LineChart({ title, labels, values }: { title: string; labels: string[]; values: number[] }) {
  const points = useMemo(() => getChartPoints(values, 100), [values]);

  return (
    <View style={styles.chartBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chartRow}>
        <YAxis labels={['100%', '75%', '50%', '25%', '0%']} />
        <View style={styles.plotWrap}>
          <GridLines />
          {points.slice(0, -1).map((point, index) => (
            <LineSegment key={`${point.x}-${index}`} from={point} to={points[index + 1]} />
          ))}
          {points.map((point) => (
            <View key={`${point.x}-${point.y}`} style={[styles.dot, { left: point.x - 3, top: point.y - 3 }]} />
          ))}
          <XLabels labels={labels} />
        </View>
      </View>
    </View>
  );
}

function BarChart({ title, labels, values }: { title: string; labels: string[]; values: number[] }) {
  const maxValue = Math.max(8, ...values);

  return (
    <View style={styles.chartBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chartRow}>
        <YAxis labels={[String(maxValue), String(Math.round(maxValue * 0.75)), String(Math.round(maxValue * 0.5)), String(Math.round(maxValue * 0.25)), '0']} />
        <View style={styles.plotWrap}>
          <GridLines />
          <View style={styles.barLayer}>
            {values.map((value, index) => (
              <View key={`${labels[index]}-${value}`} style={styles.barSlot}>
                <View style={[styles.bar, { height: `${(value / maxValue) * 100}%` }]} />
              </View>
            ))}
          </View>
          <XLabels labels={labels} />
        </View>
      </View>
    </View>
  );
}

function YAxis({ labels }: { labels: string[] }) {
  return (
    <View style={styles.yAxis}>
      {labels.map((label) => (
        <Text key={label} style={styles.axisText}>
          {label}
        </Text>
      ))}
    </View>
  );
}

function GridLines() {
  return (
    <View pointerEvents="none" style={styles.grid}>
      {Array.from({ length: 5 }, (_, index) => (
        <View key={index} style={styles.gridLine} />
      ))}
    </View>
  );
}

function XLabels({ labels }: { labels: string[] }) {
  return (
    <View style={styles.xAxis}>
      {labels.map((label) => (
        <Text key={label} style={styles.axisText}>
          {label}
        </Text>
      ))}
    </View>
  );
}

function LineSegment({ from, to }: { from: { x: number; y: number }; to: { x: number; y: number } }) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = `${Math.atan2(dy, dx)}rad`;

  return (
    <View
      style={[
        styles.lineSegment,
        {
          width: length,
          left: from.x,
          top: from.y,
          transform: [{ rotate: angle }],
        },
      ]}
    />
  );
}

function getChartPoints(values: number[], max: number) {
  const plotWidth = 294;
  const plotHeight = 96;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: index * step,
    y: plotHeight - (value / max) * plotHeight,
  }));
}

function ReportTip({ summary }: { summary: string }) {
  const [firstLine, secondLine] = splitSummary(summary);

  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipIcon}>👏</Text>
      <Text style={styles.tipText}>
        {firstLine}
        {secondLine ? `\n${secondLine}` : ''}
      </Text>
    </View>
  );
}

function ReportState() {
  return (
    <View style={styles.stateCard}>
      <HaemiIcon name="report" color={LINE_NORMAL} size={44} />
      <Text style={styles.stateTitle}>아직 리포트가 준비되지 않았어요</Text>
      <Text style={styles.stateDescription}>데이터가 충분히 쌓이면 리포트가 제공됩니다(7일 이상 필요)</Text>
    </View>
  );
}

function ProfileMenu({ onEdit, onLogout }: { onEdit: () => void; onLogout: () => void }) {
  return (
    <View style={styles.menu}>
      <Pressable style={({ pressed }) => [styles.menuItemActive, pressed && styles.pressed]} onPress={onEdit}>
        <Text style={styles.checkText}>✓</Text>
        <Text style={styles.menuText}>정보 수정</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]} onPress={onLogout}>
        <Text style={styles.menuText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

function LogoutDialog({
  visible,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onCancel}>
      <View style={styles.modalScrim}>
        <View style={styles.dialog}>
          <Text style={styles.dialogTitle}>로그아웃</Text>
          <Text style={styles.dialogText}>
            정말 <Text style={styles.dialogUser}>박승아(seunga418)</Text> 의 계정에서{'\n'}로그아웃하시겠습니까?
          </Text>
          <View style={styles.dialogActions}>
            <Pressable style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]} onPress={onCancel}>
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]} onPress={onConfirm}>
              <Text style={styles.logoutText}>로그아웃</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

type ReportDisplayData = {
  periodStart: string;
  periodEnd: string;
  labels: string[];
  accuracyRates: number[];
  participationCounts: number[];
  participationCount: number;
  averageAccuracyRate: number;
  averageResponseSeconds: number;
  changeSummary: string;
};

function buildReportData(
  metrics: CognitiveMetricResult[],
  report: CognitiveReportResult,
  fallbackRange: { from: string; to: string }
): ReportDisplayData {
  const sortedMetrics = [...metrics].sort((a, b) => (a.metricDate ?? '').localeCompare(b.metricDate ?? ''));
  const trend = report.accuracyTrend?.length
    ? report.accuracyTrend.map((point) => ({
        metricDate: point.date,
        trainingAccuracyRate: point.accuracyRate,
      }))
    : sortedMetrics;
  const labels = trend.map((item) => formatShortDate(item.metricDate)).filter(Boolean);
  const accuracyRates = trend.map((item) => clampNumber(item.trainingAccuracyRate ?? 0, 0, 100));
  const participationCounts = sortedMetrics.map((item) => item.trainingSessionCount ?? 0);
  const averageAccuracyRate = report.averageAccuracyRate ?? average(accuracyRates);
  const averageResponseSeconds =
    report.averageResponseSeconds ?? average(sortedMetrics.map((item) => item.averageResponseSeconds ?? 0));
  const participationCount = report.participationCount ?? Math.round(average(participationCounts));

  return {
    periodStart: report.periodStart ?? fallbackRange.from,
    periodEnd: report.periodEnd ?? fallbackRange.to,
    labels: labels.length ? labels : FALLBACK_METRICS.map((item) => formatShortDate(item.metricDate)),
    accuracyRates: accuracyRates.length ? accuracyRates : FALLBACK_METRICS.map((item) => item.trainingAccuracyRate ?? 0),
    participationCounts: participationCounts.length
      ? participationCounts
      : FALLBACK_METRICS.map((item) => item.trainingSessionCount ?? 0),
    participationCount,
    averageAccuracyRate,
    averageResponseSeconds,
    changeSummary:
      report.changeSummary ??
      '지난주보다 반응 시간이 조금 늘었어요. 가족과 함께 쉬운 회상 활동을 해보는 것을 추천해요.',
  };
}

function getWeeklyDateRange(endDate: Date) {
  const start = new Date(endDate);
  start.setDate(start.getDate() - 7);

  return { from: formatIsoDate(start), to: formatIsoDate(endDate) };
}

function shiftWeek(value: Date, direction: -1 | 1) {
  const next = new Date(value);
  next.setDate(next.getDate() + direction * 7);
  return next;
}

function formatIsoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(value?: string) {
  return value ? value.replaceAll('-', '.') : '';
}

function formatShortDate(value?: string) {
  if (!value) {
    return '';
  }

  const [, month, day] = value.split('-');
  return `${Number(month)}/${Number(day)}`;
}

function average(values: number[]) {
  const validValues = values.filter((value) => Number.isFinite(value));
  if (validValues.length === 0) {
    return 0;
  }

  return validValues.reduce((sum, value) => sum + value, 0) / validValues.length;
}

function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function splitSummary(summary: string) {
  const normalized = summary.trim();
  const periodIndex = normalized.indexOf('. ');

  if (periodIndex === -1) {
    return [normalized, ''];
  }

  return [normalized.slice(0, periodIndex + 1), normalized.slice(periodIndex + 2)];
}

function isInsufficientDataError(error: unknown) {
  if (!(error instanceof ReportApiError)) {
    return false;
  }

  return error.status === 400 || error.status === 409 || error.message.includes('7일') || error.message.includes('데이터');
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  phone: {
    flex: 1,
    backgroundColor: '#ffffff',
    overflow: 'hidden',
  },
  header: {
    height: 50,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 62,
    height: 24,
  },
  headerActions: {
    width: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 14,
    paddingHorizontal: 24,
    paddingBottom: 128,
    alignItems: 'center',
    gap: 32,
  },
  title: {
    width: '100%',
    maxWidth: 334,
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
  },
  periodRow: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  periodArrow: {
    color: ORANGE,
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '400',
  },
  periodArrowDisabled: {
    color: LINE,
  },
  periodText: {
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  summaryRow: {
    width: '100%',
    maxWidth: 344,
    height: 73,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '600',
  },
  summaryLabel: {
    color: TEXT_MUTED,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  chartSection: {
    width: '100%',
    maxWidth: 344,
    gap: 11,
  },
  chartBlock: {
    width: '100%',
    gap: 16,
  },
  sectionTitle: {
    marginLeft: 8,
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  chartRow: {
    height: 128,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  yAxis: {
    width: 32,
    height: 104,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  axisText: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    includeFontPadding: false,
  },
  plotWrap: {
    width: 301,
    height: 128,
    marginLeft: 3,
  },
  grid: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 96,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: LINE,
  },
  lineSegment: {
    position: 'absolute',
    height: 2,
    borderRadius: 1,
    backgroundColor: ORANGE_DEEP,
    transformOrigin: '0px 1px',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE_DEEP,
  },
  xAxis: {
    position: 'absolute',
    left: -2,
    right: -2,
    top: 108,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 96,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barSlot: {
    width: 24,
    height: 96,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 18,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: ORANGE_DEEP,
  },
  tipCard: {
    width: '100%',
    maxWidth: 364,
    minHeight: 71,
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 14,
    backgroundColor: FILL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  tipIcon: {
    width: 42,
    fontSize: 34,
    lineHeight: 42,
  },
  tipText: {
    flex: 1,
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  stateCard: {
    width: '100%',
    maxWidth: 344,
    minHeight: 236,
    borderRadius: 15,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: FILL,
  },
  stateTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  stateDescription: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  menu: {
    position: 'absolute',
    top: 68,
    right: 10,
    width: 123,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    zIndex: 10,
  },
  menuItemActive: {
    height: 36,
    borderBottomWidth: 1,
    borderBottomColor: ORANGE_LINE,
    backgroundColor: ORANGE_SOFT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  menuItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkText: {
    color: ORANGE_DEEP,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  menuText: {
    color: ORANGE_DEEP,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  modalScrim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dialog: {
    width: 290,
    minHeight: 152,
    borderRadius: 10,
    paddingTop: 17,
    paddingRight: 26,
    paddingBottom: 15,
    paddingLeft: 23,
    backgroundColor: '#ffffff',
  },
  dialogTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
  },
  dialogText: {
    marginTop: 12,
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  dialogUser: {
    color: TEXT_MUTED,
    fontSize: 16,
    fontWeight: '600',
  },
  dialogActions: {
    marginTop: 26,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 6,
  },
  cancelButton: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: FILL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  logoutText: {
    color: FILL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.72,
  },
});
