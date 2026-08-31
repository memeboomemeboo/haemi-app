import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type CircleType = 'Check' | 'Default';

interface CircleProps {
  type?: CircleType;
}

/**
 * Figma 128-3089/128-3093: 25×25 원형 배지
 * - Check: 주황색 테두리 + 체크 마크 (inset-[8.33%])
 * - Default: 주황색 테두리 + 작은 원 (inset-[12.5%])
 */
export const Circle = ({ type = 'Check' }: CircleProps) => {
  return (
    <View style={styles.circle}>
      {type === 'Check' ? (
        <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
          <Path
            d="M1.5 6.5L4.5 9.5L10.5 2.5"
            stroke="#fd6941"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      ) : (
        <View style={styles.dot} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  circle: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    borderWidth: 1.5,
    borderColor: '#fd6941',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    overflow: 'hidden' as const,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#fd6941',
  },
});
