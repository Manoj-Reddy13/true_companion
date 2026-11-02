import jwt from 'jsonwebtoken';

const jwtLib: any = (jwt as any).default || jwt;
const JWT_SECRET = process.env.JWT_SECRET || 'true_companion_super_secret_jwt_key_2026';

export interface TokenPayload {
  userId: string;
  role: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwtLib.sign(payload, JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwtLib.verify(token, JWT_SECRET) as TokenPayload;
}
