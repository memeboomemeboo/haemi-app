import { StyleSheet, Text, View } from 'react-native';
import { Alarm, Setting } from '@/shared/ui/Icon';

export const HomeHeader = () => {
  return (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Text style={styles.logo}>해미</Text>
      </View>
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
  logoContainer: {
    flex: 1,
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fd6941',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
});
