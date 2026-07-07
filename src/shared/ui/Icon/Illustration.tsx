import React from 'react';
import { ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { ILLUSTRATIONS, IllustrationName } from './illustrations';

interface IllustrationProps {
  name: IllustrationName;
  width: number;
  height: number;
  style?: ViewStyle;
}

/** Figma에서 추출한 다색 일러스트. 색상이 고정되어 있어 color prop을 받지 않는다. */
export const Illustration: React.FC<IllustrationProps> = ({ name, width, height, style }) => (
  <SvgXml xml={ILLUSTRATIONS[name]} width={width} height={height} style={style} />
);

export type { IllustrationName };
