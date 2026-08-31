import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import {
  Arrow,
  BottomNavigation,
  Check,
  Profile,
} from '@/shared/ui';
import { colors } from '@/shared/constants/tokens';
import {
  HIGHLIGHT_PENCIL_XML,
  HIGHLIGHT_PICTURE_XML,
} from '@/pages/ReportDetail/assets';
import {
  REPORT_DETAIL_COLORS,
  REPORT_DETAIL_SECTION_TITLES,
  STATUS_COLORS,
  type AttendanceDay,
  type CognitiveStatus,
  type Highlight,
  type ReportDetailAttendanceCopy,
  type ReportDetailProfile,
  type SupportGuide,
} from '@/pages/ReportDetail/constants';
import { useReportDetail } from '@/pages/ReportDetail/model/useReportDetail';
import { HomeHeader } from '@/widgets/HomeHeader';

const light = colors.light;

export default function ReportDetailScreen() {
  const {
    attendance,
    attendanceCopy,
    cognitiveStatus,
    contentPaddingBottom,
    fixedTopPaddingTop,
    goBack,
    header,
    highlights,
    isLoading,
    isError,
    profile,
    supportGuides,
  } = useReportDetail();

  return (
    <View style={styles.container}>
      <View style={[styles.fixedTop, { paddingTop: fixedTopPaddingTop }]}>
        <HomeHeader style={styles.homeHeader} />
      </View>

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="이전 화면으로 이동"
            hitSlop={10}
            onPress={goBack}
            style={styles.backButton}
          >
            <Arrow size={20} color={light.label.neutral} />
          </Pressable>
          <Text style={styles.headerTitle}>{header.title}</Text>
          <View style={styles.periodPill}>
            <Text style={styles.periodText}>{header.period}</Text>
          </View>
        </View>
      </View>

      {isError ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>데이터를 불러오지 못했어요.</Text>
        </View>
      ) : isLoading || !profile || !attendanceCopy ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={light.primary} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: contentPaddingBottom }]}
          showsVerticalScrollIndicator={false}
        >
          <ProfileSummary profile={profile} />
          <AttendanceSection attendance={attendance} copy={attendanceCopy} />
          <CognitiveSection cognitiveStatus={cognitiveStatus} />
          {highlights.length > 0 && <HighlightSection highlights={highlights} />}
          {supportGuides.length > 0 && <SupportGuideSection guides={supportGuides} />}
        </ScrollView>
      )}

      <BottomNavigation activeTab="Report" />
    </View>
  );
}

function ProfileSummary({ profile }: { profile: ReportDetailProfile }) {
  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.profileGroup}>
          <View style={styles.avatar}>
            <Profile size={41} color={REPORT_DETAIL_COLORS.avatarIcon} />
          </View>
          <View style={styles.profileTextGroup}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Text style={styles.profileMeta}>{profile.meta}</Text>
          </View>
        </View>

        <View style={[styles.watchPill, { backgroundColor: profile.badgeColor }]}>
          <Text style={styles.watchPillText}>{profile.badge}</Text>
        </View>
      </View>

      <View style={styles.cardDivider} />

      <Text style={styles.summaryText}>{profile.summary}</Text>
    </View>
  );
}

function AttendanceSection({
  attendance,
  copy,
}: {
  attendance: AttendanceDay[];
  copy: ReportDetailAttendanceCopy;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{copy.title}</Text>
        <View style={styles.attendancePill}>
          <Text style={styles.attendancePillText}>{copy.summary}</Text>
        </View>
      </View>

      <View style={styles.attendanceRows}>
        <View style={styles.attendanceRow}>
          {attendance.map((item) => (
            <Text key={item.day} style={[styles.dayLabel, { color: item.color }]}>
              {item.day}
            </Text>
          ))}
        </View>

        <View style={styles.attendanceRow}>
          {attendance.map((item) =>
            item.attended ? (
              <Check key={item.day} size={22} color={light.primary} />
            ) : (
              <View key={item.day} style={styles.emptyCheck} />
            )
          )}
        </View>
      </View>

      <View style={styles.thinDivider} />

      <View style={styles.attendanceFooter}>
        <Text style={styles.noteText}>{copy.note}</Text>
        <View style={styles.neutralPill}>
          <Text style={styles.neutralPillText}>{copy.streak}</Text>
        </View>
      </View>
    </View>
  );
}

function CognitiveSection({ cognitiveStatus }: { cognitiveStatus: CognitiveStatus[] }) {
  return (
    <View style={styles.fullWidthSection}>
      <Text style={[styles.sectionTitle, styles.sectionInsetTitle]}>
        {REPORT_DETAIL_SECTION_TITLES.cognitive}
      </Text>

      <View style={styles.statusList}>
        {cognitiveStatus.map((item, index) => (
          <View
            key={item.label}
            style={[styles.statusRow, index < cognitiveStatus.length - 1 && styles.statusBorder]}
          >
            <Text style={styles.statusLabel}>{item.label}</Text>
            <View style={styles.segmentGroup}>
              {Array.from({ length: 3 }, (_, segmentIndex) => {
                const isActive = segmentIndex < item.score;
                return (
                  <View
                    key={`${item.label}-${segmentIndex}`}
                    style={[
                      styles.segment,
                      {
                        backgroundColor: isActive
                          ? STATUS_COLORS[item.tone]
                          : light.label.disabled,
                      },
                    ]}
                  />
                );
              })}
            </View>
            <View style={[styles.statusPill, { backgroundColor: STATUS_COLORS[item.tone] }]}>
              <Text style={styles.statusPillText}>{item.badge}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function HighlightSection({ highlights }: { highlights: Highlight[] }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{REPORT_DETAIL_SECTION_TITLES.highlight}</Text>

      <View style={styles.highlightCard}>
        {highlights.map((item, index) => (
          <View key={`${index}_${item.eyebrow}`}>
            <View style={styles.highlightItem}>
              <View style={styles.highlightTextGroup}>
                <Text style={styles.highlightEyebrow}>{item.eyebrow}</Text>
                <Text style={styles.highlightBody}>{item.body}</Text>
              </View>
              <HighlightIcon type={item.icon} />
            </View>

            {index < highlights.length - 1 && <View style={styles.highlightDivider} />}
          </View>
        ))}
      </View>
    </View>
  );
}

function HighlightIcon({ type }: { type: Highlight['icon'] }) {
  const xml = type === 'picture' ? HIGHLIGHT_PICTURE_XML : HIGHLIGHT_PENCIL_XML;

  return (
    <View
      style={styles.highlightIcon}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <SvgXml xml={xml} width={37} height={type === 'picture' ? 28 : 37} />
    </View>
  );
}

function SupportGuideSection({ guides }: { guides: SupportGuide[] }) {
  return (
    <View style={styles.fullWidthSection}>
      <Text style={[styles.sectionTitle, styles.sectionInsetTitle]}>
        {REPORT_DETAIL_SECTION_TITLES.supportGuide}
      </Text>

      <View style={styles.guideList}>
        {guides.map((item, index) => (
          <View
            key={item.title}
            style={[styles.guideRow, index < guides.length - 1 && styles.guideBorder]}
          >
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
            <View style={styles.guideTextGroup}>
              <Text style={styles.guideTitle}>{item.title}</Text>
              <Text style={styles.guideDescription}>{item.description}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: light.background.normal,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: light.label.assistive,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    paddingHorizontal: 26,
    paddingBottom: 20,
    backgroundColor: light.background.normal,
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
  headerContent: {
    width: '100%',
    maxWidth: 348,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  backButton: {
    width: 22,
    height: 27,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
  headerTitle: {
    marginLeft: 8,
    flex: 1,
    color: light.label.neutral,
    fontSize: 24,
    lineHeight: 31.2,
    fontWeight: '700',
    letterSpacing: 0,
  },
  periodPill: {
    minWidth: 66,
    height: 19,
    marginTop: 3,
    borderRadius: 100,
    backgroundColor: REPORT_DETAIL_COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  periodText: {
    color: light.primary,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  scroll: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingTop: 23,
    gap: 46,
  },
  profileCard: {
    width: '86.3%',
    maxWidth: 347,
    minHeight: 163,
    borderRadius: 10,
    backgroundColor: light.background.normal,
    paddingTop: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profileHeader: {
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
    backgroundColor: REPORT_DETAIL_COLORS.avatarBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTextGroup: {
    flexShrink: 1,
  },
  profileName: {
    color: light.label.neutral,
    fontSize: 18,
    lineHeight: 23.4,
    fontWeight: '600',
    letterSpacing: 0,
  },
  profileMeta: {
    color: light.label.assistive,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  watchPill: {
    minWidth: 66,
    height: 19,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  watchPillText: {
    color: light.background.normal,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  cardDivider: {
    height: 2,
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: light.fill.normal,
  },
  summaryText: {
    color: light.label.alternative,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  section: {
    width: '86.3%',
    maxWidth: 347,
    gap: 24,
  },
  fullWidthSection: {
    width: '100%',
    maxWidth: 402,
    gap: 24,
  },
  sectionHeader: {
    width: '100%',
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: light.label.neutral,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: 0,
  },
  sectionInsetTitle: {
    width: '82.8%',
    maxWidth: 333,
    alignSelf: 'center',
  },
  attendancePill: {
    minWidth: 98,
    height: 19,
    borderRadius: 100,
    backgroundColor: REPORT_DETAIL_COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  attendancePillText: {
    color: light.primary,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  attendanceRows: {
    gap: 16,
  },
  attendanceRow: {
    width: '100%',
    minHeight: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayLabel: {
    width: 25,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 20.8,
    fontWeight: '500',
    letterSpacing: 0,
  },
  emptyCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: light.label.disabled,
  },
  thinDivider: {
    height: 1.5,
    backgroundColor: light.fill.normal,
  },
  attendanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  noteText: {
    color: light.label.alternative,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  neutralPill: {
    minWidth: 66,
    height: 19,
    borderRadius: 100,
    backgroundColor: light.line.neutral,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  neutralPillText: {
    color: light.label.assistive,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  statusList: {
    width: '100%',
  },
  statusRow: {
    height: 56,
    paddingHorizontal: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  statusBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: light.fill.normal,
  },
  statusLabel: {
    width: 76,
    color: light.label.assistive,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 20.8,
    fontWeight: '500',
    letterSpacing: 0,
  },
  segmentGroup: {
    flex: 1,
    minWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  segment: {
    flex: 1,
    height: 5,
    borderRadius: 100,
  },
  statusPill: {
    width: 43,
    height: 19,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    color: light.background.normal,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
  highlightCard: {
    width: '100%',
    minHeight: 192,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: light.background.neutral,
    paddingHorizontal: 15,
    paddingVertical: 21,
    justifyContent: 'center',
    gap: 22,
  },
  highlightItem: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  highlightTextGroup: {
    flex: 1,
    gap: 7,
  },
  highlightEyebrow: {
    color: light.primary,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '500',
    letterSpacing: 0,
  },
  highlightBody: {
    color: light.label.alternative,
    fontSize: 16,
    lineHeight: 20.8,
    fontWeight: '600',
    letterSpacing: 0,
  },
  highlightDivider: {
    height: 1.5,
    marginTop: 22,
    backgroundColor: light.line.alternative,
  },
  highlightIcon: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guideList: {
    width: '100%',
  },
  guideRow: {
    minHeight: 70,
    paddingHorizontal: 25,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  guideBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: light.fill.normal,
  },
  numberBadge: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: light.background.normal,
    fontSize: 14,
    lineHeight: 18.2,
    fontWeight: '600',
    letterSpacing: 0,
  },
  guideTextGroup: {
    flex: 1,
    gap: 5,
  },
  guideTitle: {
    color: light.label.neutral,
    fontSize: 18,
    lineHeight: 23.4,
    fontWeight: '600',
    letterSpacing: 0,
  },
  guideDescription: {
    color: light.label.assistive,
    fontSize: 12,
    lineHeight: 15.6,
    fontWeight: '500',
    letterSpacing: 0,
  },
});
