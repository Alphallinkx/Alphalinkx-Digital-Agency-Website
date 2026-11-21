import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';

export async function GET() {
  try {
    await getPrisma().inquiry.findFirst({ select: { phone: true } });
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 });
  }
}
