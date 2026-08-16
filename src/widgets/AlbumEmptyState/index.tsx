import { StyleSheet, Text, View } from 'react-native';
import { Illustration } from '@/shared/ui/Icon';

/** 앨범에 사진이 없을 때 표시 (Figma node 52-2611 / 211-3944) */
export const AlbumEmptyState = () => {
  return (
    <View style={styles.container}>
      <Illustration name="emptyAlbum" width={85} height={70} />
      <View style={styles.textGroup}>
        <Text style={styles.title}>아직 등록된 사진이 없어요</Text>
        <Text style={styles.subtitle}>어르신께 추억을 전달드려보세요!</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 247,
    alignItems: 'center',
    gap: 29,
  },
  textGroup: {
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#3c3e3f',
    letterSpacing: -0.48,
    lineHeight: 31,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
    lineHeight: 21,
    textAlign: 'center',
  },
});
