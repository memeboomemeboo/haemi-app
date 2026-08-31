import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { AlbumConversation as AlbumConversationData } from '@/entities/album';
import { useTheme } from '@/shared/hooks';
import { Play, Profile, Replay } from '@/shared/ui';

/** 재생 위치를 나타내는 정적 표시 — 실제 오디오 재생 없이 디자인만 표현한다 */
const PLAYBACK_PROGRESS_RATIO = 0.55;

interface AlbumConversationProps {
  conversation: AlbumConversationData;
}

/** 추억 상세의 "주고 받은 이야기" — 보호자 질문과 어르신 음성 답변 (Figma node 1366:2572) */
export const AlbumConversation = ({ conversation }: AlbumConversationProps) => {
  const theme = useTheme();
  const { colors, palette } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);
  const tagColors: Record<string, string> = useMemo(
    () => ({
      그리움: palette.blue[60],
      행복: palette.red[80],
    }),
    [palette],
  );

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
            <Profile size={41} color={palette.orange[90]} />
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
                  style={[styles.tag, { backgroundColor: tagColors[tag] ?? colors.line.normal }]}
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
              <Replay size={23} color={colors.label.assistive} />
              <Play size={46} color={colors.primary} />
              <Replay size={23} color={colors.label.assistive} style={styles.audioForwardIcon} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      gap: 14,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.label.neutral,
      letterSpacing: -0.4,
    },
    questionBlock: {
      gap: 6,
    },
    questionMeta: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.28,
    },
    questionBubble: {
      minHeight: 45,
      borderRadius: 10,
      backgroundColor: palette.orange[97],
      justifyContent: 'center',
      paddingHorizontal: 15,
      paddingVertical: 12,
    },
    questionText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
      letterSpacing: -0.32,
    },
    answerCard: {
      borderRadius: 10,
      backgroundColor: colors.background.normal,
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
      color: colors.label.neutral,
      letterSpacing: -0.36,
    },
    answerMeta: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.label.assistive,
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
      color: colors.background.normal,
      letterSpacing: -0.24,
    },
    answerQuote: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.32,
      lineHeight: 21,
    },
    divider: {
      height: 2,
      backgroundColor: colors.fill.normal,
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
      color: colors.label.assistive,
      letterSpacing: -0.28,
    },
    audioTrack: {
      flex: 1,
      height: 3,
      borderRadius: 100,
      backgroundColor: colors.label.disabled,
      overflow: 'hidden',
    },
    audioProgress: {
      height: '100%',
      borderRadius: 100,
      backgroundColor: colors.primary,
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
