<div align="center">

<img src="assets/images/haemi-logo.png" alt="해미 로고" width="120" />

# 해미 (Haemi)

**기억을 잇는 가족 앱**

치매 가족과 함께하는 기억 기록 · 퀴즈 · 감정 리포트 플랫폼

[![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

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

| 홈 | 앨범 | 리포트 |
|:---:|:---:|:---:|
| 오늘의 퀴즈 & 앨범 | 기억 앨범 목록 | 감정 변화 그래프 |

---

## 기술 스택

| 분야 | 기술 |
|------|------|
| 프레임워크 | React Native (Expo) |
| 언어 | TypeScript (strict) |
| 아키텍처 | Feature-Sliced Design (FSD) |
| 라우팅 | Expo Router |
| 애니메이션 | react-native-reanimated |
| 스타일링 | React Native StyleSheet + Figma Design Tokens |

---

## 시작하기

### 환경 요구사항

- Node.js 18+
- npm 또는 yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode 14+ / Android: Android Studio

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npm run start

# 플랫폼별 실행
npm run ios       # iOS 시뮬레이터
npm run android   # Android 에뮬레이터
npm run web       # 웹 브라우저
```

---

## 디렉토리 구조

Feature-Sliced Design(FSD) 아키텍처를 따릅니다.

```
src/
├── app/          # 앱 초기화, 라우팅 설정
├── pages/        # 화면 컴포넌트 (Home, Album, Report, Quiz …)
├── widgets/      # 복합 UI 컴포넌트
├── features/     # 기능 모듈 (비즈니스 로직)
├── entities/     # 도메인 엔티티
└── shared/
    ├── ui/       # 공용 UI 컴포넌트 & 아이콘 시스템
    ├── hooks/    # 커스텀 훅 (useTheme 등)
    ├── constants/
    ├── lib/
    └── types/
```

---

## 라이선스

MIT © Haemi Team
