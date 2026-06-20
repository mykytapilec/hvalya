export interface DecodedToken {
  sub: string;
  email: string;
  role: 'LISTENER' | 'ARTIST' | 'ADMIN';
  iat: number;
  exp: number;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as DecodedToken;
  } catch {
    return null;
  }
}
