# Haemi Development Guidelines

## 📌 Project Foundation
- **Framework**: React Native (Expo v57.0.0)
- **Language**: TypeScript (strict mode)
- **Architecture**: Feature-Sliced Design (FSD)
- **Docs Reference**: https://docs.expo.dev/versions/v57.0.0/

## 🏗️ FSD Architecture - Must Follow

### Directory Structure
```
src/
├── app/                    # App initialization, routing, layout
├── pages/                  # Page components (screens)
├── widgets/                # Composite UI components (combines entities/features)
├── features/               # Business feature modules (business logic)
├── entities/               # Business domain entities (models, types)
└── shared/                 # Shared across features
    ├── ui/                 # Reusable UI components
    ├── hooks/              # Custom React hooks
    ├── constants/          # App constants
    ├── lib/                # Utility functions
    └── types/              # Shared type definitions
```

### Layer Responsibilities

| Layer | Purpose | Examples |
|-------|---------|----------|
| **app** | App setup, routing, entry point | Root layout, navigation setup |
| **pages** | Full-screen components | Home screen, Settings screen |
| **widgets** | Complex UI blocks | Header, Sidebar, Modal |
| **features** | Business logic & state | Auth, Profile, Chat features |
| **entities** | Domain models & types | User entity, Post entity |
| **shared** | Reusable code | Button, Input, useAuth hook |

### Import Rules (CRITICAL)
```typescript
// ✅ CORRECT - Use path aliases
import { Button } from '@/shared/ui/button'
import { useAuth } from '@/shared/hooks/useAuth'
import { UserEntity } from '@/entities/user'
import { LoginFeature } from '@/features/auth'

// ❌ WRONG - Never use relative imports
import { Button } from '../../../shared/ui/button'
```

### Dependency Direction (STRICT)
```
app → pages → widgets → features → entities → shared
      ↓                                         ↑
      └────── Cannot import from above ───────┘
```

**Violation Examples:**
- ❌ `features/auth` importing from `pages` (going up)
- ❌ `entities` importing from `features` (going up)
- ❌ `shared/ui` importing from `features` (going up)

---

## 📝 Code Standards

### Naming Conventions
- **Components**: `PascalCase` (`UserCard.tsx`, `LoginForm.tsx`)
- **Hooks**: `camelCase` with `use` prefix (`useAuth.ts`, `useFormValidation.ts`)
- **Utils**: `camelCase` (`formatDate()`, `validateEmail()`)
- **Constants**: `SCREAMING_SNAKE_CASE` (`API_TIMEOUT`, `MAX_FILE_SIZE`)
- **Types**: `PascalCase` with suffix (`UserType`, `AuthState`)

### File Organization
```
features/auth/
├── ui/                     # Feature UI components
│   ├── LoginForm.tsx
│   └── LogoutButton.tsx
├── hooks/                  # Feature-specific hooks
│   └── useLogin.ts
├── types/                  # Feature types
│   └── auth.types.ts
├── model/                  # State management (optional)
│   └── store.ts
└── index.ts                # Public API exports
```

### TypeScript Rules
- No `any` types allowed
- Always type function parameters & returns
- Use strict mode (enabled in tsconfig.json)
- Export types from feature index

```typescript
// ✅ Good
export const login = (email: string, password: string): Promise<User> => {}
export type LoginPayload = { email: string; password: string }

// ❌ Bad
export const login = (email, password) => {}
export const login = (data: any) => {}
```

---

## 🔧 Development Workflow

### Before Writing Code
```bash
git checkout develop
git pull origin develop
git checkout -b feature/XX-description
```

### Code Quality
```bash
npm run lint              # Check ESLint + Prettier
npm run lint --fix        # Auto-fix issues
```

### Commit Standards
```bash
git commit -m "type(scope): description

Detailed explanation if needed (max 72 chars per line)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
```

**Commit Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

### Push & PR
```bash
git push -u origin feature/XX-description
# Create PR with base: develop
```

---

## ⚠️ Common FSD Mistakes

| ❌ Wrong | ✅ Correct | Why |
|---------|-----------|-----|
| `features/auth` imports `pages/Home` | `features/auth` stays isolated | No upward deps |
| `shared/Button` imports from `features` | `shared/Button` has no deps | Shared is most stable |
| Relative import: `../../components` | Use `@/shared/ui/Button` | Clear, maintainable |
| Business logic in `shared/ui` | Business logic in `features/` | Proper separation |
| `entities/user` importing from `features` | `entities/user` is standalone | Entities are foundational |

---

## 🧪 Testing Each Layer

### Shared Layer
- No external logic, just utilities
- Test in isolation

### Entities
- Pure data models
- No dependencies on features
- Test types and validators

### Features
- Test business logic
- Mock entities if needed
- Mock API calls

### Widgets
- Test composition
- Mock features/entities
- Focus on UI behavior

### Pages
- Integration tests
- Use real features/widgets
- Test full flows

---

## 📖 Quick Reference

### Path Aliases Available
```typescript
@/app          → src/app
@/pages        → src/pages
@/widgets      → src/widgets
@/features     → src/features
@/entities     → src/entities
@/shared       → src/shared
@/shared/ui    → src/shared/ui
@/shared/hooks → src/shared/hooks
```

### FSD Resources
- Docs: https://feature-sliced.design/
- This project CLAUDE.md: Project-specific details
- Keep layer boundaries STRICT
