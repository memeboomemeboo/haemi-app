import { Image, StyleSheet, Text, View } from 'react-native';

const sampleSource = require('../../../assets/images/album-sample.png');
const THUMBNAIL_LIMIT = 2;

interface AlbumDetailPhotosProps {
  photos: string[];
}

const resolveSource = (uri: string) =>
  uri.startsWith('http') || uri.startsWith('file') ? { uri } : sampleSource;

/** 추억 상세의 사진 영역 — 대표 사진 + 썸네일 + 초과분 표시 (Figma node 1326:10058) */
export const AlbumDetailPhotos = ({ photos }: AlbumDetailPhotosProps) => {
  const [mainPhoto, ...restPhotos] = photos;
  const thumbnails = restPhotos.slice(0, THUMBNAIL_LIMIT);
  const overflowCount = restPhotos.length - THUMBNAIL_LIMIT;

  if (!mainPhoto) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mainFrame}>
        <Image source={resolveSource(mainPhoto)} style={styles.mainPhoto} resizeMode="cover" />
      </View>
      {thumbnails.length > 0 && (
        <View style={styles.thumbnailRow}>
          {thumbnails.map((photo, index) => (
            <View key={`${photo}-${index}`} style={styles.thumbnailFrame}>
              <Image source={resolveSource(photo)} style={styles.thumbnailPhoto} resizeMode="cover" />
            </View>
          ))}
          {overflowCount > 0 && (
            <View style={styles.overflowFrame}>
              <Text style={styles.overflowText}>+ {overflowCount}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  mainFrame: {
    width: '100%',
    height: 170,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  mainPhoto: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 9,
  },
  thumbnailFrame: {
    flex: 1,
    height: 81,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
  },
  thumbnailPhoto: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  overflowFrame: {
    flex: 1,
    height: 81,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e6e7',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflowText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#c1c2c3',
    letterSpacing: -0.4,
  },
});
