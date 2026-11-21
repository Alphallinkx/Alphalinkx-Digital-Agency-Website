import { NextResponse } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@/generated/prisma/client';

const line = z.string().trim().min(1).max(300);
const longText = z.string().trim().min(1).max(10_000);
const safeUrl = z.string().trim().max(2048).refine((value) => {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
});
const assetUrl = z.string().trim().max(2048).refine((value) => {
  return (/^\/(?![\/\\])/.test(value) && !value.includes('\\')) || safeUrl.safeParse(value).success;
});

export const inquiryStatus = z.enum(['NEW', 'CONTACTED', 'IN_REVIEW', 'ARCHIVED']);

export const projectInput = z.object({
  slug: z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: line,
  client: line,
  category: line,
  summary: longText,
  challenge: longText.nullish(),
  solution: longText.nullish(),
  results: z.array(longText).max(40).optional(),
  services: z.array(line).max(40).optional(),
  technologies: z.array(line).max(40).optional(),
  liveUrl: safeUrl.nullish(),
  imageUrl: assetUrl,
  featured: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(100_000).optional(),
});

export const serviceUpdate = z.object({
  title: line,
  shortDesc: longText,
  fullDesc: longText,
  icon: line,
  capabilities: z.array(longText).max(40),
  deliverables: z.array(longText).max(40),
  process: z.array(z.object({ step: line, title: line, desc: longText })).max(40),
  faqs: z.array(z.object({ q: line, a: longText })).max(40),
  isActive: z.boolean(),
}).partial();

export const testimonialInput = z.object({
  clientName: line,
  role: line,
  company: line,
  quote: longText,
  rating: z.number().int().min(1).max(5).default(5),
  project: line.nullish(),
  avatarUrl: assetUrl.nullish(),
  featured: z.boolean().default(false),
});

export function invalidInput() {
  return NextResponse.json({ error: 'Please provide valid values for the requested fields.' }, { status: 400 });
}

export function writeError(error: unknown, message: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return NextResponse.json({ error: 'Record not found.' }, { status: 404 });
    if (error.code === 'P2002') return NextResponse.json({ error: 'Record already exists.' }, { status: 409 });
  }
  console.error(message);
  return NextResponse.json({ error: message }, { status: 500 });
}
