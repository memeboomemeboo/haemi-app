import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BottomNavigation,
  Comment,
  Fab,
  HeartFilled,
  HeartOutline,
  More,
  Sent,
} from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

const samplePhoto = require('../../../assets/images/family-memory-sample.png');

const ORANGE = '#fd6941';
const TEXT = '#3c3e3f';
const TEXT_MUTED = '#5a5c5d';
const TEXT_ASSISTIVE = '#76787a';
const LINE = '#dadbdc';
const LINE_NORMAL = '#c1c2c3';
const FILL = '#f7f7f7';

const feedItems = [
  { id: 'first', liked: true, comments: 12 },
  { id: 'second', liked: false, comments: 12 },
];

export default function FamilyMemoriesScreen() {
  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.headerWrapper}>
          <HomeHeader showSetting={false} style={styles.header} />
        </View>

        <FeedScreen />

        <Link href="/memory-register" asChild>
          <Fab
            accessibilityLabel="추억 등록"
            style={styles.fab}
          />
        </Link>
      </SafeAreaView>

      <BottomNavigation activeTab="Memory" />
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
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 30,
    paddingTop: 14,
  },
  header: {
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
    minHeight: 276,
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
  feedPhoto: {
    width: '100%',
    height: 123,
    borderRadius: 10,
    backgroundColor: FILL,
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
  pressed: {
    opacity: 0.72,
  },
});
