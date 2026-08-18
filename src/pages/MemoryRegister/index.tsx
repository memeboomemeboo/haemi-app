import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlaylist,
  useAudioPlaylistStatus,
  useAudioRecorder,
} from 'expo-audio';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';

import { addFamilyMemoryItem } from '@/entities/family-memory';
import type { VoiceMemoSegment } from '@/entities/family-memory';
import { colors } from '@/shared/constants';
import { Arrow, BottomNavigation, Close, Picture } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { useUserContext } from '@/shared/context/UserContext';

const ORANGE = '#fd6941';
const ORANGE_SOFT = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const TEXT_PLACEHOLDER = '#b8babc';
const LINE_NORMAL = '#c1c2c3';
const UPLOAD_ICON = '#dadbdc';
const FILL = '#f7f7f7';
const BUTTON_TEXT = colors.light.label.buttonText;
const MEMO_MAX_LENGTH = 200;
const MEMO_MIN_HEIGHT = 132;
const MEMO_COUNTER_SPACE = 34;
const MEMO_DEFAULT_LINES = 4;
const MEMO_CHARS_PER_LINE = 22;
const MEMO_LINE_HEIGHT = 23;
const MAX_PHOTO_COUNT = 2;
const VOICE_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document' as const,
};
const MORE_SVG = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 10C3.9 10 3 10.9 3 12C3 13.1 3.9 14 5 14C6.1 14 7 13.1 7 12C7 10.9 6.1 10 5 10ZM19 10C17.9 10 17 10.9 17 12C17 13.1 17.9 14 19 14C20.1 14 21 13.1 21 12C21 10.9 20.1 10 19 10ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10Z" fill="#C1C2C3"/></svg>`;
const RECORD_BUTTON_SVG = `<svg width="37" height="37" viewBox="0 0 37 37" fill="none" xmlns="http://www.w3.org/2000/svg"><g filter="url(#filter0_f_507_2025)"><circle cx="18.5" cy="18.5" r="16.5" fill="#FD6941"/></g><defs><filter id="filter0_f_507_2025" x="0" y="0" width="37" height="37" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"/><feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/><feGaussianBlur stdDeviation="1" result="effect1_foregroundBlur_507_2025"/></filter></defs></svg>`;
const STOP_RECORD_SVG = `<svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="33" height="33" rx="16.5" fill="#FD6941"/><rect x="10" y="10" width="13" height="13" rx="3" fill="white"/></svg>`;
const REPLAY_LEFT_SVG = `<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.4999 4.79159V0.958252L6.70825 5.74992L11.4999 10.5416V6.70825C14.672 6.70825 17.2499 9.28617 17.2499 12.4583C17.2499 15.6303 14.672 18.2083 11.4999 18.2083C8.32784 18.2083 5.74992 15.6303 5.74992 12.4583H3.83325C3.83325 16.6941 7.26409 20.1249 11.4999 20.1249C15.7358 20.1249 19.1666 16.6941 19.1666 12.4583C19.1666 8.22242 15.7358 4.79159 11.4999 4.79159Z" fill="#76787A"/></svg>`;
const REPLAY_RIGHT_SVG = `<svg width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.5001 4.79159V0.958252L16.2917 5.74992L11.5001 10.5416V6.70825C8.328 6.70825 5.75008 9.28617 5.75008 12.4583C5.75008 15.6303 8.328 18.2083 11.5001 18.2083C14.6722 18.2083 17.2501 15.6303 17.2501 12.4583H19.1667C19.1667 16.6941 15.7359 20.1249 11.5001 20.1249C7.26425 20.1249 3.83342 16.6941 3.83342 12.4583C3.83342 8.22242 7.26425 4.79159 11.5001 4.79159Z" fill="#76787A"/></svg>`;
const SOUND_SVG = `<svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M18.5643 11.5002H15.3881C14.5111 11.5002 13.8 12.2113 13.8 13.0883V32.1453C13.8 33.0224 14.5111 33.7334 15.3881 33.7334H18.5643C19.4414 33.7334 20.1524 33.0224 20.1524 32.1453V13.0883C20.1524 12.2113 19.4414 11.5002 18.5643 11.5002Z" fill="#76787A"/><path d="M31.2689 11.5002H28.0927C27.2156 11.5002 26.5046 12.2113 26.5046 13.0883V32.1453C26.5046 33.0224 27.2156 33.7334 28.0927 33.7334H31.2689C32.146 33.7334 32.857 33.0224 32.857 32.1453V13.0883C32.857 12.2113 32.146 11.5002 31.2689 11.5002Z" fill="#76787A"/></svg>`;
const SOUND_START_SVG = `<svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.3333 12.2359C15.3333 11.912 15.6866 11.712 15.9643 11.8786L33.9044 22.6427C34.1742 22.8045 34.1742 23.1955 33.9044 23.3573L15.9643 34.1214C15.6866 34.288 15.3333 34.088 15.3333 33.7641V12.2359Z" fill="#76787A"/></svg>`;
const WAVEFORM_BARS = [
  24, 25, 26, 25, 26, 25, 24, 24, 25, 26, 25, 24, 25, 26, 26, 25,
  24, 24, 25, 26, 27, 28, 27, 26, 25, 24, 24, 25, 26, 25, 24, 24,
  25, 26, 27, 34, 46, 58, 68, 72, 69, 62, 54, 48, 42, 38, 36, 34,
  33, 32, 31, 30, 30, 31, 30, 29, 28, 28, 29, 34, 54, 66, 68, 42,
];

type VoiceMemoState = 'idle' | 'recording' | 'recorded';
type VoiceMenuPosition = {
  top: number;
  left: number;
};

type RegisterDialogState = {
  visible: boolean;
  title: string;
  message?: string;
  onConfirm?: () => void;
};

const formatDuration = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getMemoLineCount = (value: string) => {
  if (value.length === 0) {
    return 1;
  }

  return value.split('\n').reduce((lineCount, line) => {
    const textLength = Array.from(line).length;
    return lineCount + Math.max(1, Math.ceil(textLength / MEMO_CHARS_PER_LINE));
  }, 0);
};

const getVoiceSegmentsDuration = (segments: VoiceMemoSegment[]) => (
  segments.reduce((total, segment) => total + segment.durationSeconds, 0)
);

const getVoiceSegmentOffset = (segments: VoiceMemoSegment[], segmentIndex: number) => (
  segments
    .slice(0, segmentIndex)
    .reduce((total, segment) => total + segment.durationSeconds, 0)
);

const getVoicePlaybackTarget = (segments: VoiceMemoSegment[], targetSeconds: number) => {
  const clampedSeconds = Math.max(0, targetSeconds);
  let elapsedSeconds = 0;

  for (let index = 0; index < segments.length; index += 1) {
    const segmentDuration = Math.max(segments[index].durationSeconds, 1);

    if (clampedSeconds <= elapsedSeconds + segmentDuration || index === segments.length - 1) {
      return {
        index,
        offsetSeconds: Math.min(segmentDuration, Math.max(0, clampedSeconds - elapsedSeconds)),
      };
    }

    elapsedSeconds += segmentDuration;
  }

  return {
    index: 0,
    offsetSeconds: 0,
  };
};

export default function MemoryRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { group, relation } = useUserContext();
  const audioRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const memoInputRef = useRef<TextInput>(null);
  const voiceMenuAnchorRef = useRef<View>(null);
  const recordingBaseSecondsRef = useRef(0);
  const [photoUris, setPhotoUris] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const [isMemoFocused, setIsMemoFocused] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceMemoState>('idle');
  const [voiceElapsedSeconds, setVoiceElapsedSeconds] = useState(0);
  const [voicePlaybackSeconds, setVoicePlaybackSeconds] = useState(0);
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const [voiceRecordingUri, setVoiceRecordingUri] = useState<string | null>(null);
  const [voiceSegments, setVoiceSegments] = useState<VoiceMemoSegment[]>([]);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [isVoiceMenuOpen, setIsVoiceMenuOpen] = useState(false);
  const [voiceMenuPosition, setVoiceMenuPosition] = useState<VoiceMenuPosition>({ top: 0, left: 0 });
  const [registerDialog, setRegisterDialog] = useState<RegisterDialogState>({
    visible: false,
    title: '',
  });
  const voicePlaylist = useAudioPlaylist({
    sources: voiceSegments.map((segment) => ({ uri: segment.uri })),
    updateInterval: 100,
  });
  const voicePlaylistStatus = useAudioPlaylistStatus(voicePlaylist);

  const hasPhoto = photoUris.length > 0;
  const isRecorded = voiceState === 'recorded';
  const isRecording = voiceState === 'recording';
  const voiceSegmentsDuration = getVoiceSegmentsDuration(voiceSegments);
  const recordedDuration = Math.max(
    isRecording ? voiceElapsedSeconds : voiceSegmentsDuration,
    voiceElapsedSeconds,
    1,
  );
  const playlistPlaybackSeconds = getVoiceSegmentOffset(
    voiceSegments,
    voicePlaylistStatus.currentIndex,
  ) + voicePlaylistStatus.currentTime;
  const currentVoicePlaybackSeconds = voiceSegments.length > 0
    ? Math.min(recordedDuration, playlistPlaybackSeconds)
    : voicePlaybackSeconds;
  const currentIsVoicePlaying = voiceSegments.length > 0
    ? voicePlaylistStatus.playing
    : isVoicePlaying;
  const voiceProgressPercent = `${Math.min(100, Math.max(0, (currentVoicePlaybackSeconds / recordedDuration) * 100))}%` as `${number}%`;
  const voiceStartTime = isRecorded ? formatDuration(currentVoicePlaybackSeconds) : '0:00';
  const voiceEndTime = voiceState === 'idle' ? '0:00' : formatDuration(voiceElapsedSeconds);
  const waveformPhase = Math.floor(voiceElapsedSeconds * 8);
  const memoLength = Array.from(memo).length;
  const memoExtraLines = Math.max(0, getMemoLineCount(memo) - MEMO_DEFAULT_LINES);
  const memoInputHeight = MEMO_MIN_HEIGHT - MEMO_COUNTER_SPACE + memoExtraLines * MEMO_LINE_HEIGHT;
  const memoBoxHeight = MEMO_MIN_HEIGHT + memoExtraLines * MEMO_LINE_HEIGHT;

  useEffect(() => {
    if (!isRecording || recordingStartedAt === null) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setVoiceElapsedSeconds((Date.now() - recordingStartedAt) / 1000);
    }, 100);

    return () => clearInterval(timerId);
  }, [isRecording, recordingStartedAt]);

  useEffect(() => () => {
    voicePlaylist.pause();

    if (audioRecorder.isRecording) {
      void audioRecorder.stop().catch(() => undefined);
    }
  }, [audioRecorder, voicePlaylist]);

  const pickImage = async () => {
    const remainingPhotoCount = MAX_PHOTO_COUNT - photoUris.length;

    if (remainingPhotoCount <= 0) {
      Alert.alert('사진은 2장까지 업로드할 수 있어요');
      return;
    }

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('권한이 필요해요', '사진을 선택하려면 갤러리 접근 권한을 허용해주세요.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: remainingPhotoCount,
        quality: 0.9,
      });

      if (!result.canceled) {
        const selectedPhotoUris = result.assets
          .map((asset) => asset.uri)
          .filter(Boolean)
          .slice(0, remainingPhotoCount);

        setPhotoUris((current) => [...current, ...selectedPhotoUris].slice(0, MAX_PHOTO_COUNT));
      }
    } catch {
      Alert.alert('사진을 불러오지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUris((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const openRegisterDialog = (dialog: Omit<RegisterDialogState, 'visible'>) => {
    setRegisterDialog({
      ...dialog,
      visible: true,
    });
  };

  const closeRegisterDialog = () => {
    setRegisterDialog((current) => ({
      ...current,
      visible: false,
    }));
  };

  const confirmRegisterDialog = () => {
    const confirmAction = registerDialog.onConfirm;

    closeRegisterDialog();
    confirmAction?.();
  };

  const handleRegisterDialogRequestClose = () => {
    if (registerDialog.onConfirm) {
      confirmRegisterDialog();
      return;
    }

    closeRegisterDialog();
  };

  const handlePost = () => {
    if (!hasPhoto) {
      openRegisterDialog({
        title: '사진을 업로드해주세요',
        message: '추억을 등록하려면 사진이 필요해요.',
      });
      return;
    }

    if (memo.trim().length === 0 && !isRecorded) {
      openRegisterDialog({
        title: '추억 내용을 입력해주세요',
        message: '메모를 작성하거나 음성 메모를 녹음해주세요.',
      });
      return;
    }

    if (!group?.groupId) {
      openRegisterDialog({
        title: '그룹 정보를 불러올 수 없어요',
        message: '다시 시도해주세요.',
      });
      return;
    }

    try {
      await addFamilyMemoryItem(
        group.groupId, // albumId로 사용
        group.members?.[0]?.memberId || 'unknown', // memberId
        '나', // memberName (실제로는 로그인한 사용자 정보 사용)
        relation || '친구', // memberRelation
        {
          memo,
          hasPhoto,
          photoUri: photoUris[0] ?? null,
          photoUris,
          hasVoiceMemo: isRecorded,
          voiceDurationSeconds: isRecorded ? Math.max(1, Math.round(recordedDuration)) : 0,
          voiceUri: isRecorded ? voiceRecordingUri : null,
          voiceSegments: isRecorded ? voiceSegments : [],
        }
      );

      openRegisterDialog({
        title: '추억이 등록되었습니다.',
        message: '가족 추억 페이지에서 등록한 추억을 확인할 수 있어요.',
        onConfirm: () => router.replace('/family-memories'),
      });
    } catch (error) {
      openRegisterDialog({
        title: '추억 등록에 실패했어요',
        message: '잠시 후 다시 시도해주세요.',
      });
    }
  };

  const handleMemoChange = (value: string) => {
    setMemo(Array.from(value).slice(0, MEMO_MAX_LENGTH).join(''));
  };

  const ensureRecordingPermission = async () => {
    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '음성 메모를 녹음하려면 마이크 권한을 허용해주세요.');
      return false;
    }

    return true;
  };

  const stopVoiceRecording = async () => {
    const segmentStartedAt = recordingStartedAt ?? Date.now();

    await audioRecorder.stop();

    const recordedUri = audioRecorder.uri;
    const segmentDurationSeconds = Math.max(
      1,
      audioRecorder.currentTime,
      (Date.now() - segmentStartedAt) / 1000,
    );

    if (!recordedUri) {
      throw new Error('Recording URI is empty.');
    }

    const nextSegment = {
      uri: recordedUri,
      durationSeconds: segmentDurationSeconds,
    };
    const nextElapsedSeconds = recordingBaseSecondsRef.current + segmentDurationSeconds;

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    setVoiceSegments((current) => [...current, nextSegment]);
    setVoiceRecordingUri((current) => current ?? recordedUri);
    setRecordingStartedAt(null);
    setVoiceElapsedSeconds(Math.max(1, nextElapsedSeconds));
    setVoicePlaybackSeconds(0);
    setIsVoicePlaying(false);
    setVoiceState('recorded');
  };

  const startVoiceRecording = async (continueFromCurrent: boolean = false) => {
    const hasPermission = await ensureRecordingPermission();

    if (!hasPermission) {
      return;
    }

    voicePlaylist.pause();
    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await audioRecorder.prepareToRecordAsync(VOICE_RECORDING_OPTIONS);
    audioRecorder.record();

    const initialElapsedSeconds = continueFromCurrent ? voiceSegmentsDuration : 0;

    recordingBaseSecondsRef.current = initialElapsedSeconds;
    setVoiceElapsedSeconds(initialElapsedSeconds);
    setVoicePlaybackSeconds(0);
    setIsVoicePlaying(false);
    if (!continueFromCurrent) {
      setVoiceRecordingUri(null);
      setVoiceSegments([]);
    }
    setRecordingStartedAt(Date.now() - initialElapsedSeconds * 1000);
    setVoiceState('recording');
  };

  const handleRecordPress = async () => {
    setIsVoiceMenuOpen(false);

    if (voiceState === 'idle') {
      try {
        await startVoiceRecording();
      } catch {
        Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.');
      }
      return;
    }

    if (voiceState === 'recording') {
      try {
        await stopVoiceRecording();
      } catch {
        Alert.alert('녹음을 저장하지 못했어요', '잠시 후 다시 시도해주세요.');
      }
    }
  };

  const handleToggleVoicePlayback = async () => {
    if (!isRecorded || voiceSegments.length === 0) {
      return;
    }

    if (currentVoicePlaybackSeconds >= recordedDuration) {
      const { index, offsetSeconds } = getVoicePlaybackTarget(voiceSegments, 0);

      voicePlaylist.skipTo(index);
      await voicePlaylist.seekTo(offsetSeconds);
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    if (currentIsVoicePlaying) {
      voicePlaylist.pause();
      setIsVoicePlaying(false);
      return;
    }

    voicePlaylist.play();
    setIsVoicePlaying(true);
  };

  const seekVoicePlayback = async (targetSeconds: number) => {
    if (voiceSegments.length === 0) {
      return;
    }

    const clampedSeconds = Math.min(recordedDuration, Math.max(0, targetSeconds));
    const { index, offsetSeconds } = getVoicePlaybackTarget(voiceSegments, clampedSeconds);

    voicePlaylist.skipTo(index);
    await voicePlaylist.seekTo(offsetSeconds);
    setVoicePlaybackSeconds(clampedSeconds);
  };

  const handleReplayBackward = async () => {
    await seekVoicePlayback(currentVoicePlaybackSeconds - 10);
  };

  const handleReplayForward = async () => {
    await seekVoicePlayback(currentVoicePlaybackSeconds + 10);
  };

  const closeVoiceMenu = () => {
    setIsVoiceMenuOpen(false);
  };

  const toggleVoiceMenu = () => {
    if (isVoiceMenuOpen) {
      closeVoiceMenu();
      return;
    }

    voiceMenuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setVoiceMenuPosition({
        top: y + height + 8,
        left: x + width - 104,
      });
      setIsVoiceMenuOpen(true);
    });
  };

  const handleContinueRecording = async () => {
    setIsVoiceMenuOpen(false);

    try {
      await startVoiceRecording(true);
    } catch {
      Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  const handleDeleteVoice = async () => {
    setIsVoiceMenuOpen(false);
    voicePlaylist.pause();

    if (audioRecorder.isRecording) {
      await audioRecorder.stop().catch(() => undefined);
      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      }).catch(() => undefined);
    }

    setVoiceElapsedSeconds(0);
    setVoicePlaybackSeconds(0);
    setIsVoicePlaying(false);
    setVoiceRecordingUri(null);
    setVoiceSegments([]);
    setRecordingStartedAt(null);
    recordingBaseSecondsRef.current = 0;
    setVoiceState('idle');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 20) }]}>
        <HomeHeader style={styles.header} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.titleRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            hitSlop={8}
            onPress={() => router.back()}
          >
            <Arrow size={22} color={TEXT} style={styles.backArrow} />
          </Pressable>
          <Text style={styles.title}>추억 등록</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>사진</Text>
            <View style={styles.photoRow}>
                {photoUris.length < MAX_PHOTO_COUNT && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="이미지 업로드"
                    style={({ pressed }) => [styles.uploadTile, pressed && styles.pressed]}
                    onPress={pickImage}
                  >
                    <Picture size={34} color={UPLOAD_ICON} />
                    <Text style={styles.uploadText}>이미지를 업로드하세요</Text>
                    <Text style={styles.uploadCountText}>
                      {photoUris.length}/{MAX_PHOTO_COUNT}
                    </Text>
                  </Pressable>
                )}
                {photoUris.map((photoUri, index) => (
                  <View key={`${photoUri}-${index}`} style={styles.photoFrame}>
                    <View style={styles.photoTile}>
                      <Image source={{ uri: photoUri }} style={styles.photoImage} contentFit="cover" />
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="선택한 이미지 삭제"
                      hitSlop={6}
                      style={styles.removePhotoButton}
                      onPress={() => handleRemovePhoto(index)}
                    >
                      <Close size={14} color={TEXT_MUTED} />
                    </Pressable>
                  </View>
                ))}
                {photoUris.length === 0 && (
                  <View style={styles.photoPlaceholder} />
                )}
            </View>
          </View>

          <View style={[styles.field, styles.voiceField]}>
            <View style={styles.fieldHeader}>
              <Text style={styles.fieldLabel}>음성 메모</Text>
              <View ref={voiceMenuAnchorRef} collapsable={false}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="음성 메모 옵션"
                  hitSlop={8}
                  onPress={toggleVoiceMenu}
                >
                  <SvgXml xml={MORE_SVG} width={24} height={24} />
                </Pressable>
              </View>
            </View>
              <View style={[styles.voiceBox, isRecording && styles.voiceBoxRecording, isRecorded && styles.voiceBoxRecorded]}>
                {isRecording ? (
                  <View style={styles.recordingContent}>
                    <Text style={styles.recordingTime}>{voiceEndTime}</Text>
                    <View style={styles.waveform}>
                      {WAVEFORM_BARS.map((height, index) => (
                        <View
                          key={`${height}-${index}`}
                          style={[
                            styles.waveformBar,
                            {
                              height: Math.max(18, height + ((index + waveformPhase) % 5 === 0 ? 10 : 0)),
                              opacity: index < Math.max(8, waveformPhase % WAVEFORM_BARS.length) ? 1 : 0.54,
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="음성 녹음 정지"
                      style={styles.recordingStopButton}
                      onPress={handleRecordPress}
                    >
                      <SvgXml xml={STOP_RECORD_SVG} width={33} height={33} />
                    </Pressable>
                  </View>
                ) : isRecorded ? (
                  <>
                    <View style={styles.voiceTop}>
                      <Text style={styles.voiceTime}>{voiceStartTime}</Text>
                      <View style={styles.voiceTrack}>
                        <View style={styles.voiceTrackBase} />
                        <View style={[styles.voiceTrackProgress, { width: voiceProgressPercent }]} />
                      </View>
                      <Text style={styles.voiceTime}>{voiceEndTime}</Text>
                    </View>
                  <View style={styles.playbackControls}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="10초 뒤로"
                      style={styles.replayButton}
                      onPress={handleReplayBackward}
                    >
                      <SvgXml xml={REPLAY_LEFT_SVG} width={23} height={23} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={currentIsVoicePlaying ? '음성 일시정지' : '음성 재생'}
                      style={styles.soundButton}
                      onPress={handleToggleVoicePlayback}
                    >
                      <SvgXml xml={currentIsVoicePlaying ? SOUND_SVG : SOUND_START_SVG} width={46} height={46} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="10초 앞으로"
                      style={styles.replayButton}
                      onPress={handleReplayForward}
                    >
                      <SvgXml xml={REPLAY_RIGHT_SVG} width={23} height={23} />
                    </Pressable>
                  </View>
                  </>
                ) : (
                  <View style={styles.voiceIdleContent}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="음성 녹음"
                      style={styles.recordButton}
                      onPress={handleRecordPress}
                    >
                      <SvgXml xml={RECORD_BUTTON_SVG} width={37} height={37} />
                    </Pressable>
                  </View>
                )}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>메모</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="메모 입력"
              style={[styles.memoBox, { height: memoBoxHeight }, isMemoFocused && styles.memoBoxFocused]}
              onPress={() => memoInputRef.current?.focus()}
            >
                <TextInput
                  ref={memoInputRef}
                  multiline
                  maxLength={MEMO_MAX_LENGTH}
                  value={memo}
                  onChangeText={handleMemoChange}
                  onFocus={() => setIsMemoFocused(true)}
                  onBlur={() => setIsMemoFocused(false)}
                  placeholder="가족과 나누고 싶은 추억을 적어주세요"
                  placeholderTextColor={TEXT_PLACEHOLDER}
                  style={[styles.memoInput, { height: memoInputHeight }, memoLength === 0 && styles.memoInputEmpty]}
                  textAlignVertical="top"
                  cursorColor={ORANGE}
                  selectionColor={ORANGE_SOFT}
                  scrollEnabled={false}
                />
                <Text style={styles.countText}>
                  {memoLength}/{MEMO_MAX_LENGTH}
                </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actionArea}>
        <View style={styles.buttonRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="취소"
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="게시"
            style={({ pressed }) => [styles.postButton, pressed && styles.pressed]}
            onPress={handlePost}
          >
            <Text style={styles.postButtonText}>게시</Text>
          </Pressable>
        </View>
      </View>

      <BottomNavigation activeTab="Memory" />

      <Modal transparent visible={isVoiceMenuOpen} animationType="none" onRequestClose={closeVoiceMenu}>
        <View style={styles.voiceMenuLayer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="음성 메모 옵션 닫기"
            style={styles.voiceMenuBackdrop}
            onPress={closeVoiceMenu}
          />
          <View style={[styles.voiceMenu, voiceMenuPosition]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="음성 이어 녹음"
              style={[styles.voiceMenuItem, styles.voiceMenuRecordItem]}
              onPress={handleContinueRecording}
            >
              <Text style={styles.voiceMenuText}>녹음</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="음성 삭제"
              style={styles.voiceMenuItem}
              onPress={handleDeleteVoice}
            >
              <Text style={styles.voiceMenuText}>삭제</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={registerDialog.visible}
        animationType="fade"
        onRequestClose={handleRegisterDialogRequestClose}
      >
        <View style={styles.registerDialogLayer}>
          <View style={styles.registerDialog}>
            <Text style={styles.registerDialogTitle}>{registerDialog.title}</Text>
            {registerDialog.message && (
              <Text style={styles.registerDialogMessage}>{registerDialog.message}</Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="모달 확인"
              style={({ pressed }) => [styles.registerDialogButton, pressed && styles.pressed]}
              onPress={confirmRegisterDialog}
            >
              <Text style={styles.registerDialogButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fixedTop: {
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 10,
    marginBottom: 26,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 27,
    paddingTop: 0,
    paddingBottom: 24,
    alignItems: 'center',
  },
  titleRow: {
    width: '100%',
    maxWidth: 344,
    height: 31,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    transform: [{ scaleX: -1 }],
  },
  title: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.48,
  },
  form: {
    width: '100%',
    maxWidth: 344,
    paddingTop: 24,
    gap: 35,
  },
  field: {
    gap: 12,
  },
  voiceField: {
    position: 'relative',
    zIndex: 3,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  photoFrame: {
    position: 'relative',
    width: 168,
    height: 127,
  },
  photoPlaceholder: {
    width: 168,
    height: 127,
  },
  photoTile: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    zIndex: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  uploadTile: {
    width: 168,
    height: 127,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#f5f5f5',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  uploadCountText: {
    color: TEXT_PLACEHOLDER,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  voiceBox: {
    height: 112,
    borderRadius: 10,
    backgroundColor: FILL,
    paddingHorizontal: 13,
    paddingTop: 14,
    alignItems: 'center',
  },
  voiceBoxRecording: {
    height: 176,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  voiceBoxRecorded: {
    backgroundColor: '#ffffff',
  },
  voiceTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  voiceTime: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  voiceTrack: {
    width: 233,
    maxWidth: '67%',
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: '#dddedf',
  },
  voiceTrackBase: {
    width: '100%',
    height: 6,
    backgroundColor: '#dddedf',
  },
  voiceTrackProgress: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 6,
    backgroundColor: ORANGE,
  },
  voiceIdleContent: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingContent: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  recordingTime: {
    color: ORANGE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.32,
  },
  waveform: {
    width: '100%',
    height: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
  },
  waveformBar: {
    width: 3,
    borderRadius: 1.5,
    backgroundColor: ORANGE,
  },
  recordingStopButton: {
    width: 33,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playbackControls: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 17,
  },
  replayButton: {
    width: 23,
    height: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceMenuLayer: {
    flex: 1,
  },
  voiceMenuBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  voiceMenu: {
    position: 'absolute',
    width: 104,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.24,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 12,
    overflow: 'hidden',
  },
  voiceMenuItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  voiceMenuRecordItem: {
    backgroundColor: '#fff3f0',
    borderBottomWidth: 1,
    borderBottomColor: ORANGE_SOFT,
  },
  voiceMenuText: {
    color: '#fd6035',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  memoBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: FILL,
    overflow: 'hidden',
  },
  memoBoxFocused: {
    borderColor: ORANGE_SOFT,
  },
  memoInput: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 0,
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  memoInputEmpty: {
    fontWeight: '400',
  },
  countText: {
    position: 'absolute',
    right: 14,
    bottom: 8,
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
    letterSpacing: -0.28,
  },
  actionArea: {
    paddingHorizontal: 27,
    paddingTop: 12,
    paddingBottom: 23,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  buttonRow: {
    width: '100%',
    maxWidth: 344,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  cancelButton: {
    width: 164,
    height: 34,
    borderRadius: 5,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postButton: {
    width: 164,
    height: 35,
    borderRadius: 5,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: ORANGE,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: -0.4,
    includeFontPadding: false,
  },
  postButtonText: {
    color: BUTTON_TEXT,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '500',
    letterSpacing: -0.4,
    includeFontPadding: false,
  },
  registerDialogLayer: {
    flex: 1,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerDialog: {
    width: '100%',
    maxWidth: 336,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 10,
  },
  registerDialogTitle: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.36,
  },
  registerDialogMessage: {
    alignSelf: 'stretch',
    marginTop: 8,
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: -0.28,
  },
  registerDialogButton: {
    width: '100%',
    height: 38,
    marginTop: 20,
    borderRadius: 5,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerDialogButtonText: {
    color: BUTTON_TEXT,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '600',
    letterSpacing: -0.32,
  },
  pressed: {
    opacity: 0.72,
  },
});
