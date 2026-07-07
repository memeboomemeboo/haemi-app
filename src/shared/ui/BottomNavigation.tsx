import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { Home, Album, Heart, Report, Quiz } from './Icon';

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

const ICON_COMPONENTS: Record<NavigationTab, React.ComponentType<{ size?: number; color?: string }>> = {
  Home,
  Album,
  Memory: Heart,
  Report,
  Quiz,
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: NavigationTab[] = ['Home', 'Album', 'Memory', 'Report', 'Quiz'];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      height: 73,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.03,
      shadowRadius: 2,
      elevation: 3,
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 32,
      paddingHorizontal: 20,
    },
    tabButton: {
      alignItems: 'center',
      gap: 4,
    },
    tabIcon: {
      width: 34,
      height: 34,
      justifyContent: 'center',
      alignItems: 'center',
    },
    tabLabel: {
      fontSize: 16,
      fontWeight: '500',
      lineHeight: 20.8,
      letterSpacing: -0.32,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const tabColor = isActive ? '#fd6941' : '#dadbdc';
          const IconComponent = ICON_COMPONENTS[tab];

          return (
            <Pressable
              key={tab}
              style={styles.tabButton}
              onPress={() => onTabChange(tab)}
              disabled={isActive}
            >
              <View style={styles.tabIcon}>
                <IconComponent size={20} color={tabColor} />
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