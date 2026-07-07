import { ViewStyle } from 'react-native';
import type { IconSVGKey } from './icons';

/** 아이콘 이름은 ICON_SVG_MAP의 키에서 자동 유도된다 (단일 소스) */
export type IconName = IconSVGKey;

export interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}
