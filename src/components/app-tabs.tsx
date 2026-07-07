import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
  type TabListProps,
} from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HaemiIcon, type HaemiIconName } from '@/components/haemi-icons';

const ORANGE = '#fd6941';
const LINE = '#dadbdc';
const NAV_HEIGHT = 73;

type TabButtonProps = TabTriggerSlotProps & {
  icon: HaemiIconName;
  label: string;
};

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <HaemiTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton icon="home" label="홈" />
          </TabTrigger>
          <TabTrigger name="album" href="/album" asChild>
            <TabButton icon="album" label="앨범" />
          </TabTrigger>
          <TabTrigger name="family-memories" href="/family-memories" asChild>
            <TabButton icon="heart" label="추억" />
          </TabTrigger>
          <TabTrigger name="report" href="/report" asChild>
            <TabButton icon="report" label="리포트" />
          </TabTrigger>
          <TabTrigger name="quiz" href="/quiz" asChild>
            <TabButton icon="quiz" label="퀴즈" />
          </TabTrigger>
        </HaemiTabList>
      </TabList>
    </Tabs>
  );
}

function TabButton({ icon, label, isFocused, ...props }: TabButtonProps) {
  const color = isFocused ? ORANGE : LINE;

  return (
    <Pressable {...props} style={({ pressed }) => [styles.tabButton, pressed && styles.pressed]}>
      <HaemiIcon name={icon} color={color} size={30} filled={icon === 'heart' && isFocused} />
      <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function HaemiTabList(props: TabListProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={styles.tabListOuter}>
      <View
        {...props}
        style={[
          styles.tabList,
          {
            minHeight: NAV_HEIGHT + Math.max(insets.bottom, 0),
            paddingBottom: Math.max(insets.bottom, 8),
          },
        ]}>
        {props.children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: '100%',
  },
  tabListOuter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
  },
  tabList: {
    width: '100%',
    paddingTop: 10,
    paddingHorizontal: 30,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 8,
  },
  tabButton: {
    width: 56,
    minHeight: 55,
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 4,
  },
  tabLabel: {
    color: LINE,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '500',
    textAlign: 'center',
    includeFontPadding: false,
  },
  tabLabelActive: {
    color: ORANGE,
  },
  pressed: {
    opacity: 0.72,
  },
});
