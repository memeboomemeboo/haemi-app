import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Arrow, Profile } from '@/shared/ui/Icon';

export const UserCard = () => {
  return (
    <View style={styles.userCard}>
      {/* Profile icon (left) */}
      <View style={styles.profileCircle}>
        <Profile size={49} color="#fd8768" />
      </View>

      {/* Info column (right of profile) */}
      <View style={styles.infoColumn}>
        {/* Row 1: name + age badge | detail button */}
        <View style={styles.topRow}>
          <View style={styles.nameGroup}>
            <Text style={styles.userName}>어머니</Text>
            <View style={styles.ageBadge}>
              <Text style={styles.ageBadgeText}>70세</Text>
            </View>
          </View>
          <Pressable style={styles.detailButton}>
            <Text style={styles.detailButtonText}>상세보기</Text>
            <Arrow size={13} color="#fd6941" />
          </Pressable>
        </View>

        {/* Row 2: status text */}
        <Text style={styles.userStatus}>오늘도 건강하게 활동 중이에요</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  userCard: {
    backgroundColor: '#e8e8e9',
    borderRadius: 15,
    height: 85,
    paddingHorizontal: 16,
    marginBottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
  },
  profileCircle: {
    width: 49,
    height: 49,
    backgroundColor: '#ffffff',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  infoColumn: {
    flex: 1,
    gap: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5a5c5d',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  ageBadge: {
    backgroundColor: '#fd6941',
    height: 20,
    minWidth: 47,
    paddingHorizontal: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ageBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: -0.28,
    lineHeight: 18,
  },
  detailButton: {
    backgroundColor: '#ffffff',
    height: 28,
    width: 103,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fd6941',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  userStatus: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
});
