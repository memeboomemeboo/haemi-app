import type { UserRole } from '@/shared/types';

interface JwtPayload {
  role?: unknown;
}

export function getRoleFromToken(token: string): UserRole | null {
  const payload = decodeJwtPayload(token);

  if (!payload || typeof payload.role !== 'string') {
    return null;
  }

  switch (payload.role) {
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
}

function decodeJwtPayload(token: string): JwtPayload | null {
  const [, payload] = token.split('.');

  if (!payload) {
    return null;
  }

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const decoded = typeof globalThis.atob === 'function'
      ? globalThis.atob(padded)
      : decodeBase64(padded);
    return JSON.parse(decodeUtf8(decoded)) as JwtPayload;
  } catch {
    return null;
  }
}

function decodeBase64(value: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let output = '';
  let buffer = 0;
  let bits = 0;

  for (const char of value.replace(/=+$/, '')) {
    const index = alphabet.indexOf(char);

    if (index < 0) {
      continue;
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

function decodeUtf8(value: string): string {
  try {
    return decodeURIComponent(
      Array.from(value, (char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
  } catch {
    return value;
  }
}
