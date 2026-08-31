import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Home, Album, Report, Quiz, Setting } from './Icon';

export type NavigationTab = 'Home' | 'Album' | 'Report' | 'Quiz' | 'Setting';

interface BottomNavigationProps {
  activeTab: NavigationTab;
  tabs?: NavigationTab[];
}

const TAB_LABELS: Record<NavigationTab, string> = {
  Home: '홈',
  Album: '앨범',
  Report: '리포트',
  Quiz: '퀴즈',
  Setting: '설정',
};

const ICON_COMPONENTS: Record<NavigationTab, React.ComponentType<{ size?: number; color?: string }>> = {
  Home,
  Album,
  Report,
  Quiz,
  Setting,
};

const TAB_ROUTES: Record<NavigationTab, Href> = {
  Home: '/',
  Album: '/album',
  Report: '/report',
  Quiz: '/quiz',
  Setting: '/my-page' as Href,
};

const TABS: NavigationTab[] = ['Home', 'Album', 'Report', 'Setting'];

const ACTIVE_COLOR = '#fd6941';
const INACTIVE_COLOR = '#dadbdc';

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, tabs = TABS }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const tabColor = isActive ? ACTIVE_COLOR : INACTIVE_COLOR;
          const IconComponent = ICON_COMPONENTS[tab];

          return (
            <Pressable
              key={tab}
              style={styles.tabButton}
              onPress={() => router.replace(TAB_ROUTES[tab])}
              disabled={isActive}
            >
              <View style={styles.tabIcon}>
                <IconComponent size={22} color={tabColor} />
              </View>
              <Text style={[styles.tabLabel, { color: tabColor }]}>
                {TAB_LABELS[tab]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'stretch',
    backgroundColor: '#ffffff',
    height: 103,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 45,
    paddingBottom: 18,
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
