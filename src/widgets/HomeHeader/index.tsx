import { Image, StyleSheet, View } from 'react-native';
import { Alarm, Setting } from '@/shared/ui/Icon';

const logoSource = require('../../../assets/images/haemi-logo.png');

export const HomeHeader = () => {
  return (
    <View style={styles.header}>
      <Image source={logoSource} style={styles.logo} resizeMode="contain" />
      <View style={styles.headerIcons}>
        <Alarm size={22} color="#dadbdc" />
        <Setting size={24} color="#dadbdc" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 31,
    paddingHorizontal: 0,
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
