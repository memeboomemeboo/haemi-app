# 🚀 배포 가이드

## 환경별 설정

### 개발 환경

```bash
# .env (예시)
EXPO_PUBLIC_API_URL=http://localhost:8080
EXPO_PUBLIC_ENV=development
```

### 테스트 환경

```bash
# .env.test (예시)
EXPO_PUBLIC_API_URL=https://test-api.internal
EXPO_PUBLIC_ENV=test
```

### 프로덕션 환경

```bash
# .env.production (절대 git에 커밋하지 말 것)
EXPO_PUBLIC_API_URL=https://api.production.server
EXPO_PUBLIC_ENV=production
```

## 🔐 보안 체크리스트 (프로덕션)

배포 전 반드시 확인하세요:

- [ ] `.env.production` 파일이 `.gitignore`에 있는가?
- [ ] 실제 서버 주소가 커밋되지 않았는가?
- [ ] HTTPS URL을 사용하는가?
- [ ] 실제 로그인 API가 연동되었는가?
- [ ] 에러 메시지가 안전화되었는가?
- [ ] npm audit 통과했는가?

## API 엔드포인트 구조

기본 URL: `EXPO_PUBLIC_API_URL`

모든 API 엔드포인트는 코드에서 `/api/v1/{endpoint}` 형식으로 관리됩니다:

```
기본 URL: https://api.production.server
  ├─ /api/v1/auth/signup (회원가입)
  ├─ /api/v1/auth/login (로그인)
  ├─ /api/v1/groups (그룹)
  ├─ /api/v1/albums (추억)
  └─ /api/v1/cognitive-dashboard (리포트)
```

## 배포 방법

### 1. EAS Build (Expo)

```bash
# 환경변수 설정
eas build --platform ios --profile production

# 프로필 설정 (eas.json)
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "@PRODUCTION_API_URL",
        "EXPO_PUBLIC_ENV": "production"
      }
    }
  }
}
```

### 2. 환경변수 관리 (EAS Secrets)

```bash
# EAS 비밀변수 설정
eas secret:create --scope project --name PRODUCTION_API_URL

# 값: https://api.production.server (기본 URL만)
```

## ⚠️ 실제 서버 주소 관리

### 팀원에게만 공유

- [ ] Notion/Confluence의 **비공개** 문서
- [ ] 비밀번호 관리 도구 (1Password, LastPass 등)
- [ ] 회사 내부 위키 (공개 저장소 아님)

### 절대 하지 말 것

- ❌ GitHub에 커밋
- ❌ README에 기록
- ❌ 공개 가이드 문서
- ❌ Slack 메시지 (로그 남음)

## CI/CD 배포

### GitHub Actions 예시

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 비공개 환경변수 사용
      - name: Deploy
        env:
          EXPO_PUBLIC_API_URL: ${{ secrets.PRODUCTION_API_URL }}
          EXPO_PUBLIC_ENV: production
        run: eas build --platform ios --profile production
```

### 환경변수는 GitHub Secrets에 저장

1. Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. `PRODUCTION_API_URL` 추가
4. 값: `https://api.production.server` (기본 URL만)

## 배포 후 검증

```bash
# 실제 배포된 앱에서 확인
1. 로그인 성공 여부
2. 그룹 생성 가능 여부
3. API 응답 정상 여부
4. 에러 메시지 안전성 확인
```

## 롤백 방법

서버 주소가 잘못된 경우:

```bash
# 이전 버전으로 롤백
eas build:list
eas channel:view production

# 이전 빌드로 복구
eas update --channel production --branch previous
```

## 모니터링

배포 후 실시간 모니터링:

- [ ] API 응답 시간 확인
- [ ] 에러 로그 확인
- [ ] 사용자 피드백 수집
- [ ] 성능 메트릭 검토
