import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { BottomNavigation } from '@/shared/ui';
import {
  ARROW_XML,
  DROPDOWN_XML,
  GRAPH_XML,
  RING_XML,
} from '@/pages/CaregiverHome/assets';
import {
  CAREGIVER_COLORS,
  CAREGIVER_HOME_COPY,
  CAREGIVER_PATIENTS,
  CAREGIVER_RECORDS,
  CAREGIVER_TASKS,
  WEEKLY_ACTIVITY_DAYS,
  WEEKLY_ACTIVITY_LEGEND,
  type CaregiverPatient,
  type CaregiverTask,
} from '@/pages/CaregiverHome/constants';
import { useCaregiverHome } from '@/pages/CaregiverHome/model/useCaregiverHome';

const {
  fill: FILL,
  lineNormal: LINE_NORMAL,
  orange: ORANGE,
  orangeDeep: ORANGE_DEEP,
  orangeLine: ORANGE_LINE,
  orangeSoft: ORANGE_SOFT,
  text: TEXT,
  textAssistive: TEXT_ASSISTIVE,
  textMuted: TEXT_MUTED,
  white: WHITE,
} = CAREGIVER_COLORS;

export default function CaregiverHomeScreen() {
  const {
    isPatientDropdownOpen,
    openTask,
    screenWidth,
    selectPatient,
    selectedPatient,
    togglePatientDropdown,
  } = useCaregiverHome();

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <GreetingSection />
          <ConditionSection
            isPatientDropdownOpen={isPatientDropdownOpen}
            onPatientSelect={selectPatient}
            onPatientToggle={togglePatientDropdown}
            selectedPatient={selectedPatient}
          />
          <TaskSection onTaskPress={openTask} />
          <RecordSection />
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation activeTab="Home" tabs={['Home', 'Memory', 'Report', 'Setting']} />
    </View>
  );
}

function GreetingSection() {
  return (
    <View style={styles.greeting}>
      <Text style={styles.greetingTitle}>{CAREGIVER_HOME_COPY.greetingTitle}</Text>
      <Text style={styles.greetingSub}>{CAREGIVER_HOME_COPY.greetingSubtitle}</Text>
    </View>
  );
}

function ConditionSection({
  isPatientDropdownOpen,
  onPatientSelect,
  onPatientToggle,
  selectedPatient,
}: {
  isPatientDropdownOpen: boolean;
  onPatientSelect: (patient: CaregiverPatient) => void;
  onPatientToggle: () => void;
  selectedPatient: string;
}) {
  return (
    <View style={styles.conditionWrap}>
      <View style={styles.conditionCard}>
        <View style={styles.conditionTop}>
          <View style={styles.conditionInfo}>
            <View style={styles.conditionTitleRow}>
              <Text style={styles.conditionTitle}>{CAREGIVER_HOME_COPY.conditionTitle}</Text>
              <PatientSelector
                isOpen={isPatientDropdownOpen}
                onSelect={onPatientSelect}
                onToggle={onPatientToggle}
                selectedPatient={selectedPatient}
              />
            </View>
            <Text style={styles.conditionMeta}>{CAREGIVER_HOME_COPY.conditionMeta}</Text>
          </View>
          <View style={styles.graphWrap}>
            <SvgXml xml={GRAPH_XML} width={60} height={60} />
            <Text style={styles.graphLabel}>{CAREGIVER_HOME_COPY.conditionLabel}</Text>
          </View>
        </View>

        <WeeklyActivityChart />
      </View>

      <WeeklyActivityLegend />
    </View>
  );
}

function PatientSelector({
  isOpen,
  onSelect,
  onToggle,
  selectedPatient,
}: {
  isOpen: boolean;
  onSelect: (patient: CaregiverPatient) => void;
  onToggle: () => void;
  selectedPatient: string;
}) {
  return (
    <View style={styles.patientAnchor}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="돌봄 대상 선택"
        style={styles.patientBadge}
        onPress={onToggle}
      >
        <Text style={styles.patientBadgeText}>{selectedPatient}</Text>
        <SvgXml xml={DROPDOWN_XML} width={10.2} height={10.2} />
      </Pressable>

      {isOpen && (
        <View style={styles.patientDropdown}>
          {CAREGIVER_PATIENTS.map((patient, index) => (
            <Pressable
              key={patient}
              accessibilityRole="button"
              style={[
                styles.patientOption,
                patient === selectedPatient && styles.patientOptionActive,
                index === 0 && styles.patientOptionTop,
              ]}
              onPress={() => onSelect(patient)}
            >
              <Text style={styles.patientOptionText}>{patient}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function WeeklyActivityChart() {
  return (
    <View style={styles.chart}>
      <View style={styles.chartBars}>
        {WEEKLY_ACTIVITY_DAYS.map((day) => (
          <View key={day.label} style={styles.barColumn}>
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
        {WEEKLY_ACTIVITY_DAYS.map((day) => (
          <Text key={day.label} style={[styles.dayLabel, { color: day.color }]}>
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

function TaskSection({ onTaskPress }: { onTaskPress: (href: CaregiverTask['href']) => void }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{CAREGIVER_HOME_COPY.todoTitle}</Text>
      <View style={styles.taskRow}>
        {CAREGIVER_TASKS.map((task) => (
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
  onPress: (href: CaregiverTask['href']) => void;
  task: CaregiverTask;
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
      <SvgXml style={styles.taskCircle} xml={task.statusXml} width={22} height={22} />
      <View style={styles.taskBody}>
        <SvgXml xml={task.iconXml} width={42} height={42} />
        <Text style={styles.taskLabel}>{task.label}</Text>
      </View>
    </Pressable>
  );
}

function RecordSection() {
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
        {CAREGIVER_RECORDS.map((record) => (
          <View key={record.title} style={styles.recordRow}>
            <SvgXml xml={RING_XML} width={16} height={16} />
            <View style={styles.recordText}>
              <View style={styles.recordTitleRow}>
                <Text style={styles.recordTitle}>{record.title}</Text>
                <Text style={styles.recordTime}>{record.time}</Text>
              </View>
              <Text style={styles.recordDetail}>{record.detail}</Text>
            </View>
          </View>
        ))}
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
