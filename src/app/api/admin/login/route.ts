import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ADMIN_COOKIE, adminCookieOptions, getAdminSecret, isAdminRole, isSameOrigin, SESSION_SECONDS, signAdminToken } from '@/lib/auth';
import { getPrisma } from '@/lib/db';
import { rateLimit, readJson, requestClient } from '@/lib/request';

const loginSchema = z.object({
  email: z.string().trim().email().max(254).toLowerCase(),
  password: z.string().min(1).refine((value) => Buffer.byteLength(value) <= 72),
  session: z.literal('cookie').optional(),
});
const legacyPasswordFingerprint = '146e171f5f26558cd1e0af4230080f3c664f0fb6876cf85b5a1e98027ff049f5';
const dummyHash = bcrypt.hashSync('unused-password-for-login-timing', 10);

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 });
  }

  const limited = rateLimit(`login:client:${requestClient(request)}`, 30);
  if (limited) return limited;

  const parsed = loginSchema.safeParse(await readJson(request, 4096));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please enter a valid email and password.' }, { status: 400 });
  }

  const { email, password, session } = parsed.data;
  const accountLimited = rateLimit(`login:account:${email}`, 6);
  if (accountLimited) return accountLimited;

  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json({ error: 'Administrative login is unavailable.' }, { status: 503 });
  }

  try {
    const admin = await getPrisma().adminUser.findUnique({ where: { email } });
    const matches = await bcrypt.compare(password, admin?.password ?? dummyHash);
    const isLegacyPassword = createHash('sha256').update(password).digest('hex') === legacyPasswordFingerprint;
    if (!admin || !matches || !isAdminRole(admin.role) || isLegacyPassword) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    const token = signAdminToken(admin.id, admin.updatedAt, secret);
    const user = { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
    if (session !== 'cookie') return NextResponse.json({ success: true, token, user });

    const response = NextResponse.json({ success: true, user });
    response.cookies.set(ADMIN_COOKIE, token, { ...adminCookieOptions, maxAge: SESSION_SECONDS });
    return response;
  } catch (error) {
    console.error('Admin login failed:', error);
    return NextResponse.json({ error: 'Authentication service encountered an error.' }, { status: 500 });
  }
}
