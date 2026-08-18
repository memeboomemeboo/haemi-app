import { View, StyleSheet, Pressable, Text } from 'react-native';
import { Picture, Heart, Sent } from '@/shared/ui';

interface TaskItem {
  icon: React.ComponentType<{ size: number; color: string }>;
  label: string;
  isCompleted: boolean;
}

const tasks: TaskItem[] = [
  {
    icon: Picture,
    label: '가족의\n이야기 듣기',
    isCompleted: true,
  },
  {
    icon: Heart,
    label: '인지 훈련',
    isCompleted: true,
  },
  {
    icon: Sent,
    label: '새 추억 답장',
    isCompleted: true,
  },
];

interface ElderTodayTasksProps {
  onTaskPress?: (taskIndex: number) => void;
}

export const ElderTodayTasks = ({ onTaskPress }: ElderTodayTasksProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘의 해미</Text>

      <View style={styles.tasksGrid}>
        {tasks.map((task, index) => (
          <Pressable
            key={index}
            onPress={() => onTaskPress?.(index)}
            style={({ pressed }) => [
              styles.taskCard,
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <View style={styles.taskIconContainer}>
              <task.icon size={60} color="#5a5c5d" />
            </View>
            <Text style={styles.taskLabel}>{task.label}</Text>
            <Text style={styles.taskStatus}>완료</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

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
  tasksGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 8,
    minHeight: 180,
    justifyContent: 'center',
    backgroundColor: '#dadbdc',
  },
  taskIconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskLabel: {
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 23.4,
    letterSpacing: -0.36,
    color: '#5a5c5d',
    textAlign: 'center',
    marginTop: 8,
  },
  taskStatus: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23.4,
    letterSpacing: -0.36,
    color: '#5a5c5d',
    marginTop: 4,
  },
});
