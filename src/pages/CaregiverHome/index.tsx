import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { BottomNavigation } from '@/shared/ui';
import {
  ARROW_XML,
  CALENDAR_XML,
  CIRCLE_CHECK_XML,
  CIRCLE_EMPTY_XML,
  DROPDOWN_XML,
  GRAPH_XML,
  HEART_XML,
  RING_XML,
} from './assets';

const logoSource = require('../../../assets/images/haemi-logo-small.png');

const ORANGE = '#fd6941';
const ORANGE_DEEP = '#fd6035';
const ORANGE_SOFT = '#fff3f0';
const ORANGE_LINE = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';
const ERROR = '#ee2a2b';
const BLUE = '#38a9fa';

// 주간 활동 막대. 아래에서 위로 쌓이는 4개 활동 유형별 세그먼트(px).
const SEGMENT_COLORS = {
  answer: ERROR, // 답변
  album: ORANGE, // 추억 열람
  word: '#fd8768', // 한마디 읽음
  training: ORANGE_LINE, // 인지 훈련
} as const;

const LEGEND = [
  { label: '답변', color: SEGMENT_COLORS.answer },
  { label: '추억 열람', color: SEGMENT_COLORS.album },
  { label: '한마디 읽음', color: SEGMENT_COLORS.word },
  { label: '인지 훈련', color: SEGMENT_COLORS.training },
];

type Segment = { color: string; height: number };

const DAYS: { label: string; color: string; segments: Segment[] }[] = [
  {
    label: '일',
    color: ERROR,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 9 },
      { color: SEGMENT_COLORS.album, height: 9 },
      { color: SEGMENT_COLORS.answer, height: 8 },
    ],
  },
  {
    label: '월',
    color: LINE_NORMAL,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 8 },
      { color: SEGMENT_COLORS.album, height: 7 },
    ],
  },
  {
    label: '화',
    color: LINE_NORMAL,
    segments: [{ color: SEGMENT_COLORS.training, height: 4 }],
  },
  {
    label: '수',
    color: LINE_NORMAL,
    segments: [{ color: SEGMENT_COLORS.training, height: 4 }],
  },
  {
    label: '목',
    color: LINE_NORMAL,
    segments: [
      { color: SEGMENT_COLORS.training, height: 7 },
      { color: SEGMENT_COLORS.word, height: 5 },
    ],
  },
  {
    label: '금',
    color: LINE_NORMAL,
    segments: [
      { color: SEGMENT_COLORS.training, height: 7 },
      { color: SEGMENT_COLORS.word, height: 5 },
    ],
  },
  {
    label: '토',
    color: BLUE,
    segments: [
      { color: SEGMENT_COLORS.training, height: 8 },
      { color: SEGMENT_COLORS.word, height: 8 },
      { color: SEGMENT_COLORS.album, height: 7 },
    ],
  },
];

const PATIENTS = ['박영호 님', '이순자 님'];

const RECORDS = [
  {
    title: '인지 활동 완료',
    time: '오전 9:20',
    detail: '기억력 게임 5분 · 정답률 80%',
  },
  {
    title: '음성 메세지 도착',
    time: '오전 11:05',
    detail: '“밥 잘 먹었다"',
  },
  {
    title: '추억 앨범 확인',
    time: '오후 2:40',
    detail: '올려주신 사진 3장을 보셨어요',
  },
];

export default function CaregiverHomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 402);
  const [patientOpen, setPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(PATIENTS[0]);

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <View style={styles.header}>
          <Image source={logoSource} style={styles.logo} contentFit="contain" />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* 인사말 */}
          <View style={styles.greeting}>
            <Text style={styles.greetingTitle}>승아님, 안녕하세요</Text>
            <Text style={styles.greetingSub}>어머니와의 소중한 추억을 함께 만들어가요.</Text>
          </View>

          {/* 컨디션 카드 */}
          <View style={styles.conditionWrap}>
            <View style={styles.conditionCard}>
              <View style={styles.conditionTop}>
                <View style={styles.conditionInfo}>
                  <View style={styles.conditionTitleRow}>
                    <Text style={styles.conditionTitle}>오늘 컨디션 좋아요</Text>
                    <View style={styles.patientAnchor}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="돌봄 대상 선택"
                        style={styles.patientBadge}
                        onPress={() => setPatientOpen((v) => !v)}
                      >
                        <Text style={styles.patientBadgeText}>{selectedPatient}</Text>
                        <SvgXml xml={DROPDOWN_XML} width={10.2} height={10.2} />
                      </Pressable>

                      {/* 돌봄 대상 선택 드롭다운 (배지 중앙 아래) */}
                      {patientOpen && (
                        <View style={styles.patientDropdown}>
                          {PATIENTS.map((patient, index) => {
                            const active = patient === selectedPatient;
                            return (
                              <Pressable
                                key={patient}
                                accessibilityRole="button"
                                style={[
                                  styles.patientOption,
                                  active && styles.patientOptionActive,
                                  index === 0 && styles.patientOptionTop,
                                ]}
                                onPress={() => {
                                  setSelectedPatient(patient);
                                  setPatientOpen(false);
                                }}
                              >
                                <Text style={styles.patientOptionText}>{patient}</Text>
                              </Pressable>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  </View>
                  <Text style={styles.conditionMeta}>마지막 접속 1시간 전</Text>
                </View>
                <View style={styles.graphWrap}>
                  <SvgXml xml={GRAPH_XML} width={60} height={60} />
                  <Text style={styles.graphLabel}>양호</Text>
                </View>
              </View>

              {/* 주간 활동 막대 그래프 */}
              <View style={styles.chart}>
                <View style={styles.chartBars}>
                  {DAYS.map((day) => (
                    <View key={day.label} style={styles.barColumn}>
                      <View style={styles.bar}>
                        {day.segments.map((seg, i) => (
                          <View
                            key={i}
                            style={{ height: seg.height, backgroundColor: seg.color, width: '100%' }}
                          />
                        ))}
                      </View>
                    </View>
                  ))}
                </View>
                <View style={styles.chartLabels}>
                  {DAYS.map((day) => (
                    <Text key={day.label} style={[styles.dayLabel, { color: day.color }]}>
                      {day.label}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* 범례 */}
            <View style={styles.legend}>
              {LEGEND.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={[styles.legendMark, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabel}>{item.label}</Text>
                </View>
              ))}
            </View>

          </View>

          {/* 오늘의 할일 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>오늘의 할일</Text>
            <View style={styles.taskRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="오늘의 한마디"
                style={({ pressed }) => [
                  styles.taskCard,
                  { backgroundColor: '#f5f5f5' },
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/family-memories' as Href)}
              >
                <SvgXml style={styles.taskCircle} xml={CIRCLE_EMPTY_XML} width={22} height={22} />
                <View style={styles.taskBody}>
                  <SvgXml xml={HEART_XML} width={42} height={42} />
                  <Text style={styles.taskLabel}>오늘의 한마디</Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="추억 등록"
                style={({ pressed }) => [
                  styles.taskCard,
                  { backgroundColor: ORANGE_SOFT },
                  pressed && styles.pressed,
                ]}
                onPress={() => router.push('/memory-register' as Href)}
              >
                <SvgXml style={styles.taskCircle} xml={CIRCLE_CHECK_XML} width={22} height={22} />
                <View style={styles.taskBody}>
                  <SvgXml xml={CALENDAR_XML} width={42} height={42} />
                  <Text style={styles.taskLabel}>추억 등록</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* 오늘의 기록 */}
          <View style={styles.section}>
            <View style={styles.recordHeader}>
              <Text style={styles.sectionTitle}>오늘의 기록</Text>
              <Pressable style={styles.recordMore} accessibilityRole="button">
                <Text style={styles.recordMoreText}>자세히 보기</Text>
                <SvgXml xml={ARROW_XML} width={12} height={12} />
              </Pressable>
            </View>
            <View style={styles.recordCard}>
              {RECORDS.map((record) => (
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
        </ScrollView>
      </SafeAreaView>

      <BottomNavigation activeTab="Home" />
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
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 62,
    height: 24,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 21,
    paddingTop: 8,
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
    backgroundColor: '#ffffff',
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
