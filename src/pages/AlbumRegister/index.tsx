import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { createAlbumItem } from '@/entities/album';
import { myPageService } from '@/shared/api';
import { useAsyncData, useTheme } from '@/shared/hooks';
import { Arrow, BottomNavigation, Calendar, Picture, Plus } from '@/shared/ui';

const MEMO_MAX_LENGTH = 200;
const MAX_PHOTOS = 4;
const fetchGuardianProfile = () => myPageService.getProfile();

export default function AlbumRegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { colors } = theme;
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { data: profile, isLoading: isProfileLoading } = useAsyncData(fetchGuardianProfile);
  const [elderId, setElderId] = useState('');
  const [title, setTitle] = useState('어린 시절 고향');
  // 같은 사진을 두 번 고를 수도 있으므로 uri가 아닌 별도 id로 각 항목을 구분한다
  const [photos, setPhotos] = useState<
    { id: string; uri: string; fileName: string; contentType: string; sizeBytes?: number }[]
  >([]);
  const [memo, setMemo] = useState('가족끼리 나들이에 갔던 날이에요');
  const [question, setQuestion] = useState('이 사진, 기억나세요?');
  const [year, setYear] = useState('1975');
  const [isSaving, setIsSaving] = useState(false);
  const selectedElderId = elderId || profile?.elders[0]?.elderId || '';

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const uri = asset.uri;
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setPhotos((current) => [
        ...current,
        {
          id,
          uri,
          fileName: asset.fileName ?? `memory-${id}.jpg`,
          contentType: asset.mimeType ?? 'image/jpeg',
          sizeBytes: asset.fileSize,
        },
      ].slice(0, MAX_PHOTOS));
    }
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => current.filter((photo) => photo.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('추억 이름을 입력해주세요');
      return;
    }
    const selectedElder = profile?.elders.find(
      (candidate) => candidate.elderId === selectedElderId,
    );
    if (!selectedElder) {
      Alert.alert('추억을 전달할 어르신을 선택해주세요');
      return;
    }
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await createAlbumItem({
        title: title.trim(),
        elderId: selectedElder.elderId,
        elderName: selectedElder.name,
        year,
        memo: memo.trim() || undefined,
        photos: photos.map(({ uri, fileName, contentType, sizeBytes }) => ({
          uri,
          fileName,
          contentType,
          sizeBytes,
        })),
        question: question.trim() || undefined,
      });
      router.back();
    } catch {
      Alert.alert('추억을 저장하지 못했어요', '잠시 후 다시 시도해주세요');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Math.max(insets.top, 20) + 28 },
        ]}
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
            <Arrow size={22} color={colors.label.neutral} style={styles.backArrow} />
          </Pressable>
          <Text style={styles.title}>추억 등록</Text>
        </View>

        <View style={styles.formGroup}>
          <View style={styles.fields}>
            {/* 보낼 어르신 */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>보낼 어르신</Text>
              <View style={styles.elderRow}>
                {profile?.elders.map((candidate) => {
                  const isSelected = candidate.elderId === selectedElderId;
                  return (
                    <Pressable
                      key={candidate.elderId}
                      style={[styles.elderChip, isSelected && styles.elderChipSelected]}
                      onPress={() => setElderId(candidate.elderId)}
                    >
                      <Text style={[styles.elderChipText, isSelected && styles.elderChipTextSelected]}>
                        {candidate.name}
                      </Text>
                    </Pressable>
                  );
                })}
                {!isProfileLoading && profile?.elders.length === 0 && (
                  <Text style={styles.noElderText}>등록된 어르신이 없어요</Text>
                )}
              </View>
            </View>

            {/* 추억 이름 */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>추억 이름</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="추억 이름을 입력하세요"
                placeholderTextColor={colors.line.normal}
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
                    <Picture size={40} color={colors.line.normal} style={styles.uploadIcon} />
                    <Text style={styles.uploadText}>
                      사진 {photos.length}/{MAX_PHOTOS}
                    </Text>
                  </Pressable>
                )}
                {photos.map((photo) => (
                  <View key={photo.id} style={styles.photoTileWrapper}>
                    <View style={styles.photoTile}>
                      <Image source={{ uri: photo.uri }} style={styles.photoTileImage} />
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="사진 삭제"
                      style={styles.photoDelete}
                      onPress={() => removePhoto(photo.id)}
                      hitSlop={6}
                    >
                      <Plus size={10} color={colors.label.alternative} style={styles.photoDeleteIcon} />
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
                  placeholderTextColor={colors.line.normal}
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
                placeholderTextColor={colors.line.normal}
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
                  placeholderTextColor={colors.line.normal}
                  keyboardType="number-pad"
                  style={styles.yearInput}
                />
                <Calendar size={17} color={colors.label.assistive} />
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
              style={({ pressed }) => [
                styles.saveButton,
                pressed && styles.pressed,
                isSaving && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isSaving}
            >
              <Text style={styles.saveButtonText}>{isSaving ? '저장 중...' : '저장'}</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Album" />
    </View>
  );
}

const createStyles = ({ colors, palette }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    scroll: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 27,
      paddingBottom: 40,
      // Figma: 헤더(뒤로가기+타이틀)에서 폼 영역까지 25, 폼 내부에서 필드 그룹과 버튼까지 48
      gap: 25,
    },
    formGroup: {
      width: '100%',
      alignItems: 'center',
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
      color: colors.label.neutral,
      letterSpacing: -0.48,
      lineHeight: 31,
    },
    fields: {
      width: '100%',
      gap: 28,
    },
    field: {
      gap: 8,
    },
    fieldLabel: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.36,
      lineHeight: 23,
    },
    elderRow: {
      flexDirection: 'row',
      gap: 8,
    },
    elderChip: {
      width: 80,
      height: 31,
      borderRadius: 100,
      borderWidth: 1,
      borderColor: colors.label.disabled,
      backgroundColor: colors.background.normal,
      justifyContent: 'center',
      alignItems: 'center',
    },
    elderChipSelected: {
      borderColor: colors.primary,
    },
    elderChipText: {
      fontSize: 20,
      fontWeight: '400',
      color: colors.line.neutral,
      letterSpacing: -0.4,
    },
    elderChipTextSelected: {
      color: colors.primary,
    },
    noElderText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.32,
      lineHeight: 21,
    },
    textInput: {
      height: 46,
      borderRadius: 10,
      backgroundColor: colors.background.neutral,
      paddingHorizontal: 16,
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
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
      borderColor: colors.label.disabled,
      backgroundColor: colors.background.alternative,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadIcon: {
      marginBottom: 4,
    },
    uploadText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.line.normal,
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
      backgroundColor: colors.background.normal,
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
      backgroundColor: colors.background.normal,
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
      backgroundColor: colors.background.neutral,
      overflow: 'hidden',
    },
    memoInput: {
      flex: 1,
      paddingHorizontal: 10,
      paddingTop: 12,
      paddingBottom: 24,
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.32,
    },
    memoCount: {
      position: 'absolute',
      right: 12,
      bottom: 6,
      fontSize: 14,
      fontWeight: '400',
      color: colors.line.normal,
      letterSpacing: -0.28,
    },
    yearInputWrapper: {
      height: 46,
      borderRadius: 10,
      backgroundColor: colors.background.neutral,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    yearInput: {
      flex: 1,
      fontSize: 16,
      fontWeight: '500',
      color: colors.label.assistive,
      letterSpacing: -0.32,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 10,
    },
    cancelButton: {
      width: 164,
      height: 35,
      borderRadius: 5,
      backgroundColor: palette.orange[90],
      justifyContent: 'center',
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.primary,
      letterSpacing: -0.4,
      lineHeight: 26,
    },
    saveButton: {
      width: 164,
      height: 35,
      borderRadius: 5,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonDisabled: {
      opacity: 0.6,
    },
    saveButtonText: {
      fontSize: 20,
      fontWeight: '500',
      color: colors.background.normal,
      letterSpacing: -0.4,
      lineHeight: 26,
    },
    pressed: {
      opacity: 0.85,
    },
  });
