# Shared UI Components

Reusable UI components for Haemi app.

## Components

### BottomNavigation

Navigation bar component with 5 tabs: Home, Album, Memory, Report, Quiz.

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

- `activeTab: NavigationTab` - Currently active tab ('Home' | 'Album' | 'Memory' | 'Report' | 'Quiz')
- `onTabChange: (tab: NavigationTab) => void` - Callback when tab is pressed

### Icon

Icon component for displaying icons.

**Available Icons:**

- Navigation: Home, Album, Report, Setting, Alarm
- UI: Arrow, Check, Plus, Circle, Comment
- Content: Profile, Graph, Picture, Calendar, Map, People
- Others: Heart, More, Sent, Quiz

**Usage:**

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

**Props:**

- `name: IconName` - Icon name (required)
- `size?: number` - Icon size (default: 24)
- `color?: string` - Icon color (default: '#0c0c0d')
- `style?: ViewStyle` - Additional styles

**Icon Size Presets:**

```typescript
ICON_SIZES.xs   // 16
ICON_SIZES.sm   // 20
ICON_SIZES.md   // 24 (default)
ICON_SIZES.lg   // 32
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