import React from 'react';
import { View, Pressable, Text, StyleSheet, Image } from 'react-native';
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

const ICON_NAMES: Record<NavigationTab, string> = {
  Home: 'home',
  Album: 'album',
  Memory: 'heart',
  Report: 'report',
  Quiz: 'quiz',
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { colors, typography, spacing, borderRadius } = useTheme();
  const tabs: NavigationTab[] = ['Home', 'Album', 'Memory', 'Report', 'Quiz'];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.normal,
      paddingVertical: spacing.md,
      borderTopLeftRadius: borderRadius.lg,
      borderTopRightRadius: borderRadius.lg,
      shadowColor: '#000',
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 3,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
    },
    tabButton: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    tabIcon: {
      width: 34,
      height: 34,
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
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            style={styles.tabButton}
            onPress={() => onTabChange(tab)}
            disabled={activeTab === tab}
          >
            <View style={styles.tabIcon}>
              {/* Icon would be rendered here */}
              <View
                style={{
                  width: 20,
                  height: 20,
                  backgroundColor:
                    activeTab === tab ? colors.primary : colors.line.neutral,
                  borderRadius: borderRadius.xs,
                }}
              />
            </View>
            <Text
              style={[
                styles.tabLabel,
                {
                  color: activeTab === tab ? colors.primary : colors.line.neutral,
                },
              ]}
            >
              {TAB_LABELS[tab]}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};