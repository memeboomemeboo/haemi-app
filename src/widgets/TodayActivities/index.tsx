import { StyleSheet, Text, View } from 'react-native';
import type { Activity, ActivityType } from '@/entities/activity';
import { Check, Illustration, type IllustrationName } from '@/shared/ui';

interface TodayActivitiesProps {
  activities: Activity[] | null;
}

/** 활동 종류별 디자인 매핑 (일러스트/배경색) — 표현 관심사는 위젯이 가진다 */
const ACTIVITY_DESIGN: Record<
  ActivityType,
  { illustration: IllustrationName; width: number; height: number; backgroundColor: string }
> = {
  recall: { illustration: 'recall', width: 53, height: 44, backgroundColor: '#fff3f0' },
  quiz: { illustration: 'quiz', width: 60, height: 60, backgroundColor: '#fef8cd' },
  letter: { illustration: 'letter', width: 56, height: 36, backgroundColor: '#cdeafe' },
};

function statusLabel(activity: Activity): string {
  switch (activity.status) {
    case 'completed':
      return '완료';
    case 'inProgress':
      return '진행 중';
    case 'arrived':
      return `${activity.arrivedCount ?? 0}개 도착`;
  }
}

export const TodayActivities = ({ activities }: TodayActivitiesProps) => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>오늘의 활동</Text>
      <View style={styles.grid}>
        {(activities ?? []).map((activity) => {
          const design = ACTIVITY_DESIGN[activity.type];
          return (
            <View key={activity.id} style={styles.column}>
              <View style={[styles.card, { backgroundColor: design.backgroundColor }]}>
                <View style={styles.illustrationBox}>
                  <Illustration
                    name={design.illustration}
                    width={design.width}
                    height={design.height}
                  />
                </View>
                <Text style={styles.cardLabel}>{activity.title}</Text>
              </View>
              <View style={styles.statusRow}>
                <Text style={styles.statusText}>{statusLabel(activity)}</Text>
                {activity.status === 'completed' && <Check size={17} color="#fd6941" />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  column: {
    width: 106,
    gap: 8,
    alignItems: 'center',
  },
  card: {
    width: 106,
    height: 120,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  illustrationBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.28,
    lineHeight: 18,
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5a5c5d',
    letterSpacing: -0.36,
    lineHeight: 23,
    textAlign: 'center',
  },
});
