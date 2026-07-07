import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { HaemiIcon } from '@/components/haemi-icons';
import {
  createFamilyMemoryPost,
  getFamilyMemoryFeed,
  toggleFamilyMemoryLike,
} from '@/shared/api/family-memories';
import type { FamilyMemoryPhotoUpload, FamilyMemoryPost } from '@/shared/types/family-memories';

type MemoryMode = 'feed' | 'compose' | 'composeAlbum';

const PHOTO_URL = 'https://www.figma.com/api/mcp/asset/2722f17b-68ff-447f-b601-5b19f87fa5be';
const LOGO_URL = 'https://www.figma.com/api/mcp/asset/5300de0b-0352-4b87-afed-9e109f965b6e';

const ORANGE = '#fd6941';
const ORANGE_SOFT = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE = '#dadbdc';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';
const MAX_SELECTED_PHOTOS = 3;

const FALLBACK_ALBUM_ID = '00000000-0000-0000-0000-000000000000';
const DEFAULT_MEMBER_NAME = '가족';
const DEFAULT_RELATION = '딸';

const fallbackFeedItems: FamilyMemoryPost[] = [
  {
    postId: 'first',
    authorName: '딸',
    authorRelation: '딸',
    textContent: '엄마와 함께 첫 벚꽃 구경 갔던 날이에요.\n정말 예뻤던 기억이 나요.',
    likeCount: 12,
    createdAt: new Date().toISOString(),
  },
  {
    postId: 'second',
    authorName: '딸',
    authorRelation: '딸',
    textContent: '아버지가 좋아하시던 음식을 함께 먹었던 날이에요.',
    likeCount: 11,
    createdAt: new Date().toISOString(),
  },
];

export default function FamilyMemoriesScreen() {
  const [mode, setMode] = useState<MemoryMode>('feed');
  const [selectedPhotos, setSelectedPhotos] = useState<FamilyMemoryPhotoUpload[]>([]);
  const [memo, setMemo] = useState('가족끼리 나들이에 갔던 날이에요');
  const [feedPosts, setFeedPosts] = useState<FamilyMemoryPost[]>([]);
  const [likedById, setLikedById] = useState<Record<string, boolean>>({});
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const screenWidth = Math.min(width, 393);

  const albumId = process.env.EXPO_PUBLIC_HAEMI_ALBUM_ID || FALLBACK_ALBUM_ID;
  const [currentMember] = useState(getCurrentFamilyMember);
  const canPost = selectedPhotos.length > 0 || memo.trim().length > 0;
  const isCompose = mode === 'compose' || mode === 'composeAlbum';

  const refreshFeed = useCallback(async () => {
    setIsFeedLoading(true);
    setFeedError(null);
    try {
      const feed = await getFamilyMemoryFeed({ albumId, sortBy: 'LATEST', period: 'ALL' });
      setFeedPosts(feed.posts);
    } catch (error) {
      setFeedError(error instanceof Error ? error.message : '피드를 불러오지 못했습니다.');
      setFeedPosts((current) => (current.length > 0 ? current : fallbackFeedItems));
    } finally {
      setIsFeedLoading(false);
    }
  }, [albumId]);

  useEffect(() => {
    const timeoutId = setTimeout(refreshFeed, 0);
    return () => clearTimeout(timeoutId);
  }, [refreshFeed]);

  const handlePickPhotos = async () => {
    const remainingSlots = MAX_SELECTED_PHOTOS - selectedPhotos.length;

    if (remainingSlots <= 0) {
      Alert.alert('사진은 최대 3장까지 업로드할 수 있어요.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('권한이 필요해요', '사진을 선택하려면 갤러리 접근 권한을 허용해주세요.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.9,
    });

    if (result.canceled) {
      return;
    }

    const pickedPhotos = result.assets.map((asset, index) => ({
      uri: asset.uri,
      fileName: asset.fileName || `family-memory-${Date.now()}-${index + 1}.jpg`,
      mimeType: asset.mimeType || 'image/jpeg',
    }));

    setSelectedPhotos((current) => [...current, ...pickedPhotos].slice(0, MAX_SELECTED_PHOTOS));
  };

  const handlePost = async () => {
    if (!canPost) {
      Alert.alert('추억 내용을 입력해주세요');
      return;
    }

    setIsPosting(true);
    try {
      const createdPost = await createFamilyMemoryPost({
        albumId,
        data: {
          memberId: currentMember.memberId,
          memberName: currentMember.memberName,
          relation: currentMember.relation,
          textContent: memo.trim(),
          publishImmediately: true,
        },
        photos: selectedPhotos,
      });

      setFeedPosts((current) => [createdPost, ...current]);
      setSelectedPhotos([]);
      setMemo('');
      setMode('feed');
    } catch (error) {
      Alert.alert('게시 실패', error instanceof Error ? error.message : '추억글을 게시하지 못했습니다.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    setLikedById((current) => ({ ...current, [postId]: !current[postId] }));
    try {
      const updatedPost = await toggleFamilyMemoryLike(albumId, postId, currentMember.memberId);
      setFeedPosts((current) => current.map((post) => (post.postId === postId ? updatedPost : post)));
    } catch (error) {
      setLikedById((current) => ({ ...current, [postId]: !current[postId] }));
      Alert.alert('좋아요 실패', error instanceof Error ? error.message : '좋아요를 처리하지 못했습니다.');
    }
  };

  const handleCancel = () => {
    setMode('feed');
  };

  const handleBack = () => {
    setMode('feed');
  };

  return (
    <View style={styles.outer}>
      <SafeAreaView edges={['top']} style={[styles.phone, { width: screenWidth }]}>
        <Header />

        {isCompose ? (
          <ComposeScreen
            memo={memo}
            selectedPhotos={selectedPhotos}
            isPosting={isPosting}
            onBack={handleBack}
            onPickPhotos={handlePickPhotos}
            onMemoChange={setMemo}
            onPost={handlePost}
            onCancel={handleCancel}
          />
        ) : (
          <FeedScreen
            posts={feedPosts.length > 0 ? feedPosts : fallbackFeedItems}
            likedById={likedById}
            isLoading={isFeedLoading}
            errorMessage={feedError}
            onRefresh={refreshFeed}
            onToggleLike={handleToggleLike}
          />
        )}

        {!isCompose && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="추억 등록"
            style={({ pressed }) => [styles.fab, { bottom: 83 + insets.bottom }, pressed && styles.pressed]}
            onPress={() => setMode('compose')}>
            <HaemiIcon name="plus" color="#ffffff" size={38} />
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

function getCurrentFamilyMember() {
  const token = process.env.EXPO_PUBLIC_HAEMI_ACCESS_TOKEN;
  const payload = token ? decodeJwtPayload(token) : undefined;

  return {
    memberId: payload?.sub || process.env.EXPO_PUBLIC_HAEMI_MEMBER_ID || 'member-002',
    memberName: payload?.name || process.env.EXPO_PUBLIC_HAEMI_MEMBER_NAME || DEFAULT_MEMBER_NAME,
    relation: process.env.EXPO_PUBLIC_HAEMI_MEMBER_RELATION || DEFAULT_RELATION,
  };
}

function decodeJwtPayload(token: string): { sub?: string; name?: string } | undefined {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    return JSON.parse(globalThis.atob(padded)) as { sub?: string; name?: string };
  } catch {
    return undefined;
  }
}

function Header() {
  return (
    <View style={styles.header}>
      <Image source={LOGO_URL} style={styles.logo} contentFit="contain" />
      <View style={styles.headerActions}>
        <HaemiIcon name="alarm" color={LINE} size={30} />
        <HaemiIcon name="gear" color={LINE} size={28} />
      </View>
    </View>
  );
}

function FeedScreen({
  posts,
  likedById,
  isLoading,
  errorMessage,
  onRefresh,
  onToggleLike,
}: {
  posts: FamilyMemoryPost[];
  likedById: Record<string, boolean>;
  isLoading: boolean;
  errorMessage: string | null;
  onRefresh: () => void;
  onToggleLike: (postId: string) => void;
}) {
  const [commentOpenById, setCommentOpenById] = useState<Record<string, boolean>>({});

  const toggleComments = (id: string) => {
    setCommentOpenById((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.feedContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.feedTitleRow}>
        <Text style={styles.title}>가족 추억</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="새로고침" onPress={onRefresh} hitSlop={8}>
          {isLoading ? (
            <ActivityIndicator color={ORANGE} />
          ) : (
            <HaemiIcon name="refresh" color={ORANGE} size={24} />
          )}
        </Pressable>
      </View>
      {errorMessage && <Text style={styles.errorText}>{errorMessage}</Text>}
      {posts.map((post) => (
        <MemoryCard
          key={post.postId}
          post={post}
          liked={likedById[post.postId] ?? false}
          commentsOpen={commentOpenById[post.postId] ?? false}
          onToggleLike={() => onToggleLike(post.postId)}
          onToggleComments={() => toggleComments(post.postId)}
        />
      ))}
    </ScrollView>
  );
}

function MemoryCard({
  post,
  liked,
  commentsOpen,
  onToggleLike,
  onToggleComments,
}: {
  post: FamilyMemoryPost;
  liked: boolean;
  commentsOpen: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
}) {
  const likeCount = Math.max(0, (post.likeCount ?? 0) + (liked ? 1 : 0));
  const commentCount = post.elderReply?.content ? 1 : 0;
  const authorName = post.authorRelation || post.authorName || '가족';
  const photoSource = getMemoryPhotoSource(post.photoKeys);

  return (
    <View style={[styles.memoryCard, commentsOpen && styles.memoryCardExpanded]}>
      <View style={styles.cardHeader}>
        <View style={styles.author}>
          <Avatar />
          <Text style={styles.authorName}>{authorName}</Text>
        </View>
        <Text style={styles.timeText}>{formatRelativeDate(post.publishedAt || post.createdAt)}</Text>
      </View>

      {!!post.textContent && <Text style={styles.bodyText}>{post.textContent}</Text>}

      <Image source={photoSource} style={styles.feedPhoto} contentFit="cover" />

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
          <Text style={styles.commentTitle}>1개의 댓글</Text>
          <View style={styles.commentHeader}>
            <View style={styles.author}>
              <Avatar />
              <View>
                <Text style={styles.authorName}>어르신</Text>
                <Text style={styles.commentDate}>{formatShortDate(post.elderReply?.repliedAt)}</Text>
              </View>
            </View>
            <HaemiIcon name="more" color={LINE_NORMAL} size={24} />
          </View>
          <Text style={styles.bodyText}>
            {post.elderReply?.content || '아직 어르신 답변이 도착하지 않았어요.'}
          </Text>
          <View style={styles.commentInput}>
            <Text style={styles.placeholderText}>댓글을 작성해 보세요.</Text>
            <HaemiIcon name="send" color={ORANGE} size={22} />
          </View>
        </>
      )}
    </View>
  );
}

function getMemoryPhotoSource(photoKeys?: string[]) {
  const firstPhoto = photoKeys?.[0];
  return firstPhoto && firstPhoto.startsWith('http') ? firstPhoto : PHOTO_URL;
}

function formatRelativeDate(value?: string) {
  if (!value) {
    return '방금 전';
  }

  const date = new Date(value);
  const diffDays = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86400000));

  if (diffDays === 0) {
    return '오늘';
  }

  return `${diffDays}일전`;
}

function formatShortDate(value?: string) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  return `${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
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
  const color = icon === 'heart' && active ? '#ff0000' : active ? ORANGE : LINE;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${active ? '끄기' : '켜기'}`}
      hitSlop={8}
      style={({ pressed }) => [styles.reaction, pressed && styles.pressed]}
      onPress={onPress}>
      <HaemiIcon
        name={icon}
        color={color}
        filled={icon === 'heart' && active}
        size={23}
      />
      <Text style={styles.reactionText}>{label}</Text>
      <Text style={styles.reactionText}>{count}</Text>
    </Pressable>
  );
}

function ComposeScreen({
  memo,
  selectedPhotos,
  isPosting,
  onBack,
  onPickPhotos,
  onMemoChange,
  onPost,
  onCancel,
}: {
  memo: string;
  selectedPhotos: FamilyMemoryPhotoUpload[];
  isPosting: boolean;
  onBack: () => void;
  onPickPhotos: () => void;
  onMemoChange: (value: string) => void;
  onPost: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.compose}>
      <View style={styles.backTitle}>
        <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={onBack} hitSlop={8}>
          <HaemiIcon name="arrowLeft" color={TEXT} size={30} />
        </Pressable>
        <Text style={styles.title}>추억 등록</Text>
      </View>

      <ScrollView
        style={styles.composeScroll}
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>사진</Text>
          <View style={styles.photoRow}>
            {selectedPhotos.map((photo) => (
              <PhotoTile key={photo.uri} photo={photo} />
            ))}
            {selectedPhotos.length < MAX_SELECTED_PHOTOS && <UploadTile onPress={onPickPhotos} />}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>메모</Text>
          <View style={styles.memoBox}>
            <TextInput
              multiline
              maxLength={200}
              value={memo}
              onChangeText={onMemoChange}
              placeholder="가족과 나누고 싶은 추억을 적어주세요"
              placeholderTextColor={TEXT_ASSISTIVE}
              style={styles.memoInput}
              textAlignVertical="top"
            />
            <Text style={styles.countText}>{memo.length}/200</Text>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <Pressable
            disabled={isPosting}
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed, isPosting && styles.disabled]}
            onPress={onCancel}>
            <Text style={styles.secondaryButtonText}>취소</Text>
          </Pressable>
          <Pressable
            disabled={isPosting}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isPosting && styles.disabled]}
            onPress={onPost}>
            {isPosting ? (
              <ActivityIndicator color={ORANGE_SOFT} />
            ) : (
              <Text style={styles.primaryButtonText}>게시</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function PhotoTile({ photo }: { photo: FamilyMemoryPhotoUpload }) {
  return (
    <View style={styles.photoTile}>
      <Image source={{ uri: photo.uri }} style={styles.photoTileImage} contentFit="cover" />
    </View>
  );
}

function UploadTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.uploadTile, pressed && styles.pressed]} onPress={onPress}>
      <HaemiIcon name="photo" color={LINE_NORMAL} size={40} />
      <Text style={styles.uploadText}>이미지를 업로드하세요</Text>
    </Pressable>
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
  feedContent: {
    paddingTop: 14,
    paddingHorizontal: 19,
    paddingBottom: 128,
    gap: 12,
  },
  feedTitleRow: {
    minHeight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorText: {
    color: TEXT_ASSISTIVE,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },
  title: {
    color: TEXT,
    fontSize: 24,
    lineHeight: 31,
    fontWeight: '700',
  },
  memoryCard: {
    minHeight: 276,
    paddingHorizontal: 18,
    paddingTop: 15,
    paddingBottom: 12,
    borderWidth: 1.5,
    borderColor: FILL,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  memoryCardExpanded: {
    minHeight: 481,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  },
  timeText: {
    color: TEXT_ASSISTIVE,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  bodyText: {
    color: TEXT_MUTED,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  feedPhoto: {
    width: '100%',
    height: 123,
    borderRadius: 15,
    backgroundColor: FILL,
  },
  reactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reaction: {
    minHeight: 36,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  reactionText: {
    color: TEXT_ASSISTIVE,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
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
  placeholderText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    right: 23,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compose: {
    flex: 1,
    paddingHorizontal: 23,
    paddingTop: 14,
  },
  composeScroll: {
    flex: 1,
  },
  backTitle: {
    height: 31,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  form: {
    paddingTop: 40,
    paddingBottom: 112,
    gap: 35,
  },
  field: {
    gap: 12,
  },
  fieldLabel: {
    marginLeft: 10,
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  photoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoTile: {
    width: 166,
    height: 127,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  photoTileImage: {
    width: '100%',
    height: '100%',
  },
  uploadTile: {
    width: 166,
    height: 127,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  uploadText: {
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
  },
  memoBox: {
    height: 246,
    borderRadius: 10,
    backgroundColor: FILL,
    overflow: 'hidden',
  },
  memoInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 9,
    paddingBottom: 28,
    color: TEXT_ASSISTIVE,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  countText: {
    position: 'absolute',
    right: 13,
    bottom: 6,
    color: LINE_NORMAL,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '400',
  },
  buttonRow: {
    marginTop: 39,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 5,
    backgroundColor: ORANGE_SOFT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 5,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: ORANGE,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    includeFontPadding: false,
  },
  primaryButtonText: {
    color: ORANGE_SOFT,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '500',
    includeFontPadding: false,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: 526,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    backgroundColor: '#ffffff',
    paddingTop: 19,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    backgroundColor: TEXT_ASSISTIVE,
  },
  sheetHeader: {
    paddingTop: 28,
    paddingHorizontal: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetCount: {
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '400',
  },
  albumContent: {
    paddingHorizontal: 26,
    paddingTop: 33,
    paddingBottom: 36,
    gap: 12,
  },
  albumGroup: {
    gap: 9,
  },
  albumDate: {
    color: TEXT_MUTED,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '500',
  },
  albumRow: {
    gap: 12,
  },
  albumThumb: {
    width: 100,
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  albumThumbImage: {
    width: '100%',
    height: '100%',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.5,
  },
});
