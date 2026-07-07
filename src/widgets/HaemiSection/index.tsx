import { StyleSheet, Text, View } from 'react-native';
import { Picture } from '@/shared/ui/Icon';

export const HaemiSection = () => {
  return (
    <View style={styles.haemiSection}>
      <View style={styles.haemiLeft}>
        <View style={styles.haemiHeader}>
          <Text style={styles.haemiHeaderText}>해미</Text>
          <Text style={styles.haemiSubText}>로</Text>
        </View>
        <Text style={styles.haemiDesc}>가족과의 추억을{'\n'}다시 떠올려보세요</Text>
        <View style={styles.illustrationPlaceholder}>
          <Picture size={48} color="#c5d3e0" />
        </View>
      </View>

      <View style={styles.haemiRight}>
        <View style={styles.haemiCard}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardSubtitle}>추억을 돌아보며</Text>
            <Text style={styles.cardTitle}>사진 추가하기</Text>
          </View>
          <Picture size={34} color="#fd8768" style={styles.cardIcon} />
        </View>
        <View style={styles.haemiCard}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardSubtitle}>다시 회상하며</Text>
            <Text style={styles.cardTitle}>추억 남기기</Text>
          </View>
          <Picture size={34} color="#fd8768" style={styles.cardIcon} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  haemiSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    height: 202,
  },
  haemiLeft: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    gap: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  haemiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  haemiHeaderText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
  },
  haemiSubText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
  },
  haemiDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#76787a',
    lineHeight: 18,
  },
  illustrationPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  haemiRight: {
    flex: 1,
    gap: 8,
  },
  haemiCard: {
    flex: 1,
    backgroundColor: '#fed7cd',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
  },
  cardTextContent: {
    gap: 2,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fd6035',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5a5c5d',
    lineHeight: 22,
  },
  cardIcon: {
    alignSelf: 'flex-end',
  },
});
