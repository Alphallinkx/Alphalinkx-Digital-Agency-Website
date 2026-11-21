import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';
import { projectInput, invalidInput, writeError } from '@/lib/admin-validation';
import { readJson } from '@/lib/request';

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const project = await getPrisma().project.findUnique({
      where: { slug },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }

    return NextResponse.json({
      project: {
        ...project,
        results: project.results ? JSON.parse(project.results) : [],
        services: project.services ? JSON.parse(project.services) : [],
        technologies: project.technologies ? JSON.parse(project.technologies) : [],
      },
    });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return NextResponse.json({ error: 'Failed to retrieve project details.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const parsed = projectInput.omit({ slug: true }).partial().safeParse(await readJson(request));
    if (!parsed.success) return invalidInput();
    const body = parsed.data;
    const project = await getPrisma().project.update({
      where: { slug },
      data: {
        title: body.title,
        client: body.client,
        category: body.category,
        summary: body.summary,
        challenge: body.challenge,
        solution: body.solution,
        results: body.results ? JSON.stringify(body.results) : undefined,
        services: body.services ? JSON.stringify(body.services) : undefined,
        technologies: body.technologies ? JSON.stringify(body.technologies) : undefined,
        liveUrl: body.liveUrl,
        imageUrl: body.imageUrl,
        featured: body.featured,
        sortOrder: body.sortOrder,
      },
    });

    return NextResponse.json({ success: true, project });
  } catch (error) {
    return writeError(error, 'Failed to update project.');
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    await getPrisma().project.delete({ where: { slug } });
    return NextResponse.json({ success: true, message: 'Project removed.' });
  } catch (error) {
    return writeError(error, 'Failed to delete project.');
  }
}
