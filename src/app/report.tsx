import { Image } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Alarm, BottomNavigation, Setting } from '@/shared/ui';

const logoSource = require('../../assets/images/haemi-logo-small.png');

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
const FILL_ALT = '#dddedf';
const ERROR = '#ee2a2b';

const TOP_WORDS = [
  { rank: '1', name: '지민', relation: '손녀' },
  { rank: '2', name: '영수', relation: '아들' },
  { rank: '1', name: '순자', relation: '친구' },
];

const VOICES = [
  { title: '바닷가 사진', time: '0:02', progress: 0.56, playing: true },
  { title: '김장 사진', time: '0:00', progress: 0, playing: false },
  { title: '지민이 소식', time: '0:00', progress: 0, playing: false },
];

const STATS = [
  { value: '12', label: '남긴 추억', color: '#fb6a6a' },
  { value: '34', label: '사진', color: '#6abffb' },
  { value: '9', label: '한마디', color: '#04c87d' },
];

export default function ReportScreen() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 402);

  const openLogoutDialog = () => {
    setMenuOpen(false);
    setLogoutOpen(true);
  };

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <ReportHeader onToggleMenu={() => setMenuOpen((value) => !value)} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <ReportHero />
          <TopWordsSection />
          <VoiceSection />
          <FamilyStatsSection />
          <MonthlyStorySection />
        </ScrollView>

        {menuOpen && (
          <SettingsMenu
            onEdit={() => {
              setMenuOpen(false);
              router.push('/member-edit' as Href);
            }}
            onLogout={openLogoutDialog}
          />
        )}
      </SafeAreaView>

      <LogoutDialog
        visible={logoutOpen}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={() => setLogoutOpen(false)}
      />

      <BottomNavigation activeTab="Report" />
    </View>
  );
}

function ReportHeader({ onToggleMenu }: { onToggleMenu: () => void }) {
  return (
    <View style={styles.header}>
      <Image source={logoSource} style={styles.logo} contentFit="contain" />
      <View style={styles.headerActions}>
        <Alarm color={LINE} size={22} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="설정 메뉴"
          hitSlop={8}
          onPress={onToggleMenu}
        >
          <Setting color={LINE} size={24} />
        </Pressable>
      </View>
    </View>
  );
}

function ReportHero() {
  return (
    <View style={styles.heroSection}>
      <View style={styles.sectionInner}>
        <View style={styles.titleRow}>
          <Text style={styles.heroTitle}>10월 회상 리포트</Text>
          <Text style={styles.uploadIcon}>⇧</Text>
        </View>
        <View style={styles.relationRow}>
          <Text style={styles.relationText}>어머니</Text>
          <Text style={styles.relationText}>·</Text>
          <Text style={styles.relationText}>이복자 님</Text>
        </View>
        <View style={styles.heroCard}>
          <Text style={styles.heroCardEyebrow}>이번 달, 어머니와</Text>
          <Text style={styles.heroCardText}>18일 함께 이야기했어요</Text>
        </View>
      </View>
    </View>
  );
}

function TopWordsSection() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionTitle}>가장 많이 말씀하신 단어</Text>
        <View style={styles.wordList}>
          {TOP_WORDS.map((word, index) => (
            <View
              key={`${word.name}-${word.relation}`}
              style={[styles.wordRow, index < TOP_WORDS.length - 1 && styles.wordRowBorder]}
            >
              <View style={styles.rankBox}>
                <Text style={styles.rankText}>{word.rank}</Text>
              </View>
              <View style={styles.wordMeta}>
                <Text style={styles.wordName}>{word.name}</Text>
                <Text style={styles.wordRelation}>·</Text>
                <Text style={styles.wordRelation}>{word.relation}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={styles.placesBlock}>
          <Text style={styles.subLabel}>자주 떠올린 장소</Text>
          <View style={styles.chipRow}>
            {['바닷가', '고향집 마당', '남대문 시장'].map((place) => (
              <View key={place} style={styles.chip}>
                <Text style={styles.chipText}>{place}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function VoiceSection() {
  return (
    <View style={styles.section}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionTitle}>어머니의 목소리</Text>
        <View style={styles.voiceList}>
          {VOICES.map((voice) => (
            <View key={voice.title} style={styles.voiceBlock}>
              <Text style={styles.voiceTitle}>{voice.title}</Text>
              <View style={styles.player}>
                <View style={styles.playButton}>
                  <Text style={styles.playIcon}>{voice.playing ? 'Ⅱ' : '▶'}</Text>
                </View>
                <View style={styles.track}>
                  <View style={[styles.trackFill, { width: `${voice.progress * 100}%` }]} />
                </View>
                <Text style={styles.playerTime}>{voice.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function FamilyStatsSection() {
  return (
    <View style={styles.sectionSmall}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionTitle}>우리 가족 기록</Text>
        <View style={styles.statsCard}>
          {STATS.map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function MonthlyStorySection() {
  return (
    <View style={styles.storySection}>
      <View style={styles.sectionInner}>
        <Text style={styles.sectionTitle}>이달의 이야기</Text>
        <View style={styles.storyCard}>
          <Text style={styles.storyText}>
            이번 달 어머니는 인물 사진에 목소리를 자주{'\n'}
            남기셨어요. 남대문 시장 사진에 가족 반응이 가장{'\n'}
            따뜻했어요.
          </Text>
        </View>
        <Text style={styles.notice}>※이 자료는 의료적 진단이 아닙니다.</Text>
      </View>
    </View>
  );
}

function SettingsMenu({
  onEdit,
  onLogout,
}: {
  onEdit: () => void;
  onLogout: () => void;
}) {
  return (
    <View style={styles.menu}>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.menuItemActive, pressed && styles.pressed]}
        onPress={onEdit}
      >
        <Text style={styles.menuText}>정보 수정</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
        onPress={onLogout}
      >
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
            정말 <Text style={styles.dialogUser}>꾸이익(seunga418)</Text> 의 계정에서{'\n'}
            로그아웃하시겠습니까?
          </Text>
          <View style={styles.dialogActions}>
            <Pressable
              style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
              onPress={onCancel}
            >
              <Text style={styles.cancelText}>취소</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.logoutButton, pressed && styles.pressed]}
              onPress={onConfirm}
            >
              <Text style={styles.logoutText}>로그아웃</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 62,
    height: 24,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 94,
  },
  heroSection: {
    height: 217,
    borderBottomWidth: 4,
    borderBottomColor: FILL,
    backgroundColor: '#ffffff',
  },
  section: {
    height: 364,
    borderBottomWidth: 4,
    borderBottomColor: FILL,
    backgroundColor: '#ffffff',
  },
  sectionSmall: {
    height: 220,
    borderBottomWidth: 4,
    borderBottomColor: FILL,
    backgroundColor: '#ffffff',
  },
  storySection: {
    minHeight: 249,
    backgroundColor: '#ffffff',
  },
  sectionInner: {
    width: '100%',
    maxWidth: 344,
    alignSelf: 'center',
    paddingVertical: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroTitle: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.48,
  },
  uploadIcon: {
    color: TEXT,
    fontSize: 27,
    lineHeight: 28,
    fontWeight: '500',
  },
  relationRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 6,
  },
  relationText: {
    color: TEXT_ASSISTIVE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '400',
    letterSpacing: -0.36,
  },
  heroCard: {
    marginTop: 20,
    height: 93,
    borderRadius: 10,
    paddingHorizontal: 23,
    paddingTop: 14,
    backgroundColor: FILL,
  },
  heroCardEyebrow: {
    color: ORANGE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  heroCardText: {
    marginTop: 7,
    color: TEXT_MUTED,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.4,
  },
  sectionTitle: {
    color: TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  wordList: {
    marginTop: 20,
  },
  wordRow: {
    height: 55,
    paddingLeft: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  wordRowBorder: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#f2f2f2',
  },
  rankBox: {
    width: 20,
    height: 20,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE,
  },
  rankText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  wordMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wordName: {
    width: 31,
    color: TEXT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    letterSpacing: -0.36,
  },
  wordRelation: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  placesBlock: {
    marginTop: 20,
  },
  subLabel: {
    color: TEXT_ASSISTIVE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.32,
  },
  chipRow: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 4,
  },
  chip: {
    height: 26,
    borderRadius: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE_SOFT,
  },
  chipText: {
    color: ORANGE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  voiceList: {
    marginTop: 20,
    gap: 13,
  },
  voiceBlock: {
    gap: 4,
  },
  voiceTitle: {
    color: TEXT_ASSISTIVE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.32,
  },
  player: {
    height: 45,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: FILL,
  },
  playButton: {
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FILL_ALT,
  },
  playIcon: {
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 15,
    fontWeight: '700',
  },
  track: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: LINE,
  },
  trackFill: {
    height: 4,
    borderRadius: 2,
    backgroundColor: ORANGE,
  },
  playerTime: {
    width: 40,
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
    textAlign: 'right',
  },
  statsCard: {
    marginTop: 20,
    height: 93,
    borderRadius: 10,
    paddingHorizontal: 47,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: FILL,
  },
  statItem: {
    width: 66,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '700',
    letterSpacing: -0.56,
  },
  statLabel: {
    color: TEXT_ASSISTIVE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  storyCard: {
    marginTop: 20,
    height: 93,
    borderRadius: 10,
    paddingHorizontal: 23,
    paddingTop: 15,
    backgroundColor: FILL,
  },
  storyText: {
    color: TEXT_MUTED,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.32,
  },
  notice: {
    marginTop: 13,
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400',
    letterSpacing: -0.24,
    textAlign: 'center',
  },
  menu: {
    position: 'absolute',
    top: 58,
    right: 33,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ORANGE_SOFT,
  },
  menuItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  menuText: {
    color: ORANGE_DEEP,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
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
    letterSpacing: -0.4,
  },
  dialogText: {
    marginTop: 12,
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  dialogUser: {
    color: TEXT_MUTED,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.32,
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
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FILL,
  },
  logoutButton: {
    minHeight: 26,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ERROR,
  },
  cancelText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  logoutText: {
    color: FILL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    letterSpacing: -0.28,
  },
  pressed: {
    opacity: 0.72,
  },
});
