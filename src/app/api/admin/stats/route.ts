import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db';
import { verifyAdminToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const admin = await verifyAdminToken(request);
  if (!admin) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const [totalInquiries, newInquiries, totalProjects, totalSubscribers, totalServices] =
      await Promise.all([
        getPrisma().inquiry.count(),
        getPrisma().inquiry.count({ where: { status: 'NEW' } }),
        getPrisma().project.count(),
        getPrisma().newsletterSubscriber.count(),
        getPrisma().service.count(),
      ]);

    const rawServices = await getPrisma().inquiry.groupBy({
      by: ['service'],
      _count: { service: true },
    });

    return NextResponse.json({
      stats: {
        totalInquiries,
        newInquiries,
        totalProjects,
        totalSubscribers,
        totalServices,
        inquiriesByService: rawServices.map((item) => ({
          service: item.service,
          count: item._count.service,
        })),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to retrieve administrative analytics.' }, { status: 500 });
  }
}
