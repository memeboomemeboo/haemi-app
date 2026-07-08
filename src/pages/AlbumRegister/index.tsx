import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Arrow,
  BottomNavigation,
  Calendar,
  CheckMark,
  Map,
  People,
  Picture,
  Plus,
  Report,
} from '@/shared/ui';
import { HomeHeader } from '@/widgets/HomeHeader';

const MEMO_MAX_LENGTH = 200;

// TODO: API 연결 시 가족 구성원 목록 조회(GET /family/members)로 대체
const FAMILY_CANDIDATES = ['언니', '남동생'];

export default function AlbumRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [date, setDate] = useState('1999.04.');
  const [location, setLocation] = useState('어린이 대공원');
  const [family, setFamily] = useState<string[]>(['아버지', '어머니']);
  const [showFamilyPicker, setShowFamilyPicker] = useState(false);
  const [memo, setMemo] = useState('가족끼리 나들이에 갔던 날이에요');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const toggleFamilyMember = (name: string) => {
    setFamily((current) =>
      current.includes(name) ? current.filter((n) => n !== name) : [...current, name]
    );
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
          <Text style={styles.title}>앨범 등록</Text>
        </View>

        {/* 이미지 업로드 카드 */}
        <Pressable style={styles.uploadCard} onPress={pickImage}>
          {photoUri && <Image source={{ uri: photoUri }} style={styles.uploadImage} />}
          {!photoUri && <Picture size={40} color="#dadbdc" />}
          {!photoUri && (
            <>
              <View style={styles.uploadTextGroup}>
                <Text style={styles.uploadLabel}>앨범 사진</Text>
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
          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <Calendar size={24} color="#76787a" />
              <Text style={styles.fieldLabel}>시기</Text>
            </View>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="예: 1999.04."
              placeholderTextColor="#c1c2c3"
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <Map size={24} color="#76787a" />
              <Text style={styles.fieldLabel}>장소</Text>
            </View>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="장소를 입력하세요"
              placeholderTextColor="#c1c2c3"
              style={styles.fieldInput}
            />
          </View>

          <View style={styles.fieldRow}>
            <View style={styles.fieldLabelGroup}>
              <People size={26} color="#76787a" />
              <Text style={styles.fieldLabel}>가족</Text>
            </View>
            <View style={styles.chipsRow}>
              {family.map((name) => (
                <View key={name} style={styles.chip}>
                  <Text style={styles.chipText}>{name}</Text>
                </View>
              ))}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="가족 추가"
                style={styles.chipAdd}
                onPress={() => setShowFamilyPicker(true)}
              >
                <Plus size={12} color="#fd6941" />
              </Pressable>
            </View>
          </View>

          <View style={[styles.fieldRow, styles.fieldRowTop]}>
            <View style={styles.fieldLabelGroup}>
              <Report size={22} color="#76787a" />
              <Text style={styles.fieldLabel}>메모</Text>
            </View>
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

      {/* 가족 선택 모달 */}
      <Modal
        visible={showFamilyPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowFamilyPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowFamilyPicker(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>가족 추가</Text>
            <ScrollView style={styles.familyList} showsVerticalScrollIndicator={false}>
              {FAMILY_CANDIDATES.filter((name) => !family.includes(name)).map((name) => (
                <Pressable
                  key={name}
                  style={styles.familyItem}
                  onPress={() => {
                    toggleFamilyMember(name);
                    setShowFamilyPicker(false);
                  }}
                >
                  <Text style={styles.familyItemText}>{name}</Text>
                  <CheckMark size={20} color="#fd6941" />
                </Pressable>
              ))}
            </ScrollView>
          </Pressable>
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
    paddingHorizontal: 23,
    paddingBottom: 40,
    gap: 37,
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
    height: 189,
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
    gap: 28,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fieldRowTop: {
    alignItems: 'flex-start',
  },
  fieldLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  fieldLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
    lineHeight: 23,
  },
  fieldInput: {
    width: 254,
    height: 37,
    borderRadius: 10,
    backgroundColor: '#f7f7f7',
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.36,
  },
  chipsRow: {
    width: 252,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chip: {
    height: 23,
    paddingHorizontal: 10,
    borderRadius: 5,
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
    width: 26,
    height: 26,
    borderRadius: 100,
    backgroundColor: '#fff3f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memoBox: {
    width: 254,
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
    marginTop: 31,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3c3e3f',
    marginBottom: 16,
    letterSpacing: -0.36,
  },
  familyList: {
    maxHeight: 200,
  },
  familyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  familyItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#76787a',
    letterSpacing: -0.32,
  },
});
