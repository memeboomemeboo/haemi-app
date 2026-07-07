import { StyleSheet, Text, View } from 'react-native';

export const HomeHeader = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.logo}>해미</Text>
      <View style={styles.headerIcons}>
        <View style={styles.iconPlaceholder} />
        <View style={styles.iconPlaceholder} />
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
  },
  logo: {
    fontSize: 24,
    fontWeight: '600',
    color: '#fd6941',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 17,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: '#d1d5db',
    borderRadius: 4,
  },
});
