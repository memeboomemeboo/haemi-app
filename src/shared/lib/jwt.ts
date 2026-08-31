/**
 * 액세스 토큰(JWT) 페이로드 해석.
 *
 * 서버가 발급하는 액세스 토큰에는 role 클레임이 들어있다.
 * 따라서 역할 판별에 별도 서버 조회가 필요 없다 — 토큰만 있으면 된다.
 * 서명 검증은 서버 몫이고, 여기서는 라우팅에 쓸 클레임만 읽는다.
 */

import type { UserRole } from '@/shared/types';

interface AccessTokenClaims {
  sub?: string;
  role?: string;
  exp?: number;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** base64url 문자열을 UTF-8로 디코딩한다. atob 유무와 무관하게 동작하도록 직접 구현한다. */
const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of base64) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) continue; // '=' 패딩과 개행은 무시
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  // UTF-8 디코딩 (한글 이름 등 멀티바이트 대응)
  let result = '';
  for (let i = 0; i < bytes.length; i += 1) {
    const byte = bytes[i];
    if (byte < 0x80) {
      result += String.fromCharCode(byte);
    } else if (byte >= 0xc0 && byte < 0xe0) {
      result += String.fromCharCode(((byte & 0x1f) << 6) | (bytes[++i] & 0x3f));
    } else if (byte >= 0xe0 && byte < 0xf0) {
      result += String.fromCharCode(
        ((byte & 0x0f) << 12) | ((bytes[++i] & 0x3f) << 6) | (bytes[++i] & 0x3f)
      );
    } else {
      const codePoint =
        ((byte & 0x07) << 18) |
        ((bytes[++i] & 0x3f) << 12) |
        ((bytes[++i] & 0x3f) << 6) |
        (bytes[++i] & 0x3f);
      result += String.fromCodePoint(codePoint);
    }
  }

  return result;
};

/** 액세스 토큰의 페이로드를 읽는다. 형식이 깨졌으면 null. */
export const parseAccessToken = (token: string): AccessTokenClaims | null => {
  const segments = token.split('.');
  if (segments.length !== 3) return null;

  try {
    const payload = JSON.parse(decodeBase64Url(segments[1]));
    return typeof payload === 'object' && payload !== null ? (payload as AccessTokenClaims) : null;
  } catch {
    return null;
  }
};

/**
 * 서버의 role 클레임("ROLE_ELDER" · "ROLE_GUARDIAN")을 앱의 UserRole로 옮긴다.
 * 서버는 보호자를 GUARDIAN이라고 부르고 앱은 FAMILY라고 부른다.
 */
export const getRoleFromToken = (token: string): UserRole | null => {
  const claims = parseAccessToken(token);
  if (!claims?.role) return null;

  switch (claims.role) {
    case 'ROLE_ELDER':
      return 'ELDER';
    case 'ROLE_GUARDIAN':
      return 'FAMILY';
    default:
      return null;
  }
};

/** exp가 지났으면 true. exp가 없으면 판단하지 않고 false. */
export const isAccessTokenExpired = (token: string): boolean => {
  const claims = parseAccessToken(token);
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now();
};
