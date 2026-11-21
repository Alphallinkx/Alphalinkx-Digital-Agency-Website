import { writeError } from '@/lib/admin-validation';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await getPrisma().testimonial.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Testimonial removed.' });
  } catch (error) {
    return writeError(error, 'Failed to delete testimonial.');
  }
}
