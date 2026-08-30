import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Illustration } from '@/shared/ui';

const logoSource = require('../../../assets/images/haemi-logo.png');
const familySource = require('../../../assets/images/haemi-family.png');

interface HaemiSectionProps {
  onAddPhotoPress?: () => void;
  onLeaveMemoryPress?: () => void;
}

export const HaemiSection = ({ onAddPhotoPress, onLeaveMemoryPress }: HaemiSectionProps) => {
  return (
    <View style={styles.haemiSection}>
      {/* 왼쪽: 해미 소개 카드 */}
      <View style={styles.haemiLeft}>
        <View style={styles.haemiHeader}>
          <Image source={logoSource} style={styles.haemiLogo} resizeMode="contain" />
          <Text style={styles.haemiSubText}>로</Text>
        </View>
        <Text style={styles.haemiDesc}>가족과의 추억을 다시 떠올려보세요</Text>
        <Image source={familySource} style={styles.familyImage} resizeMode="contain" />
      </View>

      {/* 오른쪽: 액션 카드 2개 */}
      <View style={styles.haemiRight}>
        <Pressable style={styles.haemiCard} onPress={onAddPhotoPress}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardSubtitle}>추억을 돌아보며</Text>
            <Text style={styles.cardTitle}>사진 추가하기</Text>
          </View>
          <Illustration name="photoAdd" width={49} height={38} style={styles.cardIcon} />
        </Pressable>
        <Pressable style={styles.haemiCard} onPress={onLeaveMemoryPress}>
          <View style={styles.cardTextContent}>
            <Text style={styles.cardSubtitle}>다시 회상하며</Text>
            <Text style={styles.cardTitle}>추억 남기기</Text>
          </View>
          <Illustration name="memoWrite" width={45} height={45} style={styles.cardIcon} />
        </Pressable>
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
    paddingTop: 15,
    paddingHorizontal: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },
  haemiHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1,
  },
  haemiLogo: {
    width: 62,
    height: 24,
  },
  haemiSubText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  haemiDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
    lineHeight: 21,
    marginTop: 8,
    maxWidth: 130,
  },
  familyImage: {
    width: 135,
    height: 89,
    alignSelf: 'center',
    marginTop: 'auto',
    marginBottom: 15,
  },
  haemiRight: {
    flex: 1,
    gap: 8,
  },
  haemiCard: {
    flex: 1,
    backgroundColor: '#fed7cd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    overflow: 'hidden',
  },
  cardTextContent: {
    gap: 0,
  },
  cardSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#fd6035',
    letterSpacing: -0.24,
    lineHeight: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5a5c5d',
    letterSpacing: -0.36,
    lineHeight: 23,
  },
  cardIcon: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
});
