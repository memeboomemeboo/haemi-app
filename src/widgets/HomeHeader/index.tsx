import { Image, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Alarm, Setting } from '@/shared/ui/Icon';

const logoSource = require('../../../assets/images/haemi-logo-small.png');

interface HomeHeaderProps {
  onAlarmPress?: () => void;
  onSettingPress?: () => void;
  showSetting?: boolean;
  /** 페이지별 여백(마진 등)은 페이지가 제어한다 */
  style?: ViewStyle;
}

export const HomeHeader = ({
  onAlarmPress,
  onSettingPress,
  showSetting = true,
  style,
}: HomeHeaderProps) => {
  return (
    <View style={[styles.header, style]}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerIcons}>
        <Pressable onPress={onAlarmPress} hitSlop={8}>
          <Alarm size={22} color="#dadbdc" />
        </Pressable>
        {showSetting && (
          <Pressable onPress={onSettingPress} hitSlop={8}>
            <Setting size={24} color="#dadbdc" />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 62,
    height: 24,
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
});
