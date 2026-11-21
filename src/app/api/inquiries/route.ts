import { randomUUID } from 'node:crypto';
import type { Prisma } from '@/generated/prisma/client';
import { after, NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { rateLimit, readJson, requestClient } from '@/lib/request';
import { getPrisma } from '@/lib/db';
import { sendInquiryNotification, sendClientConfirmation } from '@/lib/email';
import { verifyAdminToken } from '@/lib/auth';
import { inquiryStatus } from '@/lib/admin-validation';


const optionalText = (max: number) => z.string().trim().max(max).nullish()
  .transform((value) => value || null);
const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254).toLowerCase(),
  phone: optionalText(40),
  company: optionalText(300),
  service: z.string().trim().min(1).max(350),
  budget: optionalText(120),
  timeline: optionalText(180),
  description: z.string().trim().min(10).max(10_000),
});

export async function POST(request: NextRequest) {
  const limited = rateLimit(`inquiry:${requestClient(request)}`, 20);
  if (limited) return limited;

  const body = await readJson(request);
  const honeypot = z.object({ honeypot: z.string().trim().min(1) }).safeParse(body);
  if (honeypot.success) return NextResponse.json({ success: true, message: 'Inquiry received.' });

  const parsed = inquirySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide valid contact details and a project description.' }, { status: 400 });
  }

  try {
    const { name, email, phone, company, service, budget, timeline, description } = parsed.data;
    const id = randomUUID();
    const now = Date.now();
    const cutoff = now - 5 * 60 * 1000;
    const inserted = await getPrisma().$executeRaw`
      INSERT INTO "Inquiry" ("id", "name", "email", "phone", "company", "service", "budget",
        "timeline", "description", "createdAt", "updatedAt")
      SELECT ${id}, ${name}, ${email}, ${phone}, ${company}, ${service}, ${budget}, ${timeline},
        ${description}, ${now}, ${now}
      WHERE NOT EXISTS (
        SELECT 1 FROM "Inquiry" WHERE "email" = ${email}
          AND "description" = ${description} AND "createdAt" >= ${cutoff}
      )
    `;

    if (!inserted) {
      const existing = await getPrisma().inquiry.findFirst({
        where: { email, description, createdAt: { gte: new Date(cutoff) } },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      return NextResponse.json({
        success: true,
        message: 'Your project inquiry has already been received.',
        inquiryId: existing?.id,
      });
    }

    after(async () => {
      await Promise.all([
        sendInquiryNotification(parsed.data),
        sendClientConfirmation({ name, email, service }),
      ]);
    });

    return NextResponse.json({
      success: true,
      message: 'Inquiry submitted successfully!',
      inquiryId: id,
    }, { status: 201 });
  } catch (error) {
    console.error('Could not save inquiry.');
    return NextResponse.json({ error: 'Could not save your inquiry. Please try again later.' }, { status: 500 });
  }
}

// GET /api/inquiries — Protected Admin List
export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required. Missing or invalid token.' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const query = z.object({
      status: inquiryStatus.or(z.literal('ALL')).optional(),
      search: z.string().trim().max(120).optional(),
      page: z.coerce.number().int().min(1).max(100_000).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(20),
    }).safeParse(Object.fromEntries(searchParams));

    if (!query.success) {
      return NextResponse.json({ error: 'Invalid filter or pagination.' }, { status: 400 });
    }

    const { status, search, page, limit } = query.data;
    const skip = (page - 1) * limit;
    const where: Prisma.InquiryWhereInput = {};
    if (status && status !== 'ALL') where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
        { service: { contains: search } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      getPrisma().inquiry.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
      getPrisma().inquiry.count({ where }),
    ]);

    return NextResponse.json({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error retrieving inquiries:', error);
    return NextResponse.json({ error: 'Failed to retrieve project inquiries.' }, { status: 500 });
  }
}
