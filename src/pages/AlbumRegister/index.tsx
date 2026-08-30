import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Arrow, BottomNavigation, Calendar, Picture, Plus } from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

const MEMO_MAX_LENGTH = 200;
const MAX_PHOTOS = 4;
const ELDER_CANDIDATES = ['아버지', '어머니'];

export default function AlbumRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [elder, setElder] = useState('어머니');
  const [title, setTitle] = useState('어린 시절 고향');
  const [photos, setPhotos] = useState<string[]>([]);
  const [memo, setMemo] = useState('가족끼리 나들이에 갔던 날이에요');
  const [question, setQuestion] = useState('이 사진, 기억나세요?');
  const [year, setYear] = useState('1975');

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotos((current) => [...current, result.assets[0].uri].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (uri: string) => {
    setPhotos((current) => current.filter((photo) => photo !== uri));
  };

  const handleSave = () => {
    // TODO: API 연결 시 POST /albums 호출로 대체
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.fixedTop, { paddingTop: Math.max(insets.top, 20) }]}>
        <HomeHeader style={styles.header} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* 뒤로가기 + 타이틀 */}
        <View style={styles.backTitle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="뒤로"
            onPress={() => router.back()}
            hitSlop={8}
          >
            <Arrow size={22} color="#3c3e3f" style={styles.backArrow} />
          </Pressable>
          <Text style={styles.title}>추억 등록</Text>
        </View>

        <View style={styles.fields}>
          {/* 보낼 어르신 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>보낼 어르신</Text>
            <View style={styles.elderRow}>
              {ELDER_CANDIDATES.map((name) => {
                const isSelected = name === elder;
                return (
                  <Pressable
                    key={name}
                    style={[styles.elderChip, isSelected && styles.elderChipSelected]}
                    onPress={() => setElder(name)}
                  >
                    <Text style={[styles.elderChipText, isSelected && styles.elderChipTextSelected]}>
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 추억 이름 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>추억 이름</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="추억 이름을 입력하세요"
              placeholderTextColor="#c1c2c3"
              style={styles.textInput}
            />
          </View>

          {/* 사진 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>사진</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoRow}
            >
              {photos.length < MAX_PHOTOS && (
                <Pressable style={styles.uploadTile} onPress={pickPhoto}>
                  <Picture size={40} color="#c1c2c3" style={styles.uploadIcon} />
                  <Text style={styles.uploadText}>
                    사진 {photos.length}/{MAX_PHOTOS}
                  </Text>
                </Pressable>
              )}
              {photos.map((photo) => (
                <View key={photo} style={styles.photoTileWrapper}>
                  <View style={styles.photoTile}>
                    <Image source={{ uri: photo }} style={styles.photoTileImage} />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="사진 삭제"
                    style={styles.photoDelete}
                    onPress={() => removePhoto(photo)}
                    hitSlop={6}
                  >
                    <Plus size={10} color="#5a5c5d" style={styles.photoDeleteIcon} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>

          {/* 메모 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>메모</Text>
            <View style={styles.memoBox}>
              <TextInput
                multiline
                maxLength={MEMO_MAX_LENGTH}
                value={memo}
                onChangeText={setMemo}
                placeholder="추억을 적어주세요"
                placeholderTextColor="#c1c2c3"
                style={styles.memoInput}
                textAlignVertical="top"
              />
              <Text style={styles.memoCount}>
                {memo.length}/{MEMO_MAX_LENGTH}
              </Text>
            </View>
          </View>

          {/* 어르신께 여쭤볼 한마디 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>어르신께 여쭤볼 한마디</Text>
            <TextInput
              value={question}
              onChangeText={setQuestion}
              placeholder="어르신께 여쭤볼 질문을 입력하세요"
              placeholderTextColor="#c1c2c3"
              style={styles.textInput}
            />
          </View>

          {/* 연도 */}
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>연도</Text>
            <View style={styles.yearInputWrapper}>
              <TextInput
                value={year}
                onChangeText={setYear}
                placeholder="예: 1975"
                placeholderTextColor="#c1c2c3"
                keyboardType="number-pad"
                style={styles.yearInput}
              />
              <Calendar size={17} color="#76787a" />
            </View>
          </View>
        </View>

        {/* 취소 / 저장 */}
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>취소</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>저장</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  fixedTop: {
    paddingHorizontal: 26,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 26,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 27,
    paddingBottom: 40,
    gap: 48,
  },
  backTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backArrow: {
    transform: [{ scaleX: -1 }],
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3c3e3f',
    letterSpacing: -0.48,
    lineHeight: 31,
  },
  fields: {
    gap: 28,
  },
  field: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
    lineHeight: 23,
  },
  elderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  elderChip: {
    height: 31,
    paddingHorizontal: 14,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: '#e6e6e7',
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  elderChipSelected: {
    borderColor: '#fd6941',
  },
  elderChipText: {
    fontSize: 20,
    fontWeight: '400',
    color: '#dadbdc',
    letterSpacing: -0.4,
  },
  elderChipTextSelected: {
    color: '#fd6941',
  },
  textInput: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 11,
  },
  uploadTile: {
    width: 100,
    height: 100,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e6e6e7',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadIcon: {
    marginBottom: 4,
  },
  uploadText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#c1c2c3',
    letterSpacing: -0.24,
  },
  photoTileWrapper: {
    width: 100,
    height: 106,
    justifyContent: 'flex-end',
  },
  photoTile: {
    width: 100,
    height: 100,
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  photoTileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  photoDelete: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
    elevation: 2,
  },
  photoDeleteIcon: {
    transform: [{ rotate: '45deg' }],
  },
  memoBox: {
    height: 99,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
  },
  memoInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 24,
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
  memoCount: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    fontSize: 14,
    fontWeight: '400',
    color: '#c1c2c3',
    letterSpacing: -0.28,
  },
  yearInputWrapper: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  yearInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
  buttonRow: {
    marginTop: -8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  cancelButton: {
    width: 164,
    height: 35,
    borderRadius: 5,
    backgroundColor: '#fed7cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  saveButton: {
    width: 164,
    height: 35,
    borderRadius: 5,
    backgroundColor: '#fd6941',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  pressed: {
    opacity: 0.85,
  },
});
