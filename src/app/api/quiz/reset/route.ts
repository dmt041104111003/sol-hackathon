import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    const enrollment = await (prisma as any).enrollment.updateMany({
      where: {
        userId: session.user.id,
        courseId: courseId
      },
      data: {
        quizScore: null,
        quizAnswers: null,
        status: 'ACTIVE',
        completedAt: null
      }
    });

    if (enrollment.count === 0) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Quiz reset successfully',
      enrollment: {
        userId: session.user.id,
        courseId,
        status: 'ACTIVE'
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
