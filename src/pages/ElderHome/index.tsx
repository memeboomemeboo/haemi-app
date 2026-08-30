import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useElderHomeSummary } from '@/entities/elderHome';
import { useElderProfile } from '@/entities/elder';
import { formatKoreanDate } from '@/shared/lib';
import { useTheme } from '@/shared/hooks';
import {
  ElderActivityCard,
  ElderDailyMessageCard,
  ElderHomeHeader,
  ElderMemoryCard,
} from '@/widgets';

/** 어르신 홈 화면 (Figma node 1408:5601 / 1472:3034 / 1438:2697) */
export default function ElderHomeScreen() {
  const router = useRouter();
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { profile } = useElderProfile();
  const { summary } = useElderHomeSummary();

  const goToAlbum = (albumId?: string) => {
    if (albumId) {
      router.push({ pathname: '/album/[id]', params: { id: albumId } });
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <ElderHomeHeader
          honorificName={profile?.honorificName ?? ''}
          dateLabel={formatKoreanDate()}
        />

        <ElderActivityCard onStartPress={() => router.push('/quiz')} />

        {summary && (
          <View style={styles.notificationGroup}>
            <ElderMemoryCard
              notification={summary.memory}
              onPress={() => goToAlbum(summary.memory.albumId)}
            />
            <ElderDailyMessageCard
              notification={summary.dailyMessage}
              onPress={() => goToAlbum(summary.dailyMessage.albumId)}
            />
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}

const createStyles = ({ colors }: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.normal,
    },
    safeArea: {
      flex: 1,
      paddingHorizontal: 27,
      paddingTop: 14,
      gap: 41,
    },
    notificationGroup: {
      gap: 22,
    },
  });
