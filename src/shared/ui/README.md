# Shared UI Components

Reusable UI components for Haemi app.

## Components

### BottomNavigation

Navigation bar component with 4 tabs: Home, Album, Report, Quiz.

**Usage:**

```typescript
import { BottomNavigation } from '@/shared/ui';
import { useState } from 'react';

export const MyApp = () => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('Home');

  return (
    <>
      {/* App content */}
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </>
  );
};
```

**Props:**

- `activeTab: NavigationTab` - Currently active tab ('Home' | 'Album' | 'Report' | 'Quiz')
- `onTabChange: (tab: NavigationTab) => void` - Callback when tab is pressed

### Icon

Icon component system for displaying icons. Supports both generic `Icon` component and individual icon imports.

**Available Icons:**

- Navigation: Home, Album, Report, Setting, Alarm
- UI: Arrow, Check, Plus, Circle, Comment
- Content: Profile, Graph, Picture, Calendar, Map, People
- Others: Heart, More, Sent, Quiz

**Usage - Generic Component:**

```typescript
import { Icon, ICON_SIZES } from '@/shared/ui';
import { useTheme } from '@/shared/hooks';

export const MyIcon = () => {
  const { palette } = useTheme();

  return (
    <Icon 
      name="Home" 
      size={ICON_SIZES.md}
      color={palette.blue[50]}
    />
  );
};
```

**Usage - Individual Icon Components:**

```typescript
import { Home, Album, Report, useTheme } from '@/shared/ui';

export const MyIcons = () => {
  const { palette } = useTheme();

  return (
    <>
      <Home size={20} color={palette.blue[50]} />
      <Album size={20} color={palette.green[50]} />
      <Report size={20} color={palette.red[50]} />
    </>
  );
};
```

**Props:**

- `size?: number` - Icon size (default: 20)
- `color?: string` - Icon color (default: '#0c0c0d')
- `style?: ViewStyle` - Additional styles

**Icon Size Presets (in pixels):**

```typescript
ICON_SIZES.xs   // 8
ICON_SIZES.sm   // 16
ICON_SIZES.md   // 20 (default)
ICON_SIZES.lg   // 40
ICON_SIZES.xl   // 48
```

## Adding New Components

1. Create component file: `src/shared/ui/ComponentName.tsx`
2. Export types and component
3. Update `src/shared/ui/index.ts` with exports
4. Add usage documentation here

### Component Template

```typescript
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/shared/hooks';

interface ComponentNameProps {
  children?: React.ReactNode;
  style?: ViewStyle;
}

export const ComponentName: React.FC<ComponentNameProps> = ({
  children,
  style,
}) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    container: {
      // styles here
    },
  });

  return <View style={[styles.container, style]}>{children}</View>;
};
```