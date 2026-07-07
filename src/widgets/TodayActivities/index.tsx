import { StyleSheet, Text, View } from 'react-native';
import { Check, Illustration, type IllustrationName } from '@/shared/ui/Icon';

interface Activity {
  illustration: IllustrationName;
  illustrationSize: { width: number; height: number };
  name: string;
  status: string;
  backgroundColor: string;
  done?: boolean;
}

const ACTIVITIES: Activity[] = [
  {
    illustration: 'recall',
    illustrationSize: { width: 53, height: 44 },
    name: '오늘의 회상',
    status: '완료',
    backgroundColor: '#fff3f0',
    done: true,
  },
  {
    illustration: 'quiz',
    illustrationSize: { width: 60, height: 60 },
    name: '인지 훈련',
    status: '진행 중',
    backgroundColor: '#fef8cd',
  },
  {
    illustration: 'letter',
    illustrationSize: { width: 56, height: 36 },
    name: '새 추억 답장',
    status: '1개 도착',
    backgroundColor: '#cdeafe',
  },
];

export const TodayActivities = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>오늘의 활동</Text>
      <View style={styles.grid}>
        {ACTIVITIES.map((activity) => (
          <View key={activity.name} style={styles.column}>
            <View style={[styles.card, { backgroundColor: activity.backgroundColor }]}>
              <View style={styles.illustrationBox}>
                <Illustration
                  name={activity.illustration}
                  width={activity.illustrationSize.width}
                  height={activity.illustrationSize.height}
                />
              </View>
              <Text style={styles.cardLabel}>{activity.name}</Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusText}>{activity.status}</Text>
              {activity.done && <Check size={17} color="#fd6941" />}
            </View>
          </View>
        ))}
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
