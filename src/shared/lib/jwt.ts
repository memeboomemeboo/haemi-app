import type { UserRole } from '@/shared/types';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/** atob 등 브라우저 API 없이 base64(url-safe) 문자열을 디코딩한다. */
function decodeBase64(input: string): string {
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of base64) {
    const value = BASE64_CHARS.indexOf(char);
    if (value === -1) continue;
    buffer = (buffer << 6) | value;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

interface JwtPayload {
  sub?: string;
  role?: string;
  [key: string]: unknown;
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const json = decodeURIComponent(
      decodeBase64(parts[1])
        .split('')
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

const SERVER_ROLE_TO_USER_ROLE: Record<string, UserRole> = {
  ROLE_GUARDIAN: 'FAMILY',
  ROLE_ELDER: 'ELDER',
};

/** 액세스 토큰의 role 클레임(ROLE_GUARDIAN/ROLE_ELDER)을 클라 UserRole로 매핑한다. */
export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);
  const role = payload?.role;
  if (typeof role !== 'string') return null;
  return SERVER_ROLE_TO_USER_ROLE[role] ?? null;
}
