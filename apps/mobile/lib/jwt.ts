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

    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(decoded) as DecodedToken;
  } catch {
    return null;
  }
}