import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useUserContext } from '@/shared/context/UserContext';
import { HomeHeader } from '@/widgets/HomeHeader';
import { ElderTodayTasks } from '@/widgets/ElderTodayTasks';
import { BottomNavigation } from '@/shared/ui';

export default function ElderHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { group } = useUserContext();

  const userName = group?.members?.[0]?.relation || '어르신';

  const handleTaskPress = (index: number) => {
    if (index === 1) {
      router.push('/quiz');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <HomeHeader />
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            {`${userName} 해미에\n오신것을 환영해요!`}
          </Text>
        </View>

        {/* Today's Tasks */}
        <View style={styles.tasksContainer}>
          <ElderTodayTasks onTaskPress={handleTaskPress} />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Pressable
            onPress={() => router.push('/album')}
            style={({ pressed }) => [
              styles.actionButton,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={styles.actionButtonText}>추억 앨범</Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/album')}
            style={({ pressed }) => [
              styles.actionButton,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text style={styles.actionButtonText}>설정</Text>
          </Pressable>
        </View>
      </ScrollView>

      <BottomNavigation activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  welcomeSection: {
    marginBottom: 40,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: '#3c3e3f',
    textAlign: 'center',
  },
  tasksContainer: {
    marginBottom: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 69,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#e8e8e9',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: '#5a5c5d',
  },
});
