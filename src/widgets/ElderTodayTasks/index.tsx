import { View, StyleSheet, Pressable, Text } from 'react-native';

import { Picture, Heart, Sent } from '@/shared/ui';

export interface TaskStatus {
  greetingCompleted: boolean;
  trainingCompleted: boolean;
  memoryCompleted: boolean;
}

interface TaskItem {
  key: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  isCompleted: boolean;
}

interface ElderTodayTasksProps {
  status?: TaskStatus;
  onTaskPress?: (taskIndex: number) => void;
}

export function ElderTodayTasks({ status, onTaskPress }: ElderTodayTasksProps) {
  const tasks: TaskItem[] = [
    { key: 'greeting', icon: Picture, label: '가족의\n이야기 듣기', isCompleted: status?.greetingCompleted ?? false },
    { key: 'training', icon: Heart,   label: '인지 훈련',          isCompleted: status?.trainingCompleted ?? false },
    { key: 'memory',   icon: Sent,    label: '새 추억 답장',        isCompleted: status?.memoryCompleted ?? false },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 해미</Text>

      <View style={styles.grid}>
        {tasks.map((task, index) => (
          <Pressable
            key={task.key}
            accessibilityRole="button"
            accessibilityLabel={task.label}
            onPress={() => onTaskPress?.(index)}
            style={({ pressed }) => [
              styles.card,
              task.isCompleted && styles.cardCompleted,
              pressed && styles.cardPressed,
            ]}
          >
            <View style={styles.iconContainer}>
              <task.icon size={60} color={task.isCompleted ? '#fd6941' : '#5a5c5d'} />
            </View>
            <Text style={[styles.label, task.isCompleted && styles.labelCompleted]}>
              {task.label}
            </Text>
            <Text style={[styles.status, task.isCompleted && styles.statusCompleted]}>
              {task.isCompleted ? '완료' : '미완료'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fafafa',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#e8e8e9',
    padding: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 36.4,
    letterSpacing: -0.56,
    color: '#3c3e3f',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 180,
    backgroundColor: '#dadbdc',
  },
  cardCompleted: {
    backgroundColor: '#fff3f0',
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 23.4,
    letterSpacing: -0.36,
    color: '#5a5c5d',
    textAlign: 'center',
    marginTop: 8,
  },
  labelCompleted: {
    color: '#fd6941',
  },
  status: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23.4,
    letterSpacing: -0.36,
    color: '#5a5c5d',
    marginTop: 4,
  },
  statusCompleted: {
    color: '#fd6941',
  },
});
