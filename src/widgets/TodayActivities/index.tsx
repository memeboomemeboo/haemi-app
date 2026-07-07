import { StyleSheet, Text, View } from 'react-native';

export const TodayActivities = () => {
  return (
    <View style={styles.activitiesSection}>
      <Text style={styles.activitiesTitle}>오늘의 활동</Text>
      <View style={styles.activitiesGrid}>
        {/* Activity 1 */}
        <View style={styles.activityCard}>
          <View style={styles.activityCardIcon} />
          <Text style={styles.activityName}>오늘의 회상</Text>
          <View style={styles.completeBadge}>
            <Text style={styles.completeBadgeText}>완료</Text>
            <View style={styles.checkmark} />
          </View>
        </View>

        {/* Activity 2 */}
        <View style={styles.activityCard}>
          <View style={[styles.activityCardIcon, { backgroundColor: '#fef8cd' }]} />
          <Text style={styles.activityName}>인지 훈련</Text>
          <View style={[styles.completeBadge, { backgroundColor: '#fef8cd' }]}>
            <Text style={styles.completeBadgeText}>진행 중</Text>
          </View>
        </View>

        {/* Activity 3 */}
        <View style={styles.activityCard}>
          <View style={[styles.activityCardIcon, { backgroundColor: '#cdeafe' }]} />
          <Text style={styles.activityName}>새 추억 답장</Text>
          <View style={[styles.completeBadge, { backgroundColor: '#cdeafe' }]}>
            <Text style={styles.completeBadgeText}>1개 도착</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activitiesSection: {
    marginBottom: 16,
  },
  activitiesTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#3c3e3f',
    marginBottom: 12,
  },
  activitiesGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#fff3f0',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    alignItems: 'center',
  },
  activityCardIcon: {
    width: '100%',
    height: 60,
    backgroundColor: '#fff3f0',
    borderRadius: 8,
  },
  activityName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
  },
  completeBadge: {
    backgroundColor: '#fff3f0',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  completeBadgeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5a5c5d',
  },
  checkmark: {
    width: 17,
    height: 17,
    backgroundColor: '#fd6941',
    borderRadius: 3,
  },
});
