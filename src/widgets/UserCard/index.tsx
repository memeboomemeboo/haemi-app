import { StyleSheet, Text, View } from 'react-native';

export const UserCard = () => {
  return (
    <View style={styles.userCard}>
      <View style={styles.userProfile}>
        <View style={styles.profileIcon} />
        <View style={styles.userInfo}>
          <View style={styles.userNameRow}>
            <Text style={styles.userName}>어머니</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>70세</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.userRight}>
        <Text style={styles.userStatus}>오늘도 건강하게 활동 중이에요</Text>
        <View style={styles.detailButton}>
          <Text style={styles.detailButtonText}>상세보기</Text>
          <View style={styles.arrowIcon} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: '#e8e8e9',
    borderRadius: 15,
    padding: 16,
    marginBottom: 48,
    flexDirection: 'row',
    gap: 17,
    height: 85,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileIcon: {
    width: 49,
    height: 49,
    backgroundColor: '#ffffff',
    borderRadius: 100,
  },
  userInfo: {
    gap: 8,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5a5c5d',
  },
  ageBadge: {
    backgroundColor: '#fd6941',
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderRadius: 5,
    width: 47,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  userRight: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  userStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
  },
  detailButton: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    width: 103,
    height: 28,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fd6941',
  },
  arrowIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#fd6941',
    borderRadius: 2,
  },
});
