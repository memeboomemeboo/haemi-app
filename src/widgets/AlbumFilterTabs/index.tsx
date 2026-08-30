import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AlbumFilter, AlbumFilterOption } from '@/entities/album';
import { useTheme } from '@/shared/hooks';

interface AlbumFilterTabsProps {
  options: AlbumFilterOption[];
  value: AlbumFilter;
  onChange: (filter: AlbumFilter) => void;
}

/** 앨범을 전달받는 어르신별로 필터링하는 탭 (Figma node 1326:9462 / 1325:8142) */
export const AlbumFilterTabs = ({ options, value, onChange }: AlbumFilterTabsProps) => {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

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

const createStyles = (colors: ReturnType<typeof useTheme>['colors']) =>
  StyleSheet.create({
    container: {
      height: 35,
      backgroundColor: colors.label.disabled,
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
      backgroundColor: colors.background.normal,
    },
    tabLabel: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.label.alternative,
      letterSpacing: -0.36,
      lineHeight: 23,
      textAlign: 'center',
    },
    tabLabelSelected: {
      color: colors.label.neutral,
    },
  });
