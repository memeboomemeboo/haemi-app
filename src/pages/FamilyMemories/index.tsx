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
import { Link } from 'expo-router';
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
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  removeFamilyMemoryItem,
  updateFamilyMemoryItem,
  useFamilyMemoryItems,
  fetchFamilyMemoryItems,
} from '@/entities/family-memory';
import type { FamilyMemoryItem, VoiceMemoSegment } from '@/entities/family-memory';
import {
  BottomNavigation,
  Comment,
  Fab,
  HeartFilled,
  HeartOutline,
  More,
  MoreVertical,
  Close,
  Picture,
  Sent,
} from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';
import { useUserContext } from '@/shared/context/UserContext';

const ORANGE = '#fd6941';
const ORANGE_LIGHT = '#ffad9c';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE = '#dadbdc';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';
const VOICE_RECORDING_OPTIONS = {
  ...RecordingPresets.HIGH_QUALITY,
  directory: 'document' as const,
};

function formatVoiceDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

const getVoiceSegmentsDuration = (segments: VoiceMemoSegment[]) => (
  segments.reduce((total, segment) => total + segment.durationSeconds, 0)
);

const getVoiceSegmentOffset = (segments: VoiceMemoSegment[], segmentIndex: number) => (
  segments
    .slice(0, segmentIndex)
    .reduce((total, segment) => total + segment.durationSeconds, 0)
);

const getPlayableVoiceSegments = ({
  voiceSegments,
  voiceUri,
  voiceDurationSeconds,
}: {
  voiceSegments?: VoiceMemoSegment[];
  voiceUri?: string | null;
  voiceDurationSeconds: number;
}) => {
  if (voiceSegments && voiceSegments.length > 0) {
    return voiceSegments;
  }

  if (!voiceUri) {
    return [];
  }

  return [{
    uri: voiceUri,
    durationSeconds: Math.max(1, voiceDurationSeconds),
  }];
};

type MemoryComment = {
  id: string;
  authorName: string;
  date: string;
  body: string;
};

type MenuPosition = {
  top: number;
  left: number;
};

type MemoryPhotoDraft = {
  hasPhoto: boolean;
  photoUri: string | null;
  photoUris: string[];
};

type MemoryVoiceDraft = {
  hasVoiceMemo: boolean;
  voiceDurationSeconds: number;
  voiceUri: string | null;
  voiceSegments: VoiceMemoSegment[];
};

type MemoryFeedItem = {
  id: string;
  authorName: string;
  timeText: string;
  body: string;
  hasPhoto: boolean;
  photoUri: string | null;
  photoUris: string[];
  hasVoiceMemo: boolean;
  voiceDurationSeconds: number;
  voiceUri: string | null;
  voiceSegments: VoiceMemoSegment[];
  liked: boolean;
  comments: MemoryComment[];
  likeCount: number;
};

function formatRegisteredTime(createdAt: string) {
  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000));

  if (elapsedSeconds < 60) {
    return '방금전';
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes}분전`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours}시간전`;
  }

  return `${Math.floor(elapsedHours / 24)}일전`;
}

function mapRegisteredMemory(memory: FamilyMemoryItem): MemoryFeedItem {
  return {
    id: memory.id,
    authorName: memory.authorName,
    timeText: formatRegisteredTime(memory.createdAt),
    body: memory.memo,
    hasPhoto: memory.hasPhoto,
    photoUri: memory.photoUri,
    photoUris: memory.photoUris,
    hasVoiceMemo: memory.hasVoiceMemo,
    voiceDurationSeconds: memory.voiceDurationSeconds,
    voiceUri: memory.voiceUri,
    voiceSegments: memory.voiceSegments,
    liked: false,
    comments: [],
    likeCount: 0,
  };
}

export default function FamilyMemoriesScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 20) }]}>
        <HomeHeader style={styles.header} />
      </View>

      <FeedScreen />

      <Link href="/memory-register" asChild>
        <Fab
          accessibilityLabel="추억 등록"
          style={styles.fab}
        />
      </Link>

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

function FeedScreen() {
  const { group } = useUserContext();
  const editVoiceRecorder = useAudioRecorder(VOICE_RECORDING_OPTIONS);
  const registeredMemories = useFamilyMemoryItems();
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const editVoiceRecordingStartedAtRef = useRef<number | null>(null);

  // 앨범 데이터 로드
  useEffect(() => {
    const loadMemories = async () => {
      if (!group?.groupId) return;

      setIsLoadingFeed(true);
      try {
        // TODO: groupId를 albumId로 사용 (실제로는 API에서 groupId로 albumId를 조회해야 함)
        await fetchFamilyMemoryItems(group.groupId);
      } catch (error) {
        Alert.alert('추억을 불러오지 못했어요', '잠시 후 다시 시도해주세요.');
      } finally {
        setIsLoadingFeed(false);
      }
    };

    loadMemories();
  }, [group?.groupId]);
  const [removedMemoryIds, setRemovedMemoryIds] = useState<Record<string, boolean>>({});
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});
  const [commentOpenById, setCommentOpenById] = useState<Record<string, boolean>>({});
  const [commentDraftById, setCommentDraftById] = useState<Record<string, string>>({});
  const [addedCommentsById, setAddedCommentsById] = useState<Record<string, MemoryComment[]>>({});
  const [editedBodyById, setEditedBodyById] = useState<Record<string, string>>({});
  const [editedPhotoById, setEditedPhotoById] = useState<Record<string, MemoryPhotoDraft>>({});
  const [editedVoiceById, setEditedVoiceById] = useState<Record<string, MemoryVoiceDraft>>({});
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [editPhotoDraft, setEditPhotoDraft] = useState<MemoryPhotoDraft>({
    hasPhoto: false,
    photoUri: null,
    photoUris: [],
  });
  const [editVoiceDraft, setEditVoiceDraft] = useState<MemoryVoiceDraft>({
    hasVoiceMemo: false,
    voiceDurationSeconds: 0,
    voiceUri: null,
    voiceSegments: [],
  });
  const [editVoiceRecordingStartedAt, setEditVoiceRecordingStartedAt] = useState<number | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [commentEditDraft, setCommentEditDraft] = useState('');
  const [editedCommentBodyById, setEditedCommentBodyById] = useState<Record<string, string>>({});
  const [removedCommentIds, setRemovedCommentIds] = useState<Record<string, boolean>>({});
  const visibleItems = registeredMemories
    .map(mapRegisteredMemory)
    .filter((item) => !removedMemoryIds[item.id])
    .map((item) => ({
      ...item,
      body: editedBodyById[item.id] ?? item.body,
      ...(editedPhotoById[item.id] ?? {}),
      ...(editedVoiceById[item.id] ?? {}),
    }));

  useEffect(() => {
    if (editVoiceRecordingStartedAt === null) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setEditVoiceDraft((current) => ({
        hasVoiceMemo: true,
        voiceUri: current.voiceUri,
        voiceSegments: current.voiceSegments,
        voiceDurationSeconds: Math.max(1, (Date.now() - editVoiceRecordingStartedAt) / 1000),
      }));
    }, 100);

    return () => clearInterval(timerId);
  }, [editVoiceRecordingStartedAt]);

  const toggleLike = (id: string) => {
    setLikedById((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleComments = (id: string) => {
    setCommentOpenById((current) => ({ ...current, [id]: !current[id] }));
  };

  const changeCommentDraft = (id: string, value: string) => {
    setCommentDraftById((current) => ({ ...current, [id]: value }));
  };

  const submitComment = (id: string) => {
    const body = commentDraftById[id]?.trim();

    if (!body) {
      return;
    }

    setAddedCommentsById((current) => ({
      ...current,
      [id]: [
        ...(current[id] ?? []),
        {
          id: `comment-${id}-${Date.now()}`,
          authorName: '나',
          date: '오늘',
          body,
        },
      ],
    }));
    setCommentDraftById((current) => ({ ...current, [id]: '' }));
    setCommentOpenById((current) => ({ ...current, [id]: true }));
  };

  const startEditComment = (comment: MemoryComment) => {
    setEditingCommentId(comment.id);
    setCommentEditDraft(comment.body);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setCommentEditDraft('');
  };

  const discardActiveEditVoiceRecording = () => {
    if (!editVoiceRecorder.isRecording) {
      return;
    }

    void editVoiceRecorder.stop().catch(() => undefined);
    void setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    }).catch(() => undefined);
  };

  const saveEditComment = (commentId: string) => {
    const nextBody = commentEditDraft.trim();

    if (!nextBody) {
      Alert.alert('댓글 내용을 입력해주세요');
      return;
    }

    setEditedCommentBodyById((current) => ({ ...current, [commentId]: nextBody }));
    cancelEditComment();
  };

  const deleteComment = (commentId: string) => {
    setRemovedCommentIds((current) => ({ ...current, [commentId]: true }));

    if (editingCommentId === commentId) {
      cancelEditComment();
    }
  };

  const startEdit = (item: MemoryFeedItem) => {
    discardActiveEditVoiceRecording();
    setEditingMemoryId(item.id);
    setEditDraft(item.body);
    setEditPhotoDraft({
      hasPhoto: item.hasPhoto,
      photoUri: item.photoUri,
      photoUris: item.photoUris,
    });
    setEditVoiceDraft({
      hasVoiceMemo: item.hasVoiceMemo,
      voiceDurationSeconds: item.voiceDurationSeconds,
      voiceUri: item.voiceUri,
      voiceSegments: item.voiceSegments,
    });
    setEditVoiceRecordingStartedAt(null);
    editVoiceRecordingStartedAtRef.current = null;
  };

  const cancelEdit = () => {
    discardActiveEditVoiceRecording();
    setEditingMemoryId(null);
    setEditDraft('');
    setEditPhotoDraft({ hasPhoto: false, photoUri: null, photoUris: [] });
    setEditVoiceDraft({
      hasVoiceMemo: false,
      voiceDurationSeconds: 0,
      voiceUri: null,
      voiceSegments: [],
    });
    setEditVoiceRecordingStartedAt(null);
    editVoiceRecordingStartedAtRef.current = null;
  };

  const pickEditPhoto = async (photoIndex?: number) => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('권한이 필요해요', '사진을 선택하려면 갤러리 접근 권한을 허용해주세요.');
        return;
      }

      const currentPhotoUris = editPhotoDraft.photoUris.length > 0
        ? editPhotoDraft.photoUris
        : editPhotoDraft.photoUri
          ? [editPhotoDraft.photoUri]
          : [];
      const remainingPhotoCount = Math.max(1, 2 - currentPhotoUris.length);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: photoIndex === undefined,
        selectionLimit: photoIndex === undefined ? remainingPhotoCount : 1,
        quality: 0.9,
      });

      if (!result.canceled) {
        const nextPhotoUris = result.assets
          .map((asset) => asset.uri)
          .filter(Boolean)
          .slice(0, 2);

        if (photoIndex === undefined) {
          const normalizedPhotoUris = [...currentPhotoUris, ...nextPhotoUris].slice(0, 2);

          setEditPhotoDraft({
            hasPhoto: normalizedPhotoUris.length > 0,
            photoUri: normalizedPhotoUris[0] ?? null,
            photoUris: normalizedPhotoUris,
          });
          return;
        }

        const selectedPhotoUri = nextPhotoUris[0];

        if (!selectedPhotoUri) {
          return;
        }

        setEditPhotoDraft((current) => {
          const currentPhotoUris = current.photoUris.length > 0
            ? current.photoUris
            : current.photoUri
              ? [current.photoUri]
              : [];
          const nextPhotoUriList = [...currentPhotoUris];

          nextPhotoUriList[photoIndex] = selectedPhotoUri;

          const normalizedPhotoUris = nextPhotoUriList.filter(Boolean).slice(0, 2);

          return {
            hasPhoto: normalizedPhotoUris.length > 0,
            photoUri: normalizedPhotoUris[0] ?? null,
            photoUris: normalizedPhotoUris,
          };
        });
      }
    } catch {
      Alert.alert('사진을 불러오지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  const removeEditPhoto = (photoIndex?: number) => {
    if (photoIndex === undefined) {
      setEditPhotoDraft({ hasPhoto: false, photoUri: null, photoUris: [] });
      return;
    }

    setEditPhotoDraft((current) => {
      const currentPhotoUris = current.photoUris.length > 0
        ? current.photoUris
        : current.photoUri
          ? [current.photoUri]
          : [];
      const normalizedPhotoUris = currentPhotoUris
        .filter((_, index) => index !== photoIndex)
        .slice(0, 2);

      return {
        hasPhoto: normalizedPhotoUris.length > 0,
        photoUri: normalizedPhotoUris[0] ?? null,
        photoUris: normalizedPhotoUris,
      };
    });
  };

  const ensureEditRecordingPermission = async () => {
    const permission = await requestRecordingPermissionsAsync();

    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '음성 메모를 녹음하려면 마이크 권한을 허용해주세요.');
      return false;
    }

    return true;
  };

  const startEditVoiceRecording = async () => {
    const hasPermission = await ensureEditRecordingPermission();

    if (!hasPermission) {
      return;
    }

    await setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await editVoiceRecorder.prepareToRecordAsync(VOICE_RECORDING_OPTIONS);
    editVoiceRecorder.record();

    const startedAt = Date.now();

    editVoiceRecordingStartedAtRef.current = startedAt;
    setEditVoiceDraft({
      hasVoiceMemo: true,
      voiceDurationSeconds: 0,
      voiceUri: null,
      voiceSegments: [],
    });
    setEditVoiceRecordingStartedAt(startedAt);
  };

  const stopEditVoiceRecording = async () => {
    const segmentStartedAt = editVoiceRecordingStartedAtRef.current ?? Date.now();

    await editVoiceRecorder.stop();

    const recordedUri = editVoiceRecorder.uri;
    const segmentDurationSeconds = Math.max(
      1,
      editVoiceRecorder.currentTime,
      (Date.now() - segmentStartedAt) / 1000,
    );

    if (!recordedUri) {
      throw new Error('Recording URI is empty.');
    }

    const nextSegment = {
      uri: recordedUri,
      durationSeconds: segmentDurationSeconds,
    };

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    setEditVoiceDraft({
      hasVoiceMemo: true,
      voiceDurationSeconds: Math.max(1, Math.round(segmentDurationSeconds)),
      voiceUri: recordedUri,
      voiceSegments: [nextSegment],
    });
    setEditVoiceRecordingStartedAt(null);
    editVoiceRecordingStartedAtRef.current = null;
  };

  const toggleEditVoiceRecording = async () => {
    if (editVoiceRecordingStartedAt !== null) {
      try {
        await stopEditVoiceRecording();
      } catch {
        Alert.alert('녹음을 저장하지 못했어요', '잠시 후 다시 시도해주세요.');
      }
      return;
    }

    try {
      await startEditVoiceRecording();
    } catch {
      Alert.alert('녹음을 시작하지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  const removeEditVoice = () => {
    discardActiveEditVoiceRecording();
    setEditVoiceRecordingStartedAt(null);
    editVoiceRecordingStartedAtRef.current = null;
    setEditVoiceDraft({
      hasVoiceMemo: false,
      voiceDurationSeconds: 0,
      voiceUri: null,
      voiceSegments: [],
    });
  };

  const saveEdit = async (item: MemoryFeedItem) => {
    if (!group?.groupId) return;

    const nextBody = editDraft.trim();
    const nextVoiceDraft = {
      hasVoiceMemo: editVoiceDraft.hasVoiceMemo,
      voiceDurationSeconds: editVoiceDraft.hasVoiceMemo
        ? Math.max(1, Math.round(editVoiceDraft.voiceDurationSeconds))
        : 0,
      voiceUri: editVoiceDraft.hasVoiceMemo ? editVoiceDraft.voiceUri : null,
      voiceSegments: editVoiceDraft.hasVoiceMemo ? editVoiceDraft.voiceSegments : [],
    };

    if (!nextBody && !editPhotoDraft.hasPhoto && !nextVoiceDraft.hasVoiceMemo) {
      Alert.alert('추억 내용을 입력해주세요');
      return;
    }

    try {
      await updateFamilyMemoryItem(
        group.groupId,
        item.id,
        group.members?.[0]?.memberId || 'unknown',
        '나',
        group.members?.[0]?.relation || '친구',
        {
          memo: nextBody,
          hasPhoto: editPhotoDraft.hasPhoto,
          photoUri: editPhotoDraft.photoUri,
          photoUris: editPhotoDraft.photoUris,
          hasVoiceMemo: nextVoiceDraft.hasVoiceMemo,
          voiceDurationSeconds: nextVoiceDraft.voiceDurationSeconds,
          voiceUri: nextVoiceDraft.voiceUri,
          voiceSegments: nextVoiceDraft.voiceSegments,
        }
      );
      setEditedBodyById((current) => ({ ...current, [item.id]: nextBody }));
      setEditedPhotoById((current) => ({ ...current, [item.id]: editPhotoDraft }));
      setEditedVoiceById((current) => ({ ...current, [item.id]: nextVoiceDraft }));
      cancelEdit();
    } catch (error) {
      Alert.alert('수정 실패', '추억을 수정하지 못했어요. 다시 시도해주세요.');
    }
  };

  const deleteMemory = async (id: string) => {
    if (!group?.groupId) return;
    try {
      await removeFamilyMemoryItem(group.groupId, id);
      setRemovedMemoryIds((current) => ({ ...current, [id]: true }));
    } catch (error) {
      Alert.alert('삭제 실패', '추억을 삭제하지 못했어요. 다시 시도해주세요.');
    }
    setLikedById((current) => {
      const { [id]: _deletedLike, ...next } = current;
      return next;
    });
    setCommentOpenById((current) => {
      const { [id]: _deletedOpen, ...next } = current;
      return next;
    });
    setCommentDraftById((current) => {
      const { [id]: _deletedDraft, ...next } = current;
      return next;
    });
    setAddedCommentsById((current) => {
      const { [id]: _deletedComments, ...next } = current;
      return next;
    });
    setRemovedCommentIds((current) => {
      const next = { ...current };
      visibleItems.find((item) => item.id === id)?.comments.forEach((comment) => {
        delete next[comment.id];
      });
      return next;
    });
    if (editingMemoryId === id) {
      cancelEdit();
    }
  };

  if (isLoadingFeed) {
    return (
      <View style={[styles.scroll, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.feedContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>가족 추억</Text>
      {visibleItems.length === 0 ? (
        <EmptyMemoryState />
      ) : (
        visibleItems.map((item) => (
          <MemoryCard
            key={item.id}
            item={item}
            liked={likedById[item.id] ?? item.liked}
            commentsOpen={commentOpenById[item.id] ?? false}
            addedComments={addedCommentsById[item.id] ?? []}
            commentDraft={commentDraftById[item.id] ?? ''}
            isEditing={editingMemoryId === item.id}
            editDraft={editingMemoryId === item.id ? editDraft : ''}
            editPhotoDraft={editingMemoryId === item.id ? editPhotoDraft : {
              hasPhoto: item.hasPhoto,
              photoUri: item.photoUri,
              photoUris: item.photoUris,
            }}
            editVoiceDraft={editingMemoryId === item.id ? editVoiceDraft : {
              hasVoiceMemo: item.hasVoiceMemo,
              voiceDurationSeconds: item.voiceDurationSeconds,
              voiceUri: item.voiceUri,
              voiceSegments: item.voiceSegments,
            }}
            isEditVoiceRecording={editingMemoryId === item.id && editVoiceRecordingStartedAt !== null}
            editingCommentId={editingCommentId}
            commentEditDraft={commentEditDraft}
            editedCommentBodyById={editedCommentBodyById}
            removedCommentIds={removedCommentIds}
            onToggleLike={() => toggleLike(item.id)}
            onToggleComments={() => toggleComments(item.id)}
            onChangeCommentDraft={(value) => changeCommentDraft(item.id, value)}
            onSubmitComment={() => submitComment(item.id)}
            onStartEdit={() => startEdit(item)}
            onChangeEditDraft={setEditDraft}
            onPickEditPhoto={pickEditPhoto}
            onRemoveEditPhoto={removeEditPhoto}
            onToggleEditVoiceRecording={toggleEditVoiceRecording}
            onRemoveEditVoice={removeEditVoice}
            onSaveEdit={() => saveEdit(item)}
            onCancelEdit={cancelEdit}
            onStartEditComment={startEditComment}
            onChangeCommentEditDraft={setCommentEditDraft}
            onSaveEditComment={saveEditComment}
            onCancelEditComment={cancelEditComment}
            onDeleteComment={deleteComment}
            onDeleteMemory={() => deleteMemory(item.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

function EmptyMemoryState() {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Picture size={64} color={ORANGE_LIGHT} />
      </View>
      <Text style={styles.emptyTitle}>아직 등록된 사진이 없어요</Text>
      <Text style={styles.emptyDescription}>어르신께 추억을 전달드려보세요!</Text>
    </View>
  );
}

function MemoryCard({
  item,
  liked,
  commentsOpen,
  addedComments,
  commentDraft,
  isEditing,
  editDraft,
  editPhotoDraft,
  editVoiceDraft,
  isEditVoiceRecording,
  editingCommentId,
  commentEditDraft,
  editedCommentBodyById,
  removedCommentIds,
  onToggleLike,
  onToggleComments,
  onChangeCommentDraft,
  onSubmitComment,
  onStartEdit,
  onChangeEditDraft,
  onPickEditPhoto,
  onRemoveEditPhoto,
  onToggleEditVoiceRecording,
  onRemoveEditVoice,
  onSaveEdit,
  onCancelEdit,
  onStartEditComment,
  onChangeCommentEditDraft,
  onSaveEditComment,
  onCancelEditComment,
  onDeleteComment,
  onDeleteMemory,
}: {
  item: MemoryFeedItem;
  liked: boolean;
  commentsOpen: boolean;
  addedComments: MemoryComment[];
  commentDraft: string;
  isEditing: boolean;
  editDraft: string;
  editPhotoDraft: MemoryPhotoDraft;
  editVoiceDraft: MemoryVoiceDraft;
  isEditVoiceRecording: boolean;
  editingCommentId: string | null;
  commentEditDraft: string;
  editedCommentBodyById: Record<string, string>;
  removedCommentIds: Record<string, boolean>;
  onToggleLike: () => void;
  onToggleComments: () => void;
  onChangeCommentDraft: (value: string) => void;
  onSubmitComment: () => void;
  onStartEdit: () => void;
  onChangeEditDraft: (value: string) => void;
  onPickEditPhoto: (photoIndex?: number) => void;
  onRemoveEditPhoto: (photoIndex?: number) => void;
  onToggleEditVoiceRecording: () => void;
  onRemoveEditVoice: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onStartEditComment: (comment: MemoryComment) => void;
  onChangeCommentEditDraft: (value: string) => void;
  onSaveEditComment: (commentId: string) => void;
  onCancelEditComment: () => void;
  onDeleteComment: (commentId: string) => void;
  onDeleteMemory: () => void;
}) {
  const actionMenuAnchorRef = useRef<View>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  const [actionMenuPosition, setActionMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });
  const likeCount = liked ? item.likeCount + 1 : item.likeCount;
  const displayedPhoto = isEditing
    ? editPhotoDraft
    : { hasPhoto: item.hasPhoto, photoUri: item.photoUri, photoUris: item.photoUris };
  const displayedVoice = isEditing
    ? editVoiceDraft
    : {
        hasVoiceMemo: item.hasVoiceMemo,
        voiceDurationSeconds: item.voiceDurationSeconds,
        voiceUri: item.voiceUri,
        voiceSegments: item.voiceSegments,
      };
  const displayedPhotoUris = displayedPhoto.photoUris;
  const photoSources = displayedPhotoUris.length > 0
    ? displayedPhotoUris.map((photoUri) => ({ uri: photoUri }))
    : displayedPhoto.photoUri
      ? [{ uri: displayedPhoto.photoUri }]
      : [];
  const visibleComments = [
    ...item.comments,
    ...addedComments,
  ]
    .filter((comment) => !removedCommentIds[comment.id])
    .map((comment) => ({
      ...comment,
      body: editedCommentBodyById[comment.id] ?? comment.body,
    }));
  const commentCount = visibleComments.length;
  const closeActionMenu = () => {
    setIsActionMenuOpen(false);
  };

  const toggleActionMenu = () => {
    if (isActionMenuOpen) {
      closeActionMenu();
      return;
    }

    actionMenuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setActionMenuPosition({
        top: y + height + 8,
        left: x + width - 104,
      });
      setIsActionMenuOpen(true);
    });
  };

  const handleEditInfo = () => {
    closeActionMenu();
    onStartEdit();
  };

  const handleDeleteMemory = () => {
    closeActionMenu();
    onDeleteMemory();
  };

  return (
    <View style={styles.memoryCard}>
      <View style={styles.cardHeader}>
        <View style={styles.author}>
          <Avatar />
          <Text style={styles.authorName}>{item.authorName}</Text>
        </View>
        <View style={styles.cardActions}>
          <Text style={styles.timeText}>{item.timeText}</Text>
          <View ref={actionMenuAnchorRef} collapsable={false}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="추억 정보 수정"
              hitSlop={10}
              style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}
              onPress={toggleActionMenu}
            >
              <MoreVertical size={22} color={LINE_NORMAL} />
            </Pressable>
          </View>
        </View>
      </View>

      {isEditing ? (
        <View style={styles.editBox}>
          <TextInput
            accessibilityLabel="추억 내용 수정"
            multiline
            value={editDraft}
            onChangeText={onChangeEditDraft}
            placeholder="가족과 나누고 싶은 추억을 적어주세요"
            placeholderTextColor={LINE_NORMAL}
            style={styles.editInput}
            textAlignVertical="top"
          />
        </View>
      ) : (
        item.body.length > 0 && <Text style={styles.bodyText}>{item.body}</Text>
      )}

      {isEditing ? (
        <EditVoiceMemo
          voiceDraft={displayedVoice}
          isRecording={isEditVoiceRecording}
          onToggleRecording={onToggleEditVoiceRecording}
          onRemoveVoice={onRemoveEditVoice}
        />
      ) : displayedVoice.hasVoiceMemo && (
        <VoiceMemoPlayer
          durationSeconds={displayedVoice.voiceDurationSeconds}
          voiceUri={displayedVoice.voiceUri}
          voiceSegments={displayedVoice.voiceSegments}
        />
      )}

      {isEditing ? (
        <View style={styles.editPhotoSection}>
          <View style={styles.editPhotoRow}>
            {photoSources.length < 2 && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="추억 사진 추가"
                style={({ pressed }) => [styles.editPhotoUpload, pressed && styles.pressed]}
                onPress={() => onPickEditPhoto()}
              >
                <Picture size={28} color={LINE_NORMAL} />
                <Text style={styles.editPhotoUploadText}>이미지를 업로드하세요</Text>
                <Text style={styles.editPhotoUploadCountText}>{photoSources.length}/2</Text>
              </Pressable>
            )}
            {photoSources.map((source, index) => (
              <View key={`${source.uri}-${index}`} style={styles.editPhotoFrame}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${index + 1}번 추억 사진 변경`}
                  style={({ pressed }) => [styles.editPhotoTile, pressed && styles.pressed]}
                  onPress={() => onPickEditPhoto(index)}
                >
                  <Image source={source} style={styles.editPhotoImage} contentFit="cover" />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${index + 1}번 추억 사진 삭제`}
                  hitSlop={6}
                  style={styles.editPhotoRemoveButton}
                  onPress={() => onRemoveEditPhoto(index)}
                >
                  <Close size={14} color={TEXT_ASSISTIVE} />
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : (
        photoSources.length > 0 && <PhotoGrid sources={photoSources} />
      )}

      {isEditing && (
        <View style={styles.editActionRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추억 수정 취소"
            style={({ pressed }) => [styles.editCancelButton, pressed && styles.pressed]}
            onPress={onCancelEdit}
          >
            <Text style={styles.editCancelButtonText}>취소</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추억 수정 저장"
            style={({ pressed }) => [styles.editSaveButton, pressed && styles.pressed]}
            onPress={onSaveEdit}
          >
            <Text style={styles.editSaveButtonText}>저장</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.reactionRow}>
        <Reaction
          icon="heart"
          label="좋아요"
          count={likeCount}
          active={liked}
          onPress={onToggleLike}
        />
        <Reaction
          icon="comment"
          label="댓글"
          count={commentCount}
          active={commentsOpen}
          onPress={onToggleComments}
        />
      </View>

      {commentsOpen && (
        <>
          <View style={styles.divider} />
          <Text style={styles.commentTitle}>
            {commentCount > 0 ? `${commentCount}개의 댓글` : '아직 댓글이 없어요'}
          </Text>
          {visibleComments.length > 0 && (
            <ScrollView
              nestedScrollEnabled
              style={styles.commentList}
              contentContainerStyle={styles.commentListContent}
              showsVerticalScrollIndicator
            >
              {visibleComments.map((comment) => (
                <View key={comment.id} style={styles.commentBlock}>
                  <View style={styles.commentHeader}>
                    <View style={styles.author}>
                      <Avatar />
                      <View>
                        <Text style={styles.authorName}>{comment.authorName}</Text>
                        <Text style={styles.commentDate}>{comment.date}</Text>
                      </View>
                    </View>
                    <CommentActionMenu
                      onEdit={() => onStartEditComment(comment)}
                      onDelete={() => onDeleteComment(comment.id)}
                    />
                  </View>
                  {editingCommentId === comment.id ? (
                    <View style={styles.commentEditBox}>
                      <TextInput
                        accessibilityLabel="댓글 내용 수정"
                        multiline
                        value={commentEditDraft}
                        onChangeText={onChangeCommentEditDraft}
                        placeholder="댓글을 작성해 보세요."
                        placeholderTextColor={LINE_NORMAL}
                        style={styles.commentEditInput}
                        textAlignVertical="top"
                      />
                      <View style={styles.editActionRow}>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="댓글 수정 취소"
                          style={({ pressed }) => [styles.editCancelButton, pressed && styles.pressed]}
                          onPress={onCancelEditComment}
                        >
                          <Text style={styles.editCancelButtonText}>취소</Text>
                        </Pressable>
                        <Pressable
                          accessibilityRole="button"
                          accessibilityLabel="댓글 수정 저장"
                          style={({ pressed }) => [styles.editSaveButton, pressed && styles.pressed]}
                          onPress={() => onSaveEditComment(comment.id)}
                        >
                          <Text style={styles.editSaveButtonText}>저장</Text>
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.bodyText}>{comment.body}</Text>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
          <View style={styles.commentInput}>
            <TextInput
              accessibilityLabel="댓글 입력"
              value={commentDraft}
              onChangeText={onChangeCommentDraft}
              onSubmitEditing={onSubmitComment}
              placeholder="댓글을 작성해 보세요."
              placeholderTextColor={LINE_NORMAL}
              returnKeyType="send"
              style={styles.commentTextInput}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="댓글 등록"
              hitSlop={8}
              style={({ pressed }) => [styles.commentSendButton, pressed && styles.pressed]}
              onPress={onSubmitComment}
            >
              <Sent size={22} color={ORANGE} />
            </Pressable>
          </View>
        </>
      )}
      <Modal transparent visible={isActionMenuOpen} animationType="none" onRequestClose={closeActionMenu}>
        <View style={styles.actionMenuLayer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추억 메뉴 닫기"
            style={styles.actionMenuBackdrop}
            onPress={closeActionMenu}
          />
          <View style={[styles.actionMenu, actionMenuPosition]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="추억 수정"
              style={({ hovered, pressed }) => [
                styles.actionMenuItem,
                styles.actionMenuEditItem,
                hovered && styles.actionMenuHoveredItem,
                pressed && styles.pressed,
              ]}
              onPress={handleEditInfo}
            >
              <Text style={styles.actionMenuText}>수정</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="추억 삭제"
              style={({ hovered, pressed }) => [
                styles.actionMenuItem,
                hovered && styles.actionMenuHoveredItem,
                pressed && styles.pressed,
              ]}
              onPress={handleDeleteMemory}
            >
              <Text style={styles.actionMenuText}>삭제</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function VoiceMemoPlayer({
  durationSeconds,
  voiceUri,
  voiceSegments,
}: {
  durationSeconds: number;
  voiceUri?: string | null;
  voiceSegments?: VoiceMemoSegment[];
}) {
  const playableSegments = getPlayableVoiceSegments({
    voiceSegments,
    voiceUri,
    voiceDurationSeconds: durationSeconds,
  });

  if (playableSegments.length === 0) {
    return <SimulatedVoiceMemoPlayer durationSeconds={durationSeconds} />;
  }

  return (
    <RealVoiceMemoPlayer
      durationSeconds={durationSeconds}
      voiceSegments={playableSegments}
    />
  );
}

function RealVoiceMemoPlayer({
  durationSeconds,
  voiceSegments,
}: {
  durationSeconds: number;
  voiceSegments: VoiceMemoSegment[];
}) {
  const pauseRequestedRef = useRef(false);
  const wasPlayingRef = useRef(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const playlist = useAudioPlaylist({
    sources: voiceSegments.map((segment) => ({ uri: segment.uri })),
    updateInterval: 100,
  });
  const status = useAudioPlaylistStatus(playlist);
  const duration = Math.max(1, Math.round(
    getVoiceSegmentsDuration(voiceSegments) || durationSeconds,
  ));
  const elapsedSeconds = Math.min(
    duration,
    getVoiceSegmentOffset(voiceSegments, status.currentIndex) + status.currentTime,
  );
  const displayedElapsedSeconds = hasCompleted ? duration : elapsedSeconds;
  const progressPercent = `${Math.min(100, (displayedElapsedSeconds / duration) * 100)}%` as `${number}%`;

  useEffect(() => () => {
    playlist.pause();
  }, [playlist]);

  useEffect(() => {
    let nextHasCompleted: boolean | null = null;

    if (wasPlayingRef.current && !status.playing) {
      if (pauseRequestedRef.current) {
        pauseRequestedRef.current = false;
      } else {
        nextHasCompleted = true;
      }
    }

    if (status.playing && hasCompleted) {
      nextHasCompleted = false;
    }

    wasPlayingRef.current = status.playing;

    if (nextHasCompleted !== null) {
      void Promise.resolve().then(() => {
        setHasCompleted(nextHasCompleted);
      });
    }
  }, [hasCompleted, status.playing]);

  const togglePlayback = async () => {
    if (status.playing) {
      pauseRequestedRef.current = true;
      playlist.pause();
      return;
    }

    await setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    });

    if (hasCompleted || elapsedSeconds >= duration) {
      setHasCompleted(false);
      playlist.skipTo(0);
      await playlist.seekTo(0);
    }

    playlist.play();
  };

  return (
    <View style={styles.voiceMemoPlayer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={status.playing ? '음성 메모 일시정지' : '음성 메모 재생'}
        style={({ pressed }) => [styles.voicePlayButton, pressed && styles.pressed]}
        onPress={togglePlayback}
      >
        {status.playing ? (
          <View style={styles.pauseIcon}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>
        ) : (
          <View style={styles.playIcon} />
        )}
      </Pressable>
      <View style={styles.voiceProgressTrack}>
        <View style={[styles.voiceProgressFill, { width: progressPercent }]} />
      </View>
      <Text style={styles.voiceDurationText}>
        {formatVoiceDuration(status.playing ? Math.max(0, duration - elapsedSeconds) : duration)}
      </Text>
    </View>
  );
}

function SimulatedVoiceMemoPlayer({
  durationSeconds,
}: {
  durationSeconds: number;
}) {
  const duration = Math.max(1, Math.round(durationSeconds));
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const progressPercent = `${Math.min(100, (elapsedSeconds / duration) * 100)}%` as `${number}%`;

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setElapsedSeconds((current) => {
        const next = current + 0.1;

        if (next >= duration) {
          setIsPlaying(false);
          return duration;
        }

        return next;
      });
    }, 100);

    return () => clearInterval(timerId);
  }, [duration, isPlaying]);

  const togglePlayback = () => {
    if (elapsedSeconds >= duration) {
      setElapsedSeconds(0);
    }

    setIsPlaying((current) => !current);
  };

  return (
    <View style={styles.voiceMemoPlayer}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isPlaying ? '음성 메모 일시정지' : '음성 메모 재생'}
        style={({ pressed }) => [styles.voicePlayButton, pressed && styles.pressed]}
        onPress={togglePlayback}
      >
        {isPlaying ? (
          <View style={styles.pauseIcon}>
            <View style={styles.pauseBar} />
            <View style={styles.pauseBar} />
          </View>
        ) : (
          <View style={styles.playIcon} />
        )}
      </Pressable>
      <View style={styles.voiceProgressTrack}>
        <View style={[styles.voiceProgressFill, { width: progressPercent }]} />
      </View>
      <Text style={styles.voiceDurationText}>
        {formatVoiceDuration(isPlaying ? Math.max(0, duration - elapsedSeconds) : duration)}
      </Text>
    </View>
  );
}

function EditVoiceMemo({
  voiceDraft,
  isRecording,
  onToggleRecording,
  onRemoveVoice,
}: {
  voiceDraft: MemoryVoiceDraft;
  isRecording: boolean;
  onToggleRecording: () => void;
  onRemoveVoice: () => void;
}) {
  const hasVoiceMemo = voiceDraft.hasVoiceMemo && voiceDraft.voiceDurationSeconds > 0;

  return (
    <View style={styles.editVoiceSection}>
      <View style={styles.editVoiceContent}>
        {isRecording ? (
          <View style={styles.editVoiceRecordingBox}>
            <View style={styles.editVoiceRecordingDot} />
            <Text style={styles.editVoiceRecordingText}>
              {formatVoiceDuration(voiceDraft.voiceDurationSeconds)}
            </Text>
          </View>
        ) : hasVoiceMemo ? (
          <VoiceMemoPlayer
            durationSeconds={voiceDraft.voiceDurationSeconds}
            voiceUri={voiceDraft.voiceUri}
            voiceSegments={voiceDraft.voiceSegments}
          />
        ) : (
          <View style={styles.editVoiceEmptyBox}>
            <Text style={styles.editVoiceEmptyText}>녹음을 추가하세요</Text>
          </View>
        )}
      </View>
      <View style={styles.editVoiceActionRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isRecording ? '음성 녹음 정지' : hasVoiceMemo ? '음성 다시 녹음' : '음성 녹음 추가'}
          style={({ pressed }) => [styles.editVoicePrimaryButton, pressed && styles.pressed]}
          onPress={onToggleRecording}
        >
          <Text style={styles.editVoicePrimaryButtonText}>
            {isRecording ? '정지' : hasVoiceMemo ? '재녹음' : '녹음'}
          </Text>
        </Pressable>
        {(hasVoiceMemo || isRecording) && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="음성 녹음 삭제"
            style={({ pressed }) => [styles.editVoiceSecondaryButton, pressed && styles.pressed]}
            onPress={onRemoveVoice}
          >
            <Text style={styles.editVoiceSecondaryButtonText}>삭제</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function PhotoGrid({
  sources,
}: {
  sources: { uri: string }[];
}) {
  return (
    <View style={styles.photoGrid}>
      {sources.map((source, index) => (
        <Image
          key={`${source.uri}-${index}`}
          source={source}
          style={styles.feedPhoto}
          contentFit="cover"
        />
      ))}
    </View>
  );
}

function CommentActionMenu({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  const menuAnchorRef = useRef<View>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ top: 0, left: 0 });

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    if (isMenuOpen) {
      closeMenu();
      return;
    }

    menuAnchorRef.current?.measureInWindow((x, y, width, height) => {
      setMenuPosition({
        top: y + height + 8,
        left: x + width - 104,
      });
      setIsMenuOpen(true);
    });
  };

  const handleEdit = () => {
    closeMenu();
    onEdit();
  };

  const handleDelete = () => {
    closeMenu();
    onDelete();
  };

  return (
    <View ref={menuAnchorRef} collapsable={false}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="댓글 수정 및 삭제"
        hitSlop={8}
        style={({ pressed }) => [styles.commentMoreButton, pressed && styles.pressed]}
        onPress={toggleMenu}
      >
        <More size={24} color={LINE_NORMAL} />
      </Pressable>
      <Modal transparent visible={isMenuOpen} animationType="none" onRequestClose={closeMenu}>
        <View style={styles.actionMenuLayer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="댓글 메뉴 닫기"
            style={styles.actionMenuBackdrop}
            onPress={closeMenu}
          />
          <View style={[styles.actionMenu, menuPosition]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="댓글 수정"
              style={({ hovered, pressed }) => [
                styles.actionMenuItem,
                styles.actionMenuEditItem,
                hovered && styles.actionMenuHoveredItem,
                pressed && styles.pressed,
              ]}
              onPress={handleEdit}
            >
              <Text style={styles.actionMenuText}>수정</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="댓글 삭제"
              style={({ hovered, pressed }) => [
                styles.actionMenuItem,
                hovered && styles.actionMenuHoveredItem,
                pressed && styles.pressed,
              ]}
              onPress={handleDelete}
            >
              <Text style={styles.actionMenuText}>삭제</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Avatar() {
  return (
    <View style={styles.avatar}>
      <View style={styles.avatarHead} />
      <View style={styles.avatarBody} />
    </View>
  );
}

function Reaction({
  icon,
  label,
  count,
  active = false,
  onPress,
}: {
  icon: 'heart' | 'comment';
  label: string;
  count: number;
  active?: boolean;
  onPress: () => void;
}) {
  const color = icon === 'heart' && active ? '#f90606' : active ? ORANGE : LINE;
  const IconComponent = icon === 'heart' ? (active ? HeartFilled : HeartOutline) : Comment;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${active ? '끄기' : '켜기'}`}
      hitSlop={8}
      style={({ pressed }) => [styles.reaction, pressed && styles.pressed]}
      onPress={onPress}
    >
      <IconComponent size={icon === 'heart' ? 24 : 23} color={color} />
      <Text style={styles.reactionText}>{label}</Text>
      <Text style={styles.reactionText}>{count}</Text>
    </Pressable>
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
    position: 'relative',
    zIndex: 20,
  },
  header: {
    paddingHorizontal: 10,
    marginBottom: 26,
  },
  scroll: {
    flex: 1,
  },
  feedContent: {
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingTop: 0,
    paddingBottom: 28,
    gap: 12,
  },
  emptyState: {
    width: '100%',
    maxWidth: 348,
    alignItems: 'center',
    marginTop: 206,
  },
  emptyIconBox: {
    width: 78,
    height: 78,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
  },
  emptyTitle: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '600',
    letterSpacing: -0.48,
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyDescription: {
    color: TEXT_ASSISTIVE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    letterSpacing: -0.32,
    textAlign: 'center',
  },
  title: {
    width: '100%',
    maxWidth: 348,
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
    letterSpacing: -0.48,
  },
  memoryCard: {
    width: '100%',
    maxWidth: 348,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  moreButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionMenuLayer: {
    flex: 1,
  },
  actionMenuBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'transparent',
  },
  actionMenu: {
    position: 'absolute',
    width: 123,
    height: 72,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
    overflow: 'hidden',
  },
  actionMenuItem: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  actionMenuEditItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  actionMenuHoveredItem: {
    backgroundColor: '#fff3f0',
  },
  actionMenuText: {
    color: ORANGE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
    letterSpacing: -0.36,
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  avatar: {
    width: 33,
    height: 33,
    borderRadius: 17,
    backgroundColor: '#ffd2c7',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarHead: {
    width: 13,
    height: 13,
    borderRadius: 7,
    marginTop: 5,
    backgroundColor: '#ff7c63',
  },
  avatarBody: {
    width: 24,
    height: 16,
    borderRadius: 12,
    marginTop: 1,
    backgroundColor: '#ff7c63',
  },
  authorName: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
    letterSpacing: -0.36,
  },
  timeText: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  bodyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    letterSpacing: -0.28,
  },
  editBox: {
    gap: 8,
  },
  editInput: {
    minHeight: 86,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: FILL,
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  editActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  editCancelButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#fed7cd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editSaveButton: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelButtonText: {
    color: ORANGE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  editSaveButtonText: {
    color: '#f5f5f5',
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  voiceMemoPlayer: {
    width: '100%',
    height: 32,
    borderRadius: 8,
    paddingLeft: 15,
    paddingRight: 16,
    backgroundColor: FILL,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  voicePlayButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#dddedf',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: 0,
    height: 0,
    marginLeft: 2,
    borderTopWidth: 4.5,
    borderBottomWidth: 4.5,
    borderLeftWidth: 7,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: TEXT_ASSISTIVE,
  },
  pauseIcon: {
    flexDirection: 'row',
    gap: 2,
  },
  pauseBar: {
    width: 3,
    height: 9,
    borderRadius: 2,
    backgroundColor: TEXT_ASSISTIVE,
  },
  voiceProgressTrack: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#dddedf',
    overflow: 'hidden',
  },
  voiceProgressFill: {
    height: 2,
    borderRadius: 1,
    backgroundColor: ORANGE,
  },
  voiceDurationText: {
    width: 30,
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
    textAlign: 'right',
  },
  editVoiceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editVoiceContent: {
    flex: 1,
    minWidth: 0,
  },
  editVoiceRecordingBox: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff3f0',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editVoiceRecordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: ORANGE,
  },
  editVoiceRecordingText: {
    color: ORANGE,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
    letterSpacing: -0.26,
  },
  editVoiceEmptyBox: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: FILL,
    justifyContent: 'center',
  },
  editVoiceEmptyText: {
    color: LINE_NORMAL,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500',
    letterSpacing: -0.26,
  },
  editVoiceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editVoicePrimaryButton: {
    height: 28,
    minWidth: 56,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: TEXT_ASSISTIVE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editVoiceSecondaryButton: {
    height: 28,
    minWidth: 48,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: '#e8e8e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editVoicePrimaryButtonText: {
    color: '#f5f5f5',
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  editVoiceSecondaryButtonText: {
    color: TEXT_MUTED,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600',
  },
  photoGrid: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  feedPhoto: {
    flex: 1,
    height: 123,
    borderRadius: 10,
    backgroundColor: FILL,
  },
  editPhotoSection: {
    width: '100%',
  },
  editPhotoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editPhotoFrame: {
    position: 'relative',
    flex: 1,
    minWidth: 0,
    height: 123,
  },
  editPhotoTile: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  editPhotoImage: {
    width: '100%',
    height: '100%',
  },
  editPhotoRemoveButton: {
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
  editPhotoUpload: {
    flex: 1,
    minWidth: 0,
    height: 123,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f5f5f5',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editPhotoUploadText: {
    color: LINE_NORMAL,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  editPhotoUploadCountText: {
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  reaction: {
    minHeight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reactionText: {
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: -0.24,
  },
  divider: {
    height: 1.5,
    backgroundColor: FILL,
  },
  commentTitle: {
    color: TEXT,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentMoreButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentBlock: {
    gap: 8,
  },
  commentEditBox: {
    gap: 8,
  },
  commentEditInput: {
    minHeight: 58,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 9,
    paddingBottom: 9,
    backgroundColor: FILL,
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  commentList: {
    maxHeight: 168,
  },
  commentListContent: {
    gap: 14,
    paddingRight: 4,
  },
  commentDate: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  commentInput: {
    height: 36,
    borderRadius: 20,
    paddingHorizontal: 18,
    backgroundColor: FILL,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentTextInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    padding: 0,
  },
  commentSendButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    bottom: 135,
  },
  pressed: {
    opacity: 0.72,
  },
});
