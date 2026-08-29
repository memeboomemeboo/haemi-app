import { StyleSheet, Text, View } from 'react-native';
import type { AlbumConversation as AlbumConversationData } from '@/entities/album';
import { Play, Profile, Replay } from '@/shared/ui';

const TAG_COLORS: Record<string, string> = {
  그리움: '#38a9fa',
  행복: '#fd9b9b',
};
const DEFAULT_TAG_COLOR = '#c1c2c3';

/** 재생 위치를 나타내는 정적 표시 — 실제 오디오 재생 없이 디자인만 표현한다 */
const PLAYBACK_PROGRESS_RATIO = 0.55;

interface AlbumConversationProps {
  conversation: AlbumConversationData;
}

/** 추억 상세의 "주고 받은 이야기" — 보호자 질문과 어르신 음성 답변 (Figma node 1366:2572) */
export const AlbumConversation = ({ conversation }: AlbumConversationProps) => {
  const { question, askedRelativeTime, answer } = conversation;

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>주고 받은 이야기</Text>

      <View style={styles.questionBlock}>
        <Text style={styles.questionMeta}>
          보호자가 물었어요 · {askedRelativeTime}
        </Text>
        <View style={styles.questionBubble}>
          <Text style={styles.questionText}>&ldquo; {question} &rdquo;</Text>
        </View>
      </View>

      {answer && (
        <View style={styles.answerCard}>
          <View style={styles.answerHeader}>
            <Profile size={41} color="#fed7cd" />
            <View>
              <Text style={styles.answerAuthor}>{answer.authorName}</Text>
              <Text style={styles.answerMeta}>
                {answer.relativeTime} · {answer.time}
              </Text>
            </View>
          </View>

          {answer.tags.length > 0 && (
            <View style={styles.tagRow}>
              {answer.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tag, { backgroundColor: TAG_COLORS[tag] ?? DEFAULT_TAG_COLOR }]}
                >
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}

          <Text style={styles.answerQuote}>&ldquo; {answer.quote} &rdquo;</Text>

          <View style={styles.divider} />

          <View style={styles.audioPlayer}>
            <View style={styles.audioTrackRow}>
              <Text style={styles.audioTime}>0:00</Text>
              <View style={styles.audioTrack}>
                <View style={[styles.audioProgress, { width: `${PLAYBACK_PROGRESS_RATIO * 100}%` }]} />
              </View>
              <Text style={styles.audioTime}>{answer.audioDuration}</Text>
            </View>
            <View style={styles.audioControls}>
              <Replay size={23} color="#76787a" />
              <Play size={46} color="#fd6941" />
              <Replay size={23} color="#76787a" style={styles.audioForwardIcon} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.4,
  },
  questionBlock: {
    gap: 6,
  },
  questionMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
  },
  questionBubble: {
    minHeight: 45,
    borderRadius: 10,
    backgroundColor: '#fff3f0',
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  questionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.32,
  },
  answerCard: {
    borderRadius: 10,
    backgroundColor: '#ffffff',
    padding: 22,
    gap: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  answerAuthor: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.36,
  },
  answerMeta: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    height: 19,
    paddingHorizontal: 6,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: -0.24,
  },
  answerQuote: {
    fontSize: 16,
    fontWeight: '500',
    color: '#5a5c5d',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  divider: {
    height: 2,
    backgroundColor: '#f7f7f7',
  },
  audioPlayer: {
    gap: 6,
  },
  audioTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  audioTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
  },
  audioTrack: {
    flex: 1,
    height: 3,
    borderRadius: 100,
    backgroundColor: '#e6e6e7',
    overflow: 'hidden',
  },
  audioProgress: {
    height: '100%',
    borderRadius: 100,
    backgroundColor: '#fd6941',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 17,
  },
  audioForwardIcon: {
    transform: [{ scaleX: -1 }],
  },
});
