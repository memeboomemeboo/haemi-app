# Haemi - React Native + TypeScript + FSD

## Project Setup
- **Framework**: React Native (Expo)
- **Language**: TypeScript (strict mode)
- **Architecture**: Feature-Sliced Design (FSD)

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

## FSD Principles

1. **One layer – one directory**
2. **Absolute imports** (use @ aliases)
3. **Domain-driven structure**
4. **Isolated slices** (features/entities have their own folders)
5. **No circular dependencies**
