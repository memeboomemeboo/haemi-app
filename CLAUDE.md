# Haemi - React Native + TypeScript + FSD

## Project Setup
- **Framework**: React Native (Expo)
- **Language**: TypeScript (strict mode)
- **Architecture**: Feature-Sliced Design (FSD)
- **Styling**: React Native StyleSheet
- **Animation**: react-native-reanimated
- **Routing**: Expo Router
- **Design System**: Figma Design Tokens

## Directory Structure (FSD)

```
src/
├── app/                          # App initialization, routing setup
├── pages/                        # Page components (screens)
├── widgets/                      # Complex composite UI components
├── features/                     # Feature modules (business logic)
├── entities/                     # Business domain entities
└── shared/                       # Shared code across features
    ├── ui/                       # Reusable UI components
    ├── hooks/                    # Custom React hooks
    ├── constants/                # Application constants
    ├── lib/                      # Utility functions
    └── types/                    # Shared type definitions
```

## Import Aliases

Use path aliases for clean imports:

```typescript
// Instead of: import { Button } from '../../../shared/ui/button'
import { Button } from '@/shared/ui/button'

// Feature-specific imports
import { useAuth } from '@/features/auth/hooks'
import { UserEntity } from '@/entities/user'
import { Header } from '@/widgets/header'
```

## Development Commands

```bash
npm run start    # Start Expo development server
npm run web      # Run on web
npm run ios      # Run on iOS simulator
npm run android  # Run on Android emulator
npm run lint     # Run ESLint
```

## Icon System

All icons are managed through the centralized Icon component system in `/src/shared/ui/Icon/`:

### Usage - Generic Component
```typescript
import { Icon, ICON_SIZES } from '@/shared/ui';

<Icon name="Home" size={ICON_SIZES.md} color="#fd6941" />
```

### Usage - Individual Icons (Recommended)
```typescript
import { Home, Album, Report, Heart } from '@/shared/ui';

<Home size={20} color="#fd6941" />
<Album size={20} color="#fd6941" />
```

### Available Icons
Home, Album, Report, Setting, Alarm, Profile, Arrow, Check, Graph, Plus, Picture, Calendar, Map, People, Heart, Comment, More, Sent, Quiz, Circle

### Icon Sizes
- `ICON_SIZES.xs` → 8px
- `ICON_SIZES.sm` → 16px
- `ICON_SIZES.md` → 20px (default)
- `ICON_SIZES.lg` → 40px
- `ICON_SIZES.xl` → 48px

## FSD Principles

1. **One layer – one directory**
2. **Absolute imports** (use @ aliases)
3. **Domain-driven structure**
4. **Isolated slices** (features/entities have their own folders)
5. **No circular dependencies**

## Design Tokens

Access theme colors, typography, spacing via `useTheme()`:

```typescript
import { useTheme } from '@/shared/hooks';

const { colors, typography, spacing, borderRadius } = useTheme();

// Use colors
colors.primary              // Primary brand color
colors.label.normal         // Text color
colors.line.neutral         // Border color
colors.background.normal    // Background color
colors.fill.normal          // Fill color

// Use spacing (4px base unit)
spacing.xs, spacing.sm, spacing.md, spacing.lg, spacing.xl, spacing['2xl'], spacing['3xl'], spacing['4xl'], spacing['5xl']

// Use typography
typography.heading.large
typography.body.medium
typography.label.small
```
