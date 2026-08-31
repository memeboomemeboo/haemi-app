/** 액세스 토큰에서 클라이언트 라우팅에 필요한 클레임을 읽는다. */
import type { UserRole } from '@/shared/types';

interface AccessTokenClaims {
  sub?: string;
  role?: string;
  exp?: number;
}

const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of base64) {
    const value = BASE64_ALPHABET.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  let result = '';
  for (let index = 0; index < bytes.length; index += 1) {
    const byte = bytes[index];
    if (byte < 0x80) {
      result += String.fromCharCode(byte);
    } else if (byte >= 0xc0 && byte < 0xe0) {
      result += String.fromCharCode(((byte & 0x1f) << 6) | (bytes[index + 1] & 0x3f));
      index += 1;
    } else if (byte >= 0xe0 && byte < 0xf0) {
      result += String.fromCharCode(
        ((byte & 0x0f) << 12) | ((bytes[index + 1] & 0x3f) << 6) | (bytes[index + 2] & 0x3f),
      );
      index += 2;
    } else {
      const codePoint =
        ((byte & 0x07) << 18) |
        ((bytes[index + 1] & 0x3f) << 12) |
        ((bytes[index + 2] & 0x3f) << 6) |
        (bytes[index + 3] & 0x3f);
      result += String.fromCodePoint(codePoint);
      index += 3;
    }
  }
  return result;
};

export const parseAccessToken = (token: string): AccessTokenClaims | null => {
  const segments = token.split('.');
  if (segments.length !== 3) return null;
  try {
    const payload: unknown = JSON.parse(decodeBase64Url(segments[1]));
    return typeof payload === 'object' && payload !== null ? (payload as AccessTokenClaims) : null;
  } catch {
    return null;
  }
};

export const getRoleFromToken = (token: string): UserRole | null => {
  const claims = parseAccessToken(token);
  switch (claims?.role) {
    case 'ROLE_ELDER':
    case 'ELDER':
      return 'ELDER';
    case 'ROLE_GUARDIAN':
    case 'GUARDIAN':
    case 'FAMILY':
      return 'FAMILY';
    case 'ROLE_INSTITUTION_ADMIN':
    case 'INSTITUTION_ADMIN':
      return 'INSTITUTION_ADMIN';
    default:
      return null;
  }
};

export const isAccessTokenExpired = (token: string): boolean => {
  const claims = parseAccessToken(token);
  if (!claims?.exp) return false;
  return claims.exp * 1000 <= Date.now();
};
