<div align="center">

<img src="assets/images/haemi-logo.png" alt="해미 로고" width="120" />

# 해미 (Haemi)

**기억을 잇는 가족 앱**

치매 가족과 함께하는 기억 기록 · 퀴즈 · 감정 리포트 플랫폼

[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-fd6941?style=flat-square)](LICENSE)

</div>

---

## 소개

**해미**는 치매 환자와 가족이 함께 소중한 기억을 기록하고, 퀴즈로 인지 훈련을 하며, 감정 변화를 추적할 수 있는 모바일 앱입니다.

- **기억 앨범** — 가족 사진과 이야기를 함께 저장하고 공유
- **기억 퀴즈** — 앨범 속 사진으로 만드는 개인화 인지 훈련
- **감정 리포트** — 일상 감정을 기록하고 변화 흐름을 한눈에
- **가족 기억** — 구성원 모두가 함께 쌓아가는 공유 추억

---

## 화면 구성

Expo Router 기반 파일 라우팅이며, 각 라우트는 `src/pages`의 화면 컴포넌트를 연결합니다.

| 라우트 | 화면 | 설명 |
|--------|------|------|
| `/` | Home | 오늘의 활동 · 퀴즈 · 앨범 바로가기 |
| `/album` | Album | 기억 앨범 목록과 필터 |
| `/album-register` | AlbumRegister | 사진 업로드로 기억 등록 |
| `/quiz` | Quiz | 앨범 사진 기반 인지 훈련 퀴즈 |
| `/report` | Report | 감정 변화 그래프 리포트 |
| `/family-memories` | FamilyMemories | 가족 구성원이 함께 쌓는 추억 |

---

## 기술 스택

| 분야 | 기술 |
|------|------|
| 프레임워크 | React Native 0.86 (Expo SDK 57) |
| 언어 | TypeScript 6 (strict) |
| 아키텍처 | Feature-Sliced Design (FSD) |
| 라우팅 | Expo Router (파일 기반) |
| 애니메이션 | react-native-reanimated 4 |
| 그래픽 | react-native-svg |
| 스타일링 | React Native StyleSheet + Figma Design Tokens |

---

## 시작하기

### 환경 요구사항

- Node.js 18+
- npm
- iOS: Xcode 14+ / Android: Android Studio
- `npm run ios`, `npm run android`는 네이티브 빌드(`expo run:*`)를 실행합니다. 네이티브 툴체인 없이 시작하려면 `npm run start` 후 Expo Go로 접속하세요.

### 설치 및 실행

```bash
npm install
npm run start
```

### 스크립트

| 명령 | 설명 |
|------|------|
| `npm run start` | Expo 개발 서버 시작 |
| `npm run ios` | iOS 네이티브 빌드 후 시뮬레이터 실행 |
| `npm run android` | Android 네이티브 빌드 후 에뮬레이터 실행 |
| `npm run web` | 웹 브라우저에서 실행 |
| `npm run lint` | ESLint 검사 |

### 환경 변수

`.env` 파일에 API 서버 주소를 설정합니다. 비워 두면 상대 경로로 요청합니다.

```bash
EXPO_PUBLIC_API_URL=https://api.example.com
```

---

## 디렉토리 구조

Feature-Sliced Design(FSD) 아키텍처를 따릅니다. 상위 레이어는 하위 레이어만 참조하며, 역방향·순환 의존은 금지합니다.

```
src/
├── app/          # Expo Router 라우트 & 전역 레이아웃
├── pages/        # 화면 컴포넌트 (Home, Album, Quiz, Report …)
├── widgets/      # 복합 UI 블록 (AlbumGrid, HomeHeader, UserCard …)
├── features/     # 기능 모듈 (비즈니스 로직)
├── entities/     # 도메인 엔티티 (album, user, activity — model/api)
└── shared/
    ├── ui/       # 공용 UI 컴포넌트 & 아이콘/일러스트 시스템
    ├── hooks/    # useTheme, useAsyncData, useColorScheme
    ├── api/      # apiClient, ApiError
    ├── constants/tokens/  # colors · typography · spacing
    ├── lib/
    └── types/
```

### 임포트 규칙

상대 경로 대신 `@/` 별칭을 사용합니다.

```typescript
import { Home, Album } from '@/shared/ui';
import { useTheme } from '@/shared/hooks';
import { AlbumGrid } from '@/widgets';
```

---

## 디자인 시스템

색상 · 타이포그래피 · 간격은 Figma 디자인 토큰에서 파생되며 `useTheme()`으로 접근합니다.

```typescript
import { useTheme } from '@/shared/hooks';

const { colors, typography, spacing, borderRadius } = useTheme();
// colors.primary, colors.label.normal, typography.body.medium, spacing.md …
```

아이콘은 `@/shared/ui`의 중앙 아이콘 시스템으로 관리합니다.

```typescript
import { Home, ICON_SIZES } from '@/shared/ui';

<Home size={ICON_SIZES.md} color="#fd6941" />
```

- 토큰 상세: [DESIGN_TOKENS.md](DESIGN_TOKENS.md)
- 아이콘 목록과 사용법: [src/shared/ui/README.md](src/shared/ui/README.md)

---

## 기여하기

1. `main`에서 브랜치를 생성합니다 (`3-feat-home-screen-ui` 형태).
2. 커밋 메시지는 `feat:`, `fix:`, `docs:` 등 Conventional Commits를 따릅니다.
3. `npm run lint` 통과를 확인한 뒤 PR을 올립니다.

프로젝트 규칙과 아키텍처 가이드는 [CLAUDE.md](CLAUDE.md)에 정리되어 있습니다.

---

## 라이선스

MIT © Haemi Team — 자세한 내용은 [LICENSE](LICENSE) 참고
