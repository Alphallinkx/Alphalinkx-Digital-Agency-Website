import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { inquiryStatus, invalidInput, writeError } from '@/lib/admin-validation';
import { readJson } from '@/lib/request';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const parsed = z.object({ status: inquiryStatus.optional(), notes: z.string().max(10_000).nullable().optional() }).safeParse(await readJson(request));
    if (!parsed.success) return invalidInput();
    const updated = await getPrisma().inquiry.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ success: true, inquiry: updated });
  } catch (error) {
    return writeError(error, 'Failed to update inquiry record.');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await getPrisma().inquiry.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Inquiry archived and removed.' });
  } catch (error) {
    return writeError(error, 'Failed to delete inquiry.');
  }
}
