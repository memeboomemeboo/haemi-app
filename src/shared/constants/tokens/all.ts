// All Design Tokens Combined
import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius } from './spacing';

export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
} as const;

export type Tokens = typeof tokens;
