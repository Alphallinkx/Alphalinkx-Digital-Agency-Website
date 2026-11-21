import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getPrisma } from '@/lib/db';

export const ADMIN_COOKIE = 'alphalinkx_admin_session';
export const SESSION_SECONDS = 8 * 60 * 60;
export const adminCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/',
} as const;

export function getAdminSecret() {
  const secret = process.env.JWT_SECRET;
  return secret && Buffer.byteLength(secret) >= 32 ? secret : null;
}

export function isAdminRole(role: string) {
  return ['ADMIN', 'SUPERADMIN'].includes(role.toUpperCase());
}

export function signAdminToken(userId: string, updatedAt: Date, secret: string) {
  return jwt.sign({ version: updatedAt.getTime() }, secret, {
    algorithm: 'HS256',
    subject: userId,
    audience: 'alphalinkx-admin',
    expiresIn: SESSION_SECONDS,
  });
}

export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  const fetchSite = request.headers.get('sec-fetch-site');
  const expected = process.env.APP_ORIGIN || request.nextUrl.origin;
  return (!fetchSite || fetchSite === 'same-origin') && (!origin || origin === expected);
}

export async function verifyAdminToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const bearer = authHeader?.match(/^Bearer ([^\s]+)$/i)?.[1];
  const token = bearer || request.cookies.get(ADMIN_COOKIE)?.value;
  const secret = getAdminSecret();
  if (!token || !secret) return null;

  if (!bearer && !['GET', 'HEAD', 'OPTIONS'].includes(request.method) && !isSameOrigin(request)) {
    return null;
  }

  try {
    const claims = jwt.verify(token, secret, { algorithms: ['HS256'], audience: 'alphalinkx-admin' });
    if (typeof claims === 'string' || !claims.sub || typeof claims.version !== 'number') return null;
    const admin = await getPrisma().adminUser.findUnique({
      where: { id: claims.sub },
      select: { id: true, email: true, role: true, name: true, createdAt: true, updatedAt: true },
    });
    if (!admin || !isAdminRole(admin.role) || admin.updatedAt.getTime() !== claims.version) return null;
    const { updatedAt, ...user } = admin;
    return user;
  } catch {
    return null;
  }
}
