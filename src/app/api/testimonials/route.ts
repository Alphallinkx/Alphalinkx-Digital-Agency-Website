import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { testimonialInput, invalidInput, writeError } from '@/lib/admin-validation';
import { readJson } from '@/lib/request';

export async function GET() {
  try {
    const testimonials = await getPrisma().testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ testimonials });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to retrieve testimonials.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const parsed = testimonialInput.safeParse(await readJson(request));
    if (!parsed.success) return invalidInput();
    const testimonial = await getPrisma().testimonial.create({ data: parsed.data });
    return NextResponse.json({ success: true, testimonial }, { status: 201 });
  } catch (error) {
    return writeError(error, 'Failed to create testimonial.');
  }
}
