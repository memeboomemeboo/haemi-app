import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Arrow, BottomNavigation, Comment, Fab, Heart, More, Picture, Sent } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

type MemoryMode = 'feed' | 'compose' | 'composeAlbum';

const samplePhoto = require('../../../assets/images/album-sample.png');

const ORANGE = '#fd6941';
const ORANGE_SOFT = '#fed7cd';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE = '#dadbdc';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';
const MAX_SELECTED_PHOTOS = 3;

const feedItems = [
  { id: 'first', liked: true, comments: 12 },
  { id: 'second', liked: false, comments: 12 },
  { id: 'third', liked: false, comments: 12 },
];

const albumRows = [
  { date: '06.10', count: 2 },
  { date: '06.10', count: 4 },
  { date: '06.10', count: 3 },
];

export default function FamilyMemoriesScreen() {
  const [mode, setMode] = useState<MemoryMode>('feed');
  const [selectedPhotos, setSelectedPhotos] = useState(1);
  const [memo, setMemo] = useState('가족끼리 나들이에 갔던 날이에요');

  const canPost = selectedPhotos > 0 || memo.trim().length > 0;
  const isCompose = mode === 'compose' || mode === 'composeAlbum';

  const selectedPhotoSlots = useMemo(() => {
    return Array.from({ length: selectedPhotos }, (_, index) => `selected-${index}`);
  }, [selectedPhotos]);

  const handlePost = () => {
    if (!canPost) {
      Alert.alert('추억 내용을 입력해주세요');
      return;
    }
    setMode('feed');
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <HomeHeader style={styles.header} />
        </View>

        {isCompose ? (
          <ComposeScreen
            memo={memo}
            selectedPhotoSlots={selectedPhotoSlots}
            selectedPhotos={selectedPhotos}
            onBack={() => setMode('feed')}
            onOpenAlbum={() => setMode('composeAlbum')}
            onMemoChange={setMemo}
            onPost={handlePost}
            onCancel={() => setMode('feed')}
          />
        ) : (
          <FeedScreen />
        )}

        {!isCompose && (
          <Fab
            accessibilityLabel="추억 등록"
            style={styles.fab}
            onPress={() => setMode('compose')}
          />
        )}
      </SafeAreaView>

      {!isCompose && <BottomNavigation activeTab="Memory" />}

      {mode === 'composeAlbum' && (
        <AlbumSheet
          onSelect={() => {
            setSelectedPhotos((value) => Math.min(MAX_SELECTED_PHOTOS, value + 1));
            setMode('compose');
          }}
          onClose={() => setMode('compose')}
        />
      )}
    </View>
  );
}

function FeedScreen() {
  const [likedById, setLikedById] = useState(() =>
    Object.fromEntries(feedItems.map((item) => [item.id, item.liked])),
  );
  const [commentOpenById, setCommentOpenById] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => {
    setLikedById((current) => ({ ...current, [id]: !current[id] }));
  };

  const toggleComments = (id: string) => {
    setCommentOpenById((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.feedContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>가족 추억</Text>
      {feedItems.map((item) => (
        <MemoryCard
          key={item.id}
          liked={likedById[item.id]}
          comments={item.comments}
          commentsOpen={commentOpenById[item.id] ?? false}
          onToggleLike={() => toggleLike(item.id)}
          onToggleComments={() => toggleComments(item.id)}
        />
      ))}
    </ScrollView>
  );
}

function MemoryCard({
  liked,
  comments,
  commentsOpen,
  onToggleLike,
  onToggleComments,
}: {
  liked: boolean;
  comments: number;
  commentsOpen: boolean;
  onToggleLike: () => void;
  onToggleComments: () => void;
}) {
  const likeCount = liked ? 12 : 11;

  return (
    <View style={[styles.memoryCard, commentsOpen && styles.memoryCardExpanded]}>
      <View style={styles.cardHeader}>
        <View style={styles.author}>
          <Avatar />
          <Text style={styles.authorName}>딸</Text>
        </View>
        <Text style={styles.timeText}>2일전</Text>
      </View>

      <Text style={styles.bodyText}>
        엄마와 함께 첫 벚꽃 구경 갔던 날이에요.{'\n'}정말 예뻤던 기억이 나요.🌸
      </Text>

      <Image source={samplePhoto} style={styles.feedPhoto} contentFit="cover" />

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
          count={comments}
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
                <Text style={styles.authorName}>어머니</Text>
                <Text style={styles.commentDate}>06.10</Text>
              </View>
            </View>
            <More size={24} color={LINE_NORMAL} />
          </View>
          <Text style={styles.bodyText}>그때 너무 예뻤는데~~ 나도 기억이 떠오르네!</Text>
          <View style={styles.commentInput}>
            <Text style={styles.placeholderText}>댓글을 작성해 보세요.</Text>
            <Sent size={22} color={ORANGE} />
          </View>
        </>
      )}
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
  const color = icon === 'heart' && active ? '#ff0000' : active ? ORANGE : LINE;
  const IconComponent = icon === 'heart' ? Heart : Comment;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} ${active ? '끄기' : '켜기'}`}
      hitSlop={8}
      style={({ pressed }) => [styles.reaction, pressed && styles.pressed]}
      onPress={onPress}
    >
      <IconComponent size={23} color={color} />
      <Text style={styles.reactionText}>{label}</Text>
      <Text style={styles.reactionText}>{count}</Text>
    </Pressable>
  );
}

function ComposeScreen({
  memo,
  selectedPhotoSlots,
  selectedPhotos,
  onBack,
  onOpenAlbum,
  onMemoChange,
  onPost,
  onCancel,
}: {
  memo: string;
  selectedPhotoSlots: string[];
  selectedPhotos: number;
  onBack: () => void;
  onOpenAlbum: () => void;
  onMemoChange: (value: string) => void;
  onPost: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.compose}>
      <View style={styles.backTitle}>
        <Pressable accessibilityRole="button" accessibilityLabel="뒤로" onPress={onBack} hitSlop={8}>
          <Arrow size={22} color={TEXT} style={styles.backArrow} />
        </Pressable>
        <Text style={styles.title}>추억 등록</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>사진</Text>
          <View style={styles.photoRow}>
            {selectedPhotoSlots.map((slot) => (
              <PhotoTile key={slot} />
            ))}
            {selectedPhotos < MAX_SELECTED_PHOTOS && <UploadTile onPress={onOpenAlbum} />}
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
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={onCancel}
          >
            <Text style={styles.secondaryButtonText}>취소</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
            onPress={onPost}
          >
            <Text style={styles.primaryButtonText}>게시</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function PhotoTile() {
  return (
    <View style={styles.photoTile}>
      <Image source={samplePhoto} style={styles.photoTileImage} contentFit="cover" />
    </View>
  );
}

function UploadTile({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.uploadTile, pressed && styles.pressed]} onPress={onPress}>
      <Picture size={40} color={LINE_NORMAL} />
      <Text style={styles.uploadText}>이미지를 업로드하세요</Text>
    </Pressable>
  );
}

function AlbumSheet({ onSelect, onClose }: { onSelect: () => void; onClose: () => void }) {
  return (
    <View style={styles.scrim}>
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <View style={styles.sheetHeader}>
          <Text style={styles.title}>앨범 사진</Text>
          <Text style={styles.sheetCount}>200장</Text>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.albumContent}
        >
          {albumRows.map((row, rowIndex) => (
            <View key={`${row.date}-${rowIndex}`} style={styles.albumGroup}>
              <Text style={styles.albumDate}>{row.date}</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.albumRow}
              >
                {Array.from({ length: row.count }, (_, index) => (
                  <Pressable key={`${rowIndex}-${index}`} style={styles.albumThumb} onPress={onSelect}>
                    <Image source={samplePhoto} style={styles.albumThumbImage} contentFit="cover" />
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 26,
    paddingTop: 14,
  },
  header: {
    marginBottom: 26,
  },
  scroll: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 19,
    paddingBottom: 40,
    gap: 12,
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
    bottom: 20,
  },
  compose: {
    flex: 1,
    paddingHorizontal: 23,
    paddingTop: 14,
    paddingBottom: 40,
  },
  backTitle: {
    height: 31,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    transform: [{ scaleX: -1 }],
  },
  form: {
    paddingTop: 40,
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
});
