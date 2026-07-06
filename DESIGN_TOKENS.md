# Design Tokens Guide

Design tokens are centralized, reusable values for colors, typography, spacing, and more. All tokens are auto-synced from Figma.

**Figma File**: https://www.figma.com/design/X4ZqDOFVliwS8WQeuWDZnX/해미

## Quick Start

### Import Individual Token Types

```typescript
// Import specific token categories
import { colors, typography, spacing, borderRadius } from '@/shared/constants';

// Or import all tokens
import { tokens } from '@/shared/constants';
```

### Import Token Types

```typescript
import type { Colors, Typography, Spacing, BorderRadius, Tokens } from '@/shared/constants';
```

### Use with Theme Hook

```typescript
import { useTheme } from '@/shared/hooks';

export const MyComponent = () => {
  const { colors, typography, isDark } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background.normal }}>
      <Text style={{ 
        color: colors.label.normal,
        fontSize: typography.body.regular.fontSize,
        fontWeight: typography.body.regular.fontWeight,
      }}>
        Hello
      </Text>
    </View>
  );
};
```

## Color System

### Semantic Colors (Light & Dark)

Light mode:
```typescript
tokens.colors.light.label.normal      // '#0c0c0d'
tokens.colors.light.background.normal // '#ffffff'
tokens.colors.light.line.normal       // '#c1c2c3'
```

Dark mode:
```typescript
tokens.colors.dark.label.normal      // '#f5f5f5'
tokens.colors.dark.background.normal // '#292a2b'
tokens.colors.dark.line.normal       // '#747678'
```

### Status Colors (Universal)

```typescript
tokens.colors.status.error    // '#ee2a2b'
tokens.colors.status.info     // '#1a97ff'
tokens.colors.status.success  // '#31e87a'
tokens.colors.status.warning  // '#ffd11a'
```

### Color Palette (10-step scale)

Blue, Green, Red, Yellow, Neutral with 10-step scales (90, 80, 70...10):

```typescript
tokens.colors.palette.blue[50]     // '#0694f9'
tokens.colors.palette.green[50]    // '#06f99c'
tokens.colors.palette.neutral[50]  // '#808080'
```

## Typography

### Font Family
```typescript
tokens.typography.fontFamily.base // 'Pretendard'
```

### Text Styles

All styles include: `fontSize`, `fontWeight`, `lineHeight`, `letterSpacing`

**Display** (36px):
```typescript
tokens.typography.display.display1.bold
tokens.typography.display.display2.semibold
```

**Title** (28px, 24px):
```typescript
tokens.typography.title.title1.bold
tokens.typography.title.title2.semibold
```

**Headline** (20px, 18px):
```typescript
tokens.typography.headline.headline1.bold
tokens.typography.headline.headline2.medium
```

**Body** (16px):
```typescript
tokens.typography.body.bold
tokens.typography.body.semibold
tokens.typography.body.regular
```

**Label** (14px):
```typescript
tokens.typography.label.medium
tokens.typography.label.regular
```

**Caption** (12px):
```typescript
tokens.typography.caption.regular
```

## Spacing

4px base unit system:

```typescript
tokens.spacing.xs   // 4
tokens.spacing.sm   // 8
tokens.spacing.md   // 12
tokens.spacing.lg   // 16
tokens.spacing.xl   // 20
tokens.spacing['2xl'] // 24
tokens.spacing['3xl'] // 32
tokens.spacing['4xl'] // 40
tokens.spacing['5xl'] // 48
```

## Border Radius

```typescript
tokens.borderRadius.none   // 0
tokens.borderRadius.xs     // 4
tokens.borderRadius.sm     // 8
tokens.borderRadius.md     // 12
tokens.borderRadius.lg     // 16
tokens.borderRadius.full   // 999
```

## Complete Example

```typescript
import { useTheme } from '@/shared/hooks';
import { View, Text, StyleSheet } from 'react-native';

export const CardExample = () => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    card: {
      padding: spacing.lg,
      backgroundColor: colors.background.normal,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.line.normal,
    },
    title: {
      fontSize: typography.title2.bold.fontSize,
      fontWeight: typography.title2.bold.fontWeight,
      lineHeight: typography.title2.bold.lineHeight,
      color: colors.label.strong,
      marginBottom: spacing.sm,
    },
    description: {
      fontSize: typography.body.regular.fontSize,
      fontWeight: typography.body.regular.fontWeight,
      color: colors.label.normal,
    },
  });

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Card Title</Text>
      <Text style={styles.description}>Card description text</Text>
    </View>
  );
};
```

## Updating Tokens

Tokens are auto-generated from Figma. To update:

1. Make changes in Figma file
2. Use `/sync:figma` command (when available)
3. Or manually update `src/shared/constants/tokens.ts`
4. Commit and push changes

## Best Practices

- ✅ Always use token values instead of hardcoding colors
- ✅ Use `useTheme()` hook for theme-aware styling
- ✅ Organize tokens semantically (colors, typography, spacing)
- ✅ Keep tokens DRY and reusable
- ❌ Never override token values in components
- ❌ Avoid creating new color values outside the palette

## Token Structure

```
tokens
├── colors
│   ├── primary
│   ├── status (error, info, success, warning)
│   ├── light (label, line, background, fill)
│   ├── dark (label, line, background, fill)
│   └── palette (blue, green, red, yellow, neutral)
├── typography
│   ├── fontFamily
│   ├── display
│   ├── title
│   ├── headline
│   ├── body
│   ├── label
│   └── caption
├── spacing
└── borderRadius
```
