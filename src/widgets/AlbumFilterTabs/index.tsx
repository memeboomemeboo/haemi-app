import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AlbumFilter, AlbumFilterOption } from '@/entities/album';

interface AlbumFilterTabsProps {
  options: AlbumFilterOption[];
  value: AlbumFilter;
  onChange: (filter: AlbumFilter) => void;
}

/** 앨범을 전달받는 어르신별로 필터링하는 탭 (Figma node 1326:9462 / 1325:8142) */
export const AlbumFilterTabs = ({ options, value, onChange }: AlbumFilterTabsProps) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]} numberOfLines={1}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 35,
    backgroundColor: '#e6e6e7',
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    gap: 4,
    width: '100%',
  },
  tab: {
    flex: 1,
    height: 25,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: '#ffffff',
  },
  tabLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5a5c5d',
    letterSpacing: -0.36,
    lineHeight: 23,
    textAlign: 'center',
  },
  tabLabelSelected: {
    color: '#3c3e3f',
  },
});
