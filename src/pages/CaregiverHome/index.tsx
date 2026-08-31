import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { BottomNavigation } from '@/shared/ui';
import {
  ARROW_XML,
  CIRCLE_CHECK_XML,
  CIRCLE_EMPTY_XML,
  DROPDOWN_XML,
  GRAPH_XML,
  RING_XML,
} from '@/pages/CaregiverHome/assets';
import {
  CAREGIVER_HOME_COPY,
  WEEKLY_ACTIVITY_LEGEND,
  type CaregiverRecord,
  type WeeklyActivityDay,
} from '@/pages/CaregiverHome/constants';
import {
  useCaregiverHome,
  type CaregiverTaskWithStatus,
} from '@/pages/CaregiverHome/model/useCaregiverHome';
import { colors } from '@/shared/constants';
import type { Href } from 'expo-router';

type ElderOption = { elderId: string; label: string };

const ORANGE = colors.light.primary;
const ORANGE_DEEP = colors.light.primary;
const ORANGE_LINE = colors.palette.orange[90];
const ORANGE_SOFT = colors.palette.orange[97];
const TEXT = colors.light.label.neutral;
const TEXT_ASSISTIVE = colors.light.label.assistive;
const TEXT_MUTED = colors.light.label.alternative;
const LINE_NORMAL = colors.light.line.normal;
const FILL = colors.light.fill.normal;
const WHITE = colors.light.background.normal;

export default function CaregiverHomeScreen() {
  const {
    condition,
    conditionMeta,
    elderOptions,
    greetingTitle,
    hasElders,
    isError,
    isLoading,
    isPatientDropdownOpen,
    openTask,
    records,
    recordsError,
    recordsLoading,
    refetch,
    screenWidth,
    selectElder,
    selectedElderLabel,
    tasks,
    togglePatientDropdown,
    weeklyDays,
  } = useCaregiverHome();

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <GreetingSection greetingTitle={greetingTitle} />

          {isLoading ? (
            <ActivityIndicator style={styles.loader} color={ORANGE} size="large" />
          ) : isError ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>홈 정보를 불러오지 못했어요.</Text>
              <Pressable
                accessibilityRole="button"
                onPress={refetch}
                style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}
              >
                <Text style={styles.retryText}>다시 시도</Text>
              </Pressable>
            </View>
          ) : !hasElders ? (
            <View style={styles.stateBox}>
              <Text style={styles.stateText}>돌봄 중인 어르신이 없어요.</Text>
            </View>
          ) : (
            <>
              <ConditionSection
                condition={condition}
                conditionMeta={conditionMeta}
                elderOptions={elderOptions}
                isPatientDropdownOpen={isPatientDropdownOpen}
                onPatientSelect={selectElder}
                onPatientToggle={togglePatientDropdown}
                selectedElderLabel={selectedElderLabel}
                weeklyDays={weeklyDays}
              />
              <TaskSection tasks={tasks} onTaskPress={openTask} />
              <RecordSection isError={recordsError} isLoading={recordsLoading} records={records} />
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation activeTab="Home" tabs={['Home', 'Album', 'Report', 'Setting']} />
    </View>
  );
}

function GreetingSection({ greetingTitle }: { greetingTitle: string }) {
  return (
    <View style={styles.greeting}>
      <Text style={styles.greetingTitle}>{greetingTitle}</Text>
      <Text style={styles.greetingSub}>{CAREGIVER_HOME_COPY.greetingSubtitle}</Text>
    </View>
  );
}

function ConditionSection({
  condition,
  conditionMeta,
  elderOptions,
  isPatientDropdownOpen,
  onPatientSelect,
  onPatientToggle,
  selectedElderLabel,
  weeklyDays,
}: {
  condition: { title: string; label: string };
  conditionMeta: string;
  elderOptions: ElderOption[];
  isPatientDropdownOpen: boolean;
  onPatientSelect: (elderId: string) => void;
  onPatientToggle: () => void;
  selectedElderLabel: string;
  weeklyDays: WeeklyActivityDay[];
}) {
  return (
    <View style={styles.conditionWrap}>
      <View style={styles.conditionCard}>
        <View style={styles.conditionTop}>
          <View style={styles.conditionInfo}>
            <View style={styles.conditionTitleRow}>
              <Text style={styles.conditionTitle}>{condition.title}</Text>
              <PatientSelector
                elderOptions={elderOptions}
                isOpen={isPatientDropdownOpen}
                onSelect={onPatientSelect}
                onToggle={onPatientToggle}
                selectedElderLabel={selectedElderLabel}
              />
            </View>
            <Text style={styles.conditionMeta}>{conditionMeta}</Text>
          </View>
          <View style={styles.graphWrap}>
            <SvgXml xml={GRAPH_XML} width={60} height={60} />
            <Text style={styles.graphLabel}>{condition.label}</Text>
          </View>
        </View>

        <WeeklyActivityChart weeklyDays={weeklyDays} />
      </View>

      <WeeklyActivityLegend />
    </View>
  );
}

function PatientSelector({
  elderOptions,
  isOpen,
  onSelect,
  onToggle,
  selectedElderLabel,
}: {
  elderOptions: ElderOption[];
  isOpen: boolean;
  onSelect: (elderId: string) => void;
  onToggle: () => void;
  selectedElderLabel: string;
}) {
  return (
    <View style={styles.patientAnchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="돌봄 대상 선택"
        style={styles.patientBadge}
        onPress={onToggle}
      >
        <Text style={styles.patientBadgeText}>{selectedElderLabel}</Text>
        <SvgXml xml={DROPDOWN_XML} width={10.2} height={10.2} />
      </Pressable>

      {isOpen && (
        <View style={styles.patientDropdown}>
          {elderOptions.map((option, index) => (
            <Pressable
              key={option.elderId}
              accessibilityRole="button"
              style={[
                styles.patientOption,
                option.label === selectedElderLabel && styles.patientOptionActive,
                index === 0 && styles.patientOptionTop,
              ]}
              onPress={() => onSelect(option.elderId)}
            >
              <Text style={styles.patientOptionText}>{option.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function WeeklyActivityChart({ weeklyDays }: { weeklyDays: WeeklyActivityDay[] }) {
  return (
    <View style={styles.chart}>
      <View style={styles.chartBars}>
        {weeklyDays.map((day, dayIndex) => (
          <View key={`${day.label}-${dayIndex}`} style={styles.barColumn}>
            <View style={styles.bar}>
              {day.segments.map((segment, index) => (
                <View
                  key={`${day.label}-${index}`}
                  style={[
                    styles.barSegment,
                    { height: segment.height, backgroundColor: segment.color },
                  ]}
                />
              ))}
            </View>
          </View>
        ))}
      </View>
      <View style={styles.chartLabels}>
        {weeklyDays.map((day, dayIndex) => (
          <Text key={`${day.label}-${dayIndex}`} style={[styles.dayLabel, { color: day.color }]}>
            {day.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function WeeklyActivityLegend() {
  return (
    <View style={styles.legend}>
      {WEEKLY_ACTIVITY_LEGEND.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendMark, { backgroundColor: item.color }]} />
          <Text style={styles.legendLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function TaskSection({
  onTaskPress,
  tasks,
}: {
  onTaskPress: (href: Href) => void;
  tasks: CaregiverTaskWithStatus[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{CAREGIVER_HOME_COPY.todoTitle}</Text>
      <View style={styles.taskRow}>
        {tasks.map((task) => (
          <TaskCard key={task.label} task={task} onPress={onTaskPress} />
        ))}
      </View>
    </View>
  );
}

function TaskCard({
  onPress,
  task,
}: {
  onPress: (href: Href) => void;
  task: CaregiverTaskWithStatus;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={task.accessibilityLabel}
      style={({ pressed }) => [
        styles.taskCard,
        { backgroundColor: task.backgroundColor },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress(task.href)}
    >
      <SvgXml
        style={styles.taskCircle}
        xml={task.completed ? CIRCLE_CHECK_XML : CIRCLE_EMPTY_XML}
        width={22}
        height={22}
      />
      <View style={styles.taskBody}>
        <SvgXml xml={task.iconXml} width={42} height={42} />
        <Text style={styles.taskLabel}>{task.label}</Text>
      </View>
    </Pressable>
  );
}

function RecordSection({
  isError,
  isLoading,
  records,
}: {
  isError: boolean;
  isLoading: boolean;
  records: CaregiverRecord[];
}) {
  return (
    <View style={styles.section}>
      <View style={styles.recordHeader}>
        <Text style={styles.sectionTitle}>{CAREGIVER_HOME_COPY.recordTitle}</Text>
        <Pressable style={styles.recordMore} accessibilityRole="button">
          <Text style={styles.recordMoreText}>{CAREGIVER_HOME_COPY.recordMore}</Text>
          <SvgXml xml={ARROW_XML} width={12} height={12} />
        </Pressable>
      </View>
      <View style={styles.recordCard}>
        {isLoading ? (
          <ActivityIndicator color={ORANGE} />
        ) : isError ? (
          <Text style={styles.recordEmptyText}>기록을 불러오지 못했어요.</Text>
        ) : records.length === 0 ? (
          <Text style={styles.recordEmptyText}>아직 오늘의 기록이 없어요.</Text>
        ) : (
          records.map((record, index) => (
            <View key={`${record.title}-${index}`} style={styles.recordRow}>
              <SvgXml xml={RING_XML} width={16} height={16} />
              <View style={styles.recordText}>
                <View style={styles.recordTitleRow}>
                  <Text style={styles.recordTitle}>{record.title}</Text>
                  {record.time ? <Text style={styles.recordTime}>{record.time}</Text> : null}
                </View>
                {record.detail ? <Text style={styles.recordDetail}>{record.detail}</Text> : null}
              </View>
            </View>
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  phone: {
    flex: 1,
    backgroundColor: WHITE,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 21,
    paddingTop: 50,
    paddingBottom: 120,
    gap: 38,
  },
  loader: {
    marginTop: 40,
  },
  stateBox: {
    marginTop: 40,
    alignItems: 'center',
    gap: 16,
  },
  stateText: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 84,
    backgroundColor: ORANGE_SOFT,
  },
  retryText: {
    color: ORANGE_DEEP,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  greeting: {
    gap: 8,
  },
  greetingTitle: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.48,
  },
  greetingSub: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  conditionWrap: {
    gap: 8,
    alignItems: 'center',
    position: 'relative',
    zIndex: 20,
  },
  conditionCard: {
    width: '100%',
    height: 157,
    borderRadius: 15,
    backgroundColor: FILL,
    paddingTop: 18,
    paddingHorizontal: 26,
    overflow: 'hidden',
  },
  conditionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  conditionInfo: {
    flex: 1,
    gap: 5,
  },
  conditionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  conditionTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  patientBadge: {
    height: 20,
    minWidth: 68,
    borderRadius: 84,
    backgroundColor: ORANGE_LINE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2.5,
    paddingLeft: 6,
    paddingRight: 4,
  },
  patientBadgeText: {
    color: ORANGE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: -0.24,
  },
  conditionMeta: {
    color: TEXT_MUTED,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  graphWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  graphLabel: {
    position: 'absolute',
    color: ORANGE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.32,
  },
  chart: {
    position: 'absolute',
    left: 26,
    right: 26,
    top: 87,
    gap: 14,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 34,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    width: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barSegment: {
    width: '100%',
  },
  chartLabels: {
    flexDirection: 'row',
  },
  dayLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
    textAlign: 'center',
  },
  legend: {
    width: 328,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendMark: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendLabel: {
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  patientAnchor: {
    position: 'relative',
    alignItems: 'center',
    zIndex: 40,
  },
  patientDropdown: {
    position: 'absolute',
    top: 24,
    left: '50%',
    transform: [{ translateX: -40 }],
    width: 80,
    borderRadius: 6,
    backgroundColor: WHITE,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.1,
    shadowRadius: 2.3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    zIndex: 40,
  },
  patientOption: {
    height: 27.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
  patientOptionActive: {
    backgroundColor: ORANGE_SOFT,
  },
  patientOptionTop: {
    borderBottomWidth: 0.76,
    borderBottomColor: ORANGE_LINE,
  },
  patientOptionText: {
    color: ORANGE_DEEP,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  taskRow: {
    flexDirection: 'row',
    gap: 22,
  },
  taskCard: {
    flex: 1,
    height: 105,
    borderRadius: 10,
    overflow: 'hidden',
  },
  taskCircle: {
    position: 'absolute',
    left: 10,
    top: 7,
  },
  taskBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  taskLabel: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  recordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recordMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recordMoreText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  recordCard: {
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: FILL,
    backgroundColor: WHITE,
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 24,
  },
  recordEmptyText: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
    textAlign: 'center',
  },
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
  },
  recordText: {
    flex: 1,
    gap: 3,
  },
  recordTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  recordTitle: {
    color: TEXT,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.32,
  },
  recordTime: {
    color: LINE_NORMAL,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  recordDetail: {
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  pressed: {
    opacity: 0.72,
  },
});
