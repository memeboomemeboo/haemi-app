import React, { useMemo } from 'react';
import { SvgXml } from 'react-native-svg';
import { spacing } from '@/shared/constants';
import { IconName, IconProps } from './types';
import { ICON_SVG_MAP } from './icons';

export const ICON_SIZES = {
  xs: spacing.xs + spacing.xs,
  sm: spacing.md + spacing.xs,
  md: spacing.xl,
  lg: spacing['2xl'] + spacing.lg,
  xl: spacing['5xl'],
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
export { ICON_SVG_MAP };
