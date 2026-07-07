import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HaemiIcon } from '@/components/haemi-icons';

const LOGO_URL = 'https://www.figma.com/api/mcp/asset/3340f72f-9dcc-4a58-a4f2-84f75e3cfb54';

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

type ReportMode = 'ready' | 'insufficient' | 'pdfError';

const days = ['6/15', '6/16', '6/17', '6/18', '6/19', '6/20', '6/21', '6/22'];
const correctRates = [60, 25, 35, 90, 65, 65, 50, 75];
const participationCounts = [4, 8, 6, 7, 1, 3, 5, 6];

export default function ReportScreen() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [reportMode] = useState<ReportMode>('ready');
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 393);

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <Header onToggleMenu={() => setMenuOpen((value) => !value)} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>인지 리포트</Text>
          <PeriodControl />

          {reportMode === 'ready' ? (
            <>
              <SummaryCards />
              <View style={styles.chartSection}>
                <LineChart title="정답률 변화" values={correctRates} />
                <BarChart title="참여 횟수 변화" values={participationCounts} />
              </View>
              <ReportTip />
            </>
          ) : (
            <ReportState mode={reportMode} />
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

        {logoutOpen && <LogoutDialog onCancel={() => setLogoutOpen(false)} onConfirm={() => setLogoutOpen(false)} />}
      </SafeAreaView>
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

function PeriodControl() {
  return (
    <View style={styles.periodRow}>
      <Pressable accessibilityRole="button" accessibilityLabel="이전 리포트 기간" hitSlop={8}>
        <Text style={[styles.periodArrow, styles.periodArrowDisabled]}>‹</Text>
      </Pressable>
      <Text style={styles.periodText}>2026.06.15</Text>
      <Text style={styles.periodText}>~</Text>
      <Text style={styles.periodText}>2026.06.22</Text>
      <Pressable accessibilityRole="button" accessibilityLabel="다음 리포트 기간" hitSlop={8}>
        <Text style={styles.periodArrow}>›</Text>
      </Pressable>
    </View>
  );
}

function SummaryCards() {
  return (
    <View style={styles.summaryRow}>
      <SummaryCard value="5회" label="훈련 참여" color={ORANGE_DEEP} backgroundColor={ORANGE_SOFT} />
      <SummaryCard value="78%" label="평균 정답률" color={YELLOW} backgroundColor={YELLOW_SOFT} />
      <SummaryCard value="12초" label="평균 반응 시간" color={BLUE} backgroundColor={BLUE_SOFT} />
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

function LineChart({ title, values }: { title: string; values: number[] }) {
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
          {points.map((point, index) => (
            <View key={`${point.x}-${point.y}`} style={[styles.dot, { left: point.x - 3, top: point.y - 3 }]} />
          ))}
          <XLabels labels={days} />
        </View>
      </View>
    </View>
  );
}

function BarChart({ title, values }: { title: string; values: number[] }) {
  return (
    <View style={styles.chartBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chartRow}>
        <YAxis labels={['8', '6', '4', '2', '0']} />
        <View style={styles.plotWrap}>
          <GridLines />
          <View style={styles.barLayer}>
            {values.map((value, index) => (
              <View key={`${days[index]}-${value}`} style={styles.barSlot}>
                <View style={[styles.bar, { height: `${(value / 8) * 100}%` }]} />
              </View>
            ))}
          </View>
          <XLabels labels={days} />
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
  const step = plotWidth / (values.length - 1);

  return values.map((value, index) => ({
    x: index * step,
    y: plotHeight - (value / max) * plotHeight,
  }));
}

function ReportTip() {
  return (
    <View style={styles.tipCard}>
      <Text style={styles.tipIcon}>👏</Text>
      <Text style={styles.tipText}>
        지난주보다 반응 시간이 조금 늘었어요.{'\n'}가족과 함께 쉬운 회상 활동을 해보는 것을 추천해요.
      </Text>
    </View>
  );
}

function ReportState({ mode }: { mode: ReportMode }) {
  const isInsufficient = mode === 'insufficient';

  return (
    <View style={styles.stateCard}>
      <HaemiIcon name="report" color={isInsufficient ? LINE_NORMAL : ERROR} size={44} />
      <Text style={styles.stateTitle}>{isInsufficient ? '아직 리포트가 준비되지 않았어요' : 'PDF 생성 실패'}</Text>
      <Text style={styles.stateDescription}>
        {isInsufficient
          ? '데이터가 충분히 쌓이면 리포트가 제공됩니다'
          : 'PDF 생성 중 오류가 발생했습니다. 잠시 후 재시도해주세요'}
      </Text>
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

function LogoutDialog({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
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
  );
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
    gap: 28,
  },
  title: {
    alignSelf: 'flex-start',
    marginLeft: 5,
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
    gap: 14,
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
    fontSize: 16,
    lineHeight: 21,
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
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 20,
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
