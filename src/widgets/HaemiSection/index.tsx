import { StyleSheet, Text, View } from 'react-native';

export const HaemiSection = () => {
  return (
    <View style={styles.haemiSection}>
      <View style={styles.haemiLeft}>
        <View style={styles.haemiHeader}>
          <Text style={styles.haeHeaderTitle}>해미</Text>
          <Text style={styles.haeHeaderSub}>로</Text>
        </View>
        <Text style={styles.haemiDesc}>가족과의 추억을 다시 떠올려보세요</Text>
        <View style={styles.illustrationPlaceholder} />
      </View>

      <View style={styles.haemiRight}>
        <View style={styles.haemiCard1}>
          <Text style={styles.cardSubtitle}>추억을 돌아보며</Text>
          <Text style={styles.cardTitle}>사진 추가하기</Text>
          <View style={styles.cardIcon} />
        </View>
        <View style={styles.haemiCard2}>
          <Text style={styles.cardSubtitle}>다시 회상하며</Text>
          <Text style={styles.cardTitle}>추억 남기기</Text>
          <View style={styles.cardIcon} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  haemiSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 48,
    height: 202,
  },
  haemiLeft: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    padding: 15,
    gap: 7,
  },
  haemiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  haeHeaderTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
  },
  haeHeaderSub: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
  },
  haemiDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
  },
  illustrationPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
  },
  haemiRight: {
    flex: 1,
    gap: 8,
  },
  haemiCard1: {
    flex: 1,
    backgroundColor: '#fed7cd',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
  },
  haemiCard2: {
    flex: 1,
    backgroundColor: '#fed7cd',
    borderRadius: 10,
    padding: 12,
    justifyContent: 'space-between',
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
  },
  cardIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#ffb3a0',
    borderRadius: 4,
    alignSelf: 'flex-end',
  },
});
