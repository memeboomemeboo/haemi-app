import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createAlbum, updateAlbumPhotoMemo, uploadAlbumPhoto } from '@/shared/api/albums';
import {
  Arrow,
  BottomNavigation,
  Calendar,
  CheckMark,
  Close,
  Map,
  Picture,
  Plus,
} from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

const MEMO_MAX_LENGTH = 200;

// TODO: API 연결 시 가족 구성원 목록 조회(GET /family/members)로 대체
const FAMILY_CANDIDATES = ['언니', '남동생'];

export default function AlbumRegisterScreen() {
  const router = useRouter();
  const { albumId: existingAlbumId } = useLocalSearchParams<{ albumId?: string }>();
  const insets = useSafeAreaInsets();

  const [photo, setPhoto] = useState<{
    uri: string;
    fileName: string;
    mimeType: string;
  } | null>(null);
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [family, setFamily] = useState<string[]>(['아버지', '어머니']);
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  const [memo, setMemo] = useState('');
  const chipAddRef = useRef<View>(null);

  // + 버튼 위치를 측정해 바로 아래에 드롭다운을 띄운다 (Figma 109-568)
  const openFamilyPicker = () => {
    chipAddRef.current?.measureInWindow((x, y, width, height) => {
      setPickerPosition({ top: y + height + 6, left: x + width / 2 - 52 });
      setShowFamilyPicker(true);
    });
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('권한이 필요해요', '사진을 선택하려면 갤러리 접근 권한을 허용해주세요.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.9,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setPhoto({
          uri: asset.uri,
          fileName: asset.fileName || 'photo.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
        });
      }
    } catch {
      Alert.alert('사진을 불러오지 못했어요', '잠시 후 다시 시도해주세요.');
    }
  };

  const toggleFamilyMember = (name: string) => {
    setFamily((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name]
    );
  };

  const handleSave = async () => {
    try {
      if (family.length === 0) {
        Alert.alert('가족 구성원을 최소 1명 이상 추가해주세요.');
        return;
      }

      const albumId = existingAlbumId || (await createAlbum()).albumId;

      if (photo) {
        const [uploadedPhoto] = await uploadAlbumPhoto(albumId, photo);

        if (uploadedPhoto && (date || location || memo)) {
          await updateAlbumPhotoMemo(albumId, uploadedPhoto.photoId, {
            timePeriod: date || undefined,
            locationText: location || undefined,
            memo: memo || undefined,
          });
        }
      }

      Alert.alert('앨범이 등록되었습니다.');
      router.replace({ pathname: '/album', params: { albumId } });
    } catch (error) {
      Alert.alert('앨범 등록 실패', error instanceof Error ? error.message : '알 수 없는 오류 발생');
    }
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
          <Text style={styles.title}>앨범 등록</Text>
        </View>

        {/* 이미지 업로드 카드 */}
        <Pressable style={styles.uploadCard} onPress={pickImage}>
          {photo && <Image source={{ uri: photo.uri }} style={styles.uploadImage} />}
          {!photo && <Picture size={40} color="#dadbdc" />}
          {!photo && (
            <>
              <View style={styles.uploadTextGroup}>
                <Text style={styles.uploadLabel}>Before 사진</Text>
                <Text style={styles.uploadHint}>이미지를 업로드하세요</Text>
              </View>
              <View style={styles.uploadButton}>
                <Text style={styles.uploadButtonText}>이미지 업로드</Text>
              </View>
            </>
          )}
        </Pressable>

        {/* 입력 필드 */}
        <View style={styles.fields}>
          <View style={styles.twoColumnRow}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>시기</Text>
              <View style={styles.fieldInputGroup}>
                <Calendar size={20} color={date ? '#76787a' : '#dadbdc'} />
                <TextInput
                  value={date}
                  onChangeText={setDate}
                  placeholder="2026.07."
                  placeholderTextColor="#dadbdc"
                  style={styles.fieldInput}
                />
              </View>
            </View>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>장소</Text>
              <View style={styles.fieldInputGroup}>
                <Map size={20} color={location ? '#76787a' : '#dadbdc'} />
                <TextInput
                  value={location}
                  onChangeText={setLocation}
                  placeholder="장소"
                  placeholderTextColor="#dadbdc"
                  style={styles.fieldInput}
                />
              </View>
            </View>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.fieldLabel}>가족</Text>
            <View style={styles.chipsRow}>
              {family.map((name) => (
                <View key={name} style={styles.chip}>
                  <Text style={styles.chipText}>{name}</Text>
                </View>
              ))}
              <View ref={chipAddRef} collapsable={false}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showFamilyPicker ? '가족 선택 닫기' : '가족 추가'}
                  style={styles.chipAdd}
                  onPress={openFamilyPicker}
                >
                  {showFamilyPicker ? (
                    <Close size={12} color="#fd6941" />
                  ) : (
                    <Plus size={12} color="#fd6941" />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.fullField}>
            <Text style={styles.fieldLabel}>메모</Text>
            <View style={styles.memoBox}>
              <TextInput
                multiline
                maxLength={MEMO_MAX_LENGTH}
                value={memo}
                onChangeText={setMemo}
                placeholder="메모 내용을 입력해주세요."
                placeholderTextColor="#c1c2c3"
                style={styles.memoInput}
                textAlignVertical="top"
              />
              <Text style={styles.memoCount}>
                {memo.length}/{MEMO_MAX_LENGTH}
              </Text>
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

      {/* 가족 추가 드롭다운 (Figma 109-568): + 버튼 아래 팝오버, 선택 항목은 체크 표시 */}
      <Modal
        visible={showFamilyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFamilyPicker(false)}
      >
        <Pressable style={styles.dropdownBackdrop} onPress={() => setShowFamilyPicker(false)}>
          <View style={[styles.dropdown, { top: pickerPosition.top, left: pickerPosition.left }]}>
            <View style={styles.dropdownInner}>
              {FAMILY_CANDIDATES.map((name, index) => {
                const isSelected = family.includes(name);
                return (
                  <Pressable
                    key={name}
                    style={[
                      styles.dropdownRow,
                      isSelected && styles.dropdownRowSelected,
                      index < FAMILY_CANDIDATES.length - 1 && styles.dropdownRowDivider,
                    ]}
                    onPress={() => toggleFamilyMember(name)}
                  >
                    <View style={styles.dropdownCheckSlot}>
                      {isSelected && <CheckMark size={13} color="#fd6035" />}
                    </View>
                    <Text style={styles.dropdownRowText}>{name}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>
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
    gap: 28,
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
  uploadCard: {
    height: 165,
    borderWidth: 1.5,
    borderColor: '#f7f7f7',
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    overflow: 'hidden',
  },
  uploadImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  uploadTextGroup: {
    alignItems: 'center',
    gap: 2,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  uploadHint: {
    fontSize: 14,
    fontWeight: '500',
    color: '#c1c2c3',
    letterSpacing: -0.28,
    lineHeight: 18,
  },
  uploadButton: {
    borderWidth: 1,
    borderColor: '#e8e8e9',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c1c2c3',
    letterSpacing: -0.28,
    lineHeight: 18,
  },
  fields: {
    gap: 26,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 9,
  },
  halfField: {
    flex: 1,
    gap: 6,
  },
  fullField: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
    lineHeight: 23,
  },
  fieldInputGroup: {
    height: 47,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldInput: {
    flex: 1,
    padding: 0,
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 30,
    paddingHorizontal: 13,
    borderRadius: 7,
    backgroundColor: '#fed7cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fd6941',
    letterSpacing: -0.32,
    lineHeight: 21,
  },
  chipAdd: {
    width: 30,
    height: 30,
    borderRadius: 100,
    backgroundColor: '#fff3f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoBox: {
    height: 99,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    overflow: 'hidden',
  },
  memoInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
  },
  memoCount: {
    position: 'absolute',
    right: 12,
    bottom: 6,
    fontSize: 14,
    fontWeight: '400',
    color: '#c1c2c3',
    letterSpacing: -0.28,
    lineHeight: 18,
  },
  buttonRow: {
    marginTop: 20,
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
    color: '#fed7cd',
    letterSpacing: -0.4,
    lineHeight: 26,
  },
  pressed: {
    opacity: 0.85,
  },
  // 가족 추가 드롭다운 (Figma 109-568): 104px 팝오버, 어두운 배경 없음
  dropdownBackdrop: {
    flex: 1,
  },
  dropdown: {
    position: 'absolute',
    width: 104,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  dropdownInner: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  dropdownRow: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
  },
  dropdownRowSelected: {
    backgroundColor: '#fff3f0',
  },
  dropdownRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#fed7cd',
  },
  dropdownCheckSlot: {
    width: 21,
    justifyContent: 'center',
  },
  dropdownRowText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fd6035',
    letterSpacing: -0.36,
    lineHeight: 23,
  },
});
