import type { Prisma } from '@/generated/prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { projectInput, invalidInput, writeError } from '@/lib/admin-validation';
import { readJson } from '@/lib/request';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where: Prisma.ProjectWhereInput = {};
    if (category && category !== 'All') {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }

    const projects = await getPrisma().project.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    const parsedProjects = projects.map((p) => ({
      ...p,
      results: p.results ? JSON.parse(p.results) : [],
      services: p.services ? JSON.parse(p.services) : [],
      technologies: p.technologies ? JSON.parse(p.technologies) : [],
    }));

    return NextResponse.json({ projects: parsedProjects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to retrieve portfolio projects.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const parsed = projectInput.safeParse(await readJson(request));
    if (!parsed.success) return invalidInput();
    const body = parsed.data;
    const project = await getPrisma().project.create({
      data: {
        slug: body.slug,
        title: body.title,
        client: body.client,
        category: body.category,
        summary: body.summary,
        challenge: body.challenge,
        solution: body.solution,
        results: JSON.stringify(body.results || []),
        services: JSON.stringify(body.services || []),
        technologies: JSON.stringify(body.technologies || []),
        liveUrl: body.liveUrl,
        imageUrl: body.imageUrl,
        featured: body.featured,
        sortOrder: body.sortOrder ?? 0,
      },
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    return writeError(error, 'Failed to create project.');
  }
}
