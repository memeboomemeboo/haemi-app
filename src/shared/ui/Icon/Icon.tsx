import React, { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { IconName, IconProps } from './types';
import { ICON_SVG_MAP } from './icons';

/** CLAUDE.md 문서화된 아이콘 크기 (px) */
export const ICON_SIZES = {
  xs: 8,
  sm: 16,
  md: 20,
  lg: 40,
  xl: 48,
} as const;

const IconComponent: React.FC<IconProps> = ({
  name,
  size = ICON_SIZES.md,
  color = '#0c0c0d',
  style,
}) => {
  const xml = useMemo(
    () => ICON_SVG_MAP[name].replace(/currentColor/g, color),
    [name, color],
  );

  return <SvgXml xml={xml} width={size} height={size} style={style} />;
};

export { IconComponent as Icon };
export type { IconName, IconProps };
