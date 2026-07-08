import { Pressable, StyleSheet, Text, View } from 'react-native';

export type AlbumFilter = 'all' | 'period' | 'place' | 'person';

const FILTERS: { value: AlbumFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'period', label: '시기' },
  { value: 'place', label: '장소' },
  { value: 'person', label: '인물' },
];

interface AlbumFilterTabsProps {
  value: AlbumFilter;
  onChange: (filter: AlbumFilter) => void;
}

export const AlbumFilterTabs = ({ value, onChange }: AlbumFilterTabsProps) => {
  return (
    <View style={styles.container}>
      {FILTERS.map((filter) => {
        const isSelected = filter.value === value;
        return (
          <Pressable
            key={filter.value}
            style={[styles.tab, isSelected && styles.tabSelected]}
            onPress={() => onChange(filter.value)}
          >
            <Text style={[styles.tabLabel, isSelected && styles.tabLabelSelected]}>
              {filter.label}
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
    justifyContent: 'center',
    gap: 24,
    width: '100%',
  },
  tab: {
    width: 69,
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
