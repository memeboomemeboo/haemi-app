import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

type CircleType = 'Check' | 'Default';

interface CircleProps {
  type?: CircleType;
}

// Figma MCP 에셋들 (128-3089, 128-3093)
const CIRCLE_CHECK_SVG = 'http://localhost:3845/assets/1d1c4950800c10f55dc78edb2dfb45021d90dad6.svg';
const CIRCLE_DEFAULT_SVG = 'http://localhost:3845/assets/4c90b4422512b24fb05ab1fae31bf08d9b870169.svg';

/**
 * Figma 128-3089/128-3093: 25×25 원형 배지
 * - Check: 주황색 테두리 + 체크 마크 (inset-[8.33%])
 * - Default: 주황색 테두리 + 작은 원 (inset-[12.5%])
 */
export const Circle = ({ type = 'Check' }: CircleProps) => {
  return (
    <View style={styles.circle}>
      {type === 'Check' ? (
        <Image
          source={CIRCLE_CHECK_SVG}
          style={styles.icon}
          contentFit="contain"
        />
      ) : (
        <Image
          source={CIRCLE_DEFAULT_SVG}
          style={styles.icon}
          contentFit="contain"
        />
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
  icon: {
    width: 25,
    height: 25,
  },
});
