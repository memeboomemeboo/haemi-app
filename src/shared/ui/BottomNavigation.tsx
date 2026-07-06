import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/shared/hooks';

export type NavigationTab = 'Home' | 'Album' | 'Memory' | 'Report' | 'Quiz';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

const TAB_LABELS: Record<NavigationTab, string> = {
  Home: '홈',
  Album: '앨범',
  Memory: '추억',
  Report: '리포트',
  Quiz: '퀴즈',
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const tabs: NavigationTab[] = ['Home', 'Album', 'Memory', 'Report', 'Quiz'];

  // Icon size from spacing tokens
  const ICON_CONTAINER_SIZE = spacing['3xl'];
  const ICON_SIZE = spacing.xl;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.normal,
      paddingVertical: spacing.md,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: spacing.xs,
      elevation: 3,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      gap: spacing.xl,
    },
    tabButton: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    tabIcon: {
      width: ICON_CONTAINER_SIZE,
      height: ICON_CONTAINER_SIZE,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabLabel: {
      fontSize: typography.body.medium.fontSize,
      fontWeight: typography.body.medium.fontWeight,
      lineHeight: typography.body.medium.lineHeight,
      letterSpacing: typography.body.medium.letterSpacing,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const tabColor = isActive ? colors.primary : colors.line.neutral;

          return (
            <Pressable
              key={tab}
              style={styles.tabButton}
              onPress={() => onTabChange(tab)}
              disabled={isActive}
            >
              <View style={styles.tabIcon}>
                {/* Icon placeholder - SVG icons should be imported and rendered here */}
                <View
                  style={{
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                    backgroundColor: tabColor,
                    borderRadius: borderRadius.xs,
                    opacity: 0.5,
                  }}
                />
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: tabColor,
                  },
                ]}
              >
                {TAB_LABELS[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};