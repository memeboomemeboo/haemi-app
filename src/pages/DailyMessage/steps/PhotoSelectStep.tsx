import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '@/shared/hooks';

interface PhotoSelectStepProps {
  onPicked: () => void;
  onCancelled: () => void;
}

/** 사진 고르기 — 갤러리에서 사진 한 장을 고르면 바로 완료 화면으로 이동한다 */
export function PhotoSelectStep({ onPicked, onCancelled }: PhotoSelectStepProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const hasLaunchedRef = useRef(false);

  useEffect(() => {
    if (hasLaunchedRef.current) return;
    hasLaunchedRef.current = true;

    const pickPhoto = async () => {
      try {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert('권한이 필요해요', '사진을 선택하려면 갤러리 접근 권한을 허용해주세요.');
          onCancelled();
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: false,
          quality: 0.9,
        });

        if (result.canceled || result.assets.length === 0) {
          onCancelled();
          return;
        }

        onPicked();
      } catch {
        Alert.alert('사진을 불러오지 못했어요', '잠시 후 다시 시도해주세요.');
        onCancelled();
      }
    };

    void pickPhoto();
  }, [onCancelled, onPicked]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>사진을 고르고 있어요...</Text>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 20,
      paddingTop: 160,
    },
    text: {
      fontSize: 24,
      fontWeight: '500',
      letterSpacing: -0.48,
      color: colors.label.alternative,
    },
  });
