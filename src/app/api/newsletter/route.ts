import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';
import { rateLimit, readJson, requestClient } from '@/lib/request';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

// POST /api/newsletter — Public email subscribe
export async function POST(request: NextRequest) {
  const limited = rateLimit(`newsletter:${requestClient(request)}`, 20);
  if (limited) return limited;

  const parsed = z.object({ email: z.string().trim().email().max(254).toLowerCase() })
    .safeParse(await readJson(request, 4096));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  try {
    const email = parsed.data.email;
    try {
      await getPrisma().newsletterSubscriber.create({ data: { email } });
    } catch (error) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== 'P2002') throw error;
      await getPrisma().newsletterSubscriber.updateMany({
        where: { email, isActive: false },
        data: { isActive: true },
      });
      return NextResponse.json({ success: true, message: 'You are subscribed to the Alphalinkx dispatch.' });
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Successfully subscribed to the AlphaLinkx dispatch.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Newsletter subscription failed.');
    return NextResponse.json({ error: 'Failed to register subscription.' }, { status: 500 });
  }
}

// GET /api/newsletter — Protected admin subscriber list
export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const subscribers = await getPrisma().newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });
    return NextResponse.json({ subscribers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve subscribers.' }, { status: 500 });
  }
}
