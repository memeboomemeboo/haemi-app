import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { colors } from '@/shared/constants';
import { BottomNavigation } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

const { label, background, fill } = colors.light;

const UPLOAD_ICON = `<svg viewBox="0 0 22.5 22.4944" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.54875 6.41814L10.125 3.83064V14.6194C10.125 14.9178 10.2435 15.2039 10.4545 15.4149C10.6655 15.6259 10.9516 15.7444 11.25 15.7444C11.5484 15.7444 11.8345 15.6259 12.0455 15.4149C12.2565 15.2039 12.375 14.9178 12.375 14.6194V3.83064L14.9512 6.41814C15.0558 6.52358 15.1803 6.60728 15.3174 6.66439C15.4544 6.72151 15.6015 6.75091 15.75 6.75091C15.8985 6.75091 16.0456 6.72151 16.1826 6.66439C16.3197 6.60728 16.4442 6.52358 16.5487 6.41814C16.6542 6.31356 16.7379 6.18913 16.795 6.05204C16.8521 5.91495 16.8815 5.7679 16.8815 5.61939C16.8815 5.47088 16.8521 5.32383 16.795 5.18674C16.7379 5.04965 16.6542 4.92522 16.5487 4.82064L12.0488 0.32064C11.9418 0.21822 11.8156 0.137934 11.6775 0.0843902C11.4036 -0.0281301 11.0964 -0.0281301 10.8225 0.0843902C10.6844 0.137934 10.5582 0.21822 10.4512 0.32064L5.95125 4.82064C5.84636 4.92553 5.76315 5.05006 5.70638 5.18711C5.64962 5.32416 5.6204 5.47105 5.6204 5.61939C5.6204 5.76773 5.64962 5.91462 5.70638 6.05167C5.76315 6.18872 5.84636 6.31325 5.95125 6.41814C6.05614 6.52303 6.18067 6.60624 6.31772 6.66301C6.45477 6.71978 6.60166 6.74899 6.75 6.74899C6.89834 6.74899 7.04523 6.71978 7.18228 6.66301C7.31933 6.60624 7.44386 6.52303 7.54875 6.41814ZM21.375 11.2444C21.0766 11.2444 20.7905 11.3629 20.5795 11.5739C20.3685 11.7849 20.25 12.071 20.25 12.3694V19.1194C20.25 19.4178 20.1315 19.7039 19.9205 19.9149C19.7095 20.1259 19.4234 20.2444 19.125 20.2444H3.375C3.07663 20.2444 2.79048 20.1259 2.57951 19.9149C2.36853 19.7039 2.25 19.4178 2.25 19.1194V12.3694C2.25 12.071 2.13147 11.7849 1.9205 11.5739C1.70952 11.3629 1.42337 11.2444 1.125 11.2444C0.826631 11.2444 0.540483 11.3629 0.329505 11.5739C0.118526 11.7849 0 12.071 0 12.3694V19.1194C0 20.0145 0.355579 20.8729 0.988515 21.5059C1.62145 22.1388 2.47989 22.4944 3.375 22.4944H19.125C20.0201 22.4944 20.8786 22.1388 21.5115 21.5059C22.1444 20.8729 22.5 20.0145 22.5 19.1194V12.3694C22.5 12.071 22.3815 11.7849 22.1705 11.5739C21.9595 11.3629 21.6734 11.2444 21.375 11.2444Z" fill="#5A5C5D"/></svg>`;
const PLAY_ICON = `<svg viewBox="0 0 7.94015 9.36279" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0 0.41731C0 0.0934372 0.353321 -0.10661 0.63104 0.0600215L7.73785 4.32411C8.00758 4.48594 8.00758 4.87685 7.73785 5.03869L0.631039 9.30277C0.35332 9.46941 0 9.26936 0 8.94548V0.41731Z" fill="#76787A"/></svg>`;
const PAUSE_ICON = `<svg viewBox="0 0 8.28564 9.66667" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.07141 0.000081H0.69047C0.309134 0.000081 0 0.309215 0 0.690552V8.9762C0 9.35753 0.309134 9.66667 0.69047 9.66667H2.07141C2.45275 9.66667 2.76188 9.35753 2.76188 8.9762V0.690552C2.76188 0.309215 2.45275 0.000081 2.07141 0.000081Z" fill="#76787A"/><path d="M7.59517 0.000081H6.21423C5.8329 0.000081 5.52376 0.309215 5.52376 0.690552V8.9762C5.52376 9.35753 5.8329 9.66667 6.21423 9.66667H7.59517C7.97651 9.66667 8.28564 9.35753 8.28564 8.9762V0.690552C8.28564 0.309215 7.97651 0.000081 7.59517 0.000081Z" fill="#76787A"/></svg>`;

const WORDS = [
  { count: 1, name: '지민', relation: '손녀' },
  { count: 2, name: '영수', relation: '아들' },
  { count: 1, name: '순자', relation: '친구' },
];

const PLACES = ['바닷가', '고향집 마당', '남대문 시장'];

const VOICES = [
  { title: '바닷가 사진', duration: '0:02' },
  { title: '김장 사진', duration: '0:00' },
  { title: '지민이 소식', duration: '0:00' },
];

export default function ReportScreen() {
  const [playingVoiceIndex, setPlayingVoiceIndex] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <HomeHeader showSetting={false} style={styles.header} />

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.introSection}>
            <View style={styles.titleRow}>
              <Text style={styles.reportTitle}>10월 회상 리포트</Text>
              <Pressable accessibilityLabel="공유" accessibilityRole="button" hitSlop={10}>
                <SvgXml xml={UPLOAD_ICON} width={27} height={27} />
              </Pressable>
            </View>
            <Text style={styles.person}>어머니 · 이복자 님</Text>
            <View style={styles.monthCard}>
              <Text style={styles.monthLabel}>이번 달, 어머니와</Text>
              <Text style={styles.monthValue}>18일 함께 이야기했어요</Text>
            </View>
          </View>

          <Section title="가장 많이 말씀하신 단어">
            <View>
              {WORDS.map((word, index) => (
                <View key={word.name} style={[styles.wordRow, index < WORDS.length - 1 && styles.wordDivider]}>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{word.count}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.wordName}>
                    {word.name}
                  </Text>
                  <Text numberOfLines={1} style={styles.relation}>
                    · {word.relation}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.placeBlock}>
              <Text style={styles.placeLabel}>자주 떠올린 장소</Text>
              <View style={styles.tags}>
                {PLACES.map((place) => (
                  <View key={place} style={styles.tag}>
                    <Text style={styles.tagText}>{place}</Text>
                  </View>
                ))}
              </View>
            </View>
          </Section>

          <Section title="어머니의 목소리">
            <View style={styles.voiceList}>
              {VOICES.map((voice, index) => {
                const isPlaying = playingVoiceIndex === index;

                return (
                  <View key={voice.title} style={styles.voiceItem}>
                    <Text style={styles.voiceTitle}>{voice.title}</Text>
                    <View style={styles.player}>
                      <Pressable
                        accessibilityLabel={`${voice.title} ${isPlaying ? '일시정지' : '재생'}`}
                        accessibilityRole="button"
                        style={styles.playButton}
                        onPress={() => setPlayingVoiceIndex(isPlaying ? null : index)}>
                        <SvgXml xml={isPlaying ? PAUSE_ICON : PLAY_ICON} width={13} height={15} />
                      </Pressable>
                      <View style={styles.progressTrack}>
                        {isPlaying && <View style={styles.progressValue} />}
                      </View>
                      <Text style={styles.duration}>{voice.duration}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </Section>

          <Section title="우리 가족 기록">
            <View style={styles.familyCard}>
              <Metric color={colors.palette.red[70]} label="남긴 추억" value="12" />
              <Metric color={colors.palette.blue[70]} label="사진" value="34" />
              <Metric color="#06c781" label="한마디" value="9" />
            </View>
          </Section>

          <Section title="이달의 이야기" last>
            <View style={styles.storyCard}>
              <Text style={styles.storyText}>
                이번 달 어머니는 인물 사진에 목소리를 자주 남기셨어요. 남대문 시장 사진에 가족 반응이 가장 따뜻했어요.
              </Text>
            </View>
            <Text style={styles.disclaimer}>※이 자료는 의료적 진단이 아닙니다.</Text>
          </Section>
        </ScrollView>
      </SafeAreaView>
      <BottomNavigation activeTab="Report" />
    </View>
  );
}

function Section({ children, last = false, title }: { children: React.ReactNode; last?: boolean; title: string }) {
  return (
    <View style={[styles.section, last && styles.lastSection]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Metric({ color, label: metricLabel, value }: { color: string; label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text numberOfLines={1} style={styles.metricLabel}>{metricLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.normal },
  safeArea: { flex: 1 },
  header: {
    height: 50,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scrollContent: { paddingBottom: 40 },
  introSection: { paddingHorizontal: 30, paddingTop: 29, paddingBottom: 40, borderBottomWidth: 4, borderBottomColor: fill.normal },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  reportTitle: { flexShrink: 1, color: label.neutral, fontSize: 24, lineHeight: 31, fontWeight: '700', letterSpacing: -0.48 },
  person: { marginTop: 10, color: label.assistive, fontSize: 18, lineHeight: 23, fontWeight: '400', letterSpacing: -0.36 },
  monthCard: { marginTop: 20, height: 93, paddingHorizontal: 23, paddingVertical: 14, borderRadius: 10, backgroundColor: background.neutral },
  monthLabel: { color: colors.primary, fontSize: 18, lineHeight: 23, fontWeight: '500', letterSpacing: -0.36 },
  monthValue: { marginTop: 5, color: label.alternative, fontSize: 20, lineHeight: 26, fontWeight: '600', letterSpacing: -0.4 },
  section: { paddingHorizontal: 30, paddingVertical: 40, borderBottomWidth: 4, borderBottomColor: fill.normal },
  lastSection: { borderBottomWidth: 0 },
  sectionTitle: { marginBottom: 20, color: label.neutral, fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.4 },
  wordRow: { minHeight: 55, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center' },
  wordDivider: { borderBottomWidth: 1.5, borderBottomColor: colors.palette.neutral[95] },
  countBadge: { width: 20, height: 20, marginRight: 20, borderRadius: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  countText: { color: background.normal, fontSize: 14, lineHeight: 18, fontWeight: '600', letterSpacing: -0.28 },
  wordName: { minWidth: 48, marginRight: 8, color: label.neutral, fontSize: 18, lineHeight: 23, fontWeight: '600', letterSpacing: -0.36 },
  relation: { flexShrink: 1, color: label.assistive, fontSize: 14, lineHeight: 18, fontWeight: '500', letterSpacing: -0.28 },
  placeBlock: { marginTop: 20 },
  placeLabel: { marginBottom: 6, color: label.assistive, fontSize: 16, lineHeight: 21, fontWeight: '500', letterSpacing: -0.32 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 6, backgroundColor: '#fff3f0' },
  tagText: { color: colors.primary, fontSize: 14, lineHeight: 18, fontWeight: '600', letterSpacing: -0.28 },
  voiceList: { gap: 13 },
  voiceItem: { gap: 4 },
  voiceTitle: { marginLeft: 7, color: label.assistive, fontSize: 16, lineHeight: 21, fontWeight: '500', letterSpacing: -0.32 },
  player: { height: 45, paddingHorizontal: 12, borderRadius: 8, flexDirection: 'row', alignItems: 'center', backgroundColor: fill.normal },
  playButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: fill.alternative },
  progressTrack: { flex: 1, height: 4, marginLeft: 16, marginRight: 12, borderRadius: 2, overflow: 'hidden', backgroundColor: fill.alternative },
  progressValue: { width: '53%', height: 4, borderRadius: 2, backgroundColor: colors.primary },
  duration: { width: 35, color: label.assistive, fontSize: 14, lineHeight: 18, fontWeight: '500', letterSpacing: -0.28, textAlign: 'right' },
  familyCard: { height: 93, paddingHorizontal: 20, borderRadius: 10, flexDirection: 'row', alignItems: 'center', backgroundColor: background.neutral },
  metric: { flex: 1, alignItems: 'center', gap: 3 },
  metricValue: { fontSize: 28, lineHeight: 36, fontWeight: '700', letterSpacing: -0.56 },
  metricLabel: { color: label.assistive, fontSize: 18, lineHeight: 23, fontWeight: '500', letterSpacing: -0.36 },
  storyCard: { paddingHorizontal: 23, paddingVertical: 14, borderRadius: 10, backgroundColor: background.neutral },
  storyText: { color: label.alternative, fontSize: 16, lineHeight: 21, fontWeight: '500', letterSpacing: -0.32 },
  disclaimer: { marginTop: 14, color: label.assistive, fontSize: 12, lineHeight: 16, fontWeight: '400', textAlign: 'center', letterSpacing: -0.24 },
});
