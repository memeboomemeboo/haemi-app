# 🔒 보안 가이드

## 1. 환경변수 관리

### 필수 환경변수

```bash
# .env 파일에서 설정 (개발)
EXPO_PUBLIC_API_URL=http://54.180.61.149:8080
EXPO_PUBLIC_ENV=development

# .env.example (공개 참고용)
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENV=development

# 프로덕션: 실제 서버 주소는 배포 환경에서 설정
# EXPO_PUBLIC_API_URL=https://api.production.server (기본 URL만)
```

### ⚠️ 프로덕션 체크리스트

- [ ] `EXPO_PUBLIC_API_URL`이 **HTTPS**인가?
- [ ] 기본 URL만 설정되어 있는가? (엔드포인트는 코드에서 관리)
- [ ] 실제 로그인 API 연동되었는가?
- [ ] `.env`가 `.gitignore`에 있는가?

## 2. 인증/토큰 관리

### ❌ 하지 말아야 할 것

```typescript
// 절대 금지: 토큰 하드코딩
const token = 'secret-token-12345';

// 절대 금지: 코드에 서버 주소 하드코딩
const API_URL = 'http://actual-server-url.com/api/v1';
```

### ✅ 올바른 방법

```typescript
// 환경변수로 기본 URL 관리
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const API_URL = `${API_BASE_URL}/api/v1/auth/login`; // 엔드포인트는 코드에서

// 로그인 API에서 토큰 받기
const { token } = await authService.login(credentials);
setCurrentAuthToken(token);
```

### 토큰 저장 (현재 상태)

```
메모리 저장 (현재) ← 세션 동안만 유지
    ↓
AsyncStorage (향후) ← 암호화 필요
    ↓
Secure Storage ← 권장 (프로덕션)
```

## 3. API 요청 보안

### Authorization 헤더

```typescript
// ✅ 올바른 방법
headers['Authorization'] = `Bearer ${token}`;

// ❌ 절대 금지
headers['Authorization'] = token; // Bearer 없음
headers['X-Custom-Token'] = token; // 표준 아님
```

### HTTPS 검증

```typescript
// 프로덕션에서는 HTTPS만 사용
if (process.env.NODE_ENV === 'production') {
  if (!url.startsWith('https://')) {
    throw new Error('HTTPS required in production');
  }
}
```

## 4. 에러 응답 처리

### ✅ 개발 환경

```typescript
// 상세 에러 메시지 로깅
console.error('API Error:', error.message);
```

### ✅ 프로덕션 환경

```typescript
// 사용자 친화적인 메시지만 표시
const userMessage = '요청을 처리할 수 없습니다.';
```

## 5. 민감한 정보 보호

### 로그에 포함되면 안 되는 것

- ❌ 액세스 토큰
- ❌ 리프레시 토큰
- ❌ API 키
- ❌ 사용자 비밀번호
- ❌ 개인정보 (주민번호, 전화번호 전체)

### 안전한 로깅

```typescript
// ❌ 위험
console.log('Token:', authToken);

// ✅ 안전
console.log('Authorization header set');

// ✅ 안전 (개발용)
if (process.env.NODE_ENV === 'development') {
  console.debug('Token last 4 chars:', token.slice(-4));
}
```

## 6. 종속성 보안

### 정기적 업데이트

```bash
# 취약점 확인
npm audit

# 자동 수정
npm audit fix

# 심각한 취약점만 수정
npm audit fix --audit-level=critical
```

## 7. 프로덕션 배포 전 체크리스트

- [ ] 모든 환경변수 설정됨
- [ ] 테스트 토큰 제거됨
- [ ] HTTPS URL 사용
- [ ] 로그인 API 연동됨
- [ ] 에러 메시지 안전화됨
- [ ] 토큰 저장소 암호화됨
- [ ] npm audit 통과
- [ ] 민감 정보 로깅 제거됨

## 8. 추가 참고자료

- [OWASP Mobile Security Top 10](https://owasp.org/www-project-mobile-top-10/)
- [Expo Security Best Practices](https://docs.expo.dev/build-reference/security/)
- [React Native Security Guide](https://reactnative.dev/docs/security)
