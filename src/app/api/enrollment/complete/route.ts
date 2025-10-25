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

    // Check if enrollment exists and has perfect score
    const enrollment = await (prisma as any).enrollment.findFirst({
      where: {
        userId: session.user.id,
        courseId: courseId
      },
      include: {
        course: {
          include: {
            quizQuestions: true
          }
        }
      }
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if quiz score is perfect (100%)
    const totalQuestions = enrollment.course.quizQuestions.length;
    const isPerfectScore = enrollment.quizScore === totalQuestions;

    if (!isPerfectScore) {
      return NextResponse.json({ 
        error: 'Course not completed. You need 100% score to complete this course.',
        currentScore: enrollment.quizScore,
        requiredScore: totalQuestions
      }, { status: 400 });
    }

    // Update enrollment status to COMPLETED (this should already be done in quiz submit)
    const updatedEnrollment = await (prisma as any).enrollment.updateMany({
      where: {
        userId: session.user.id,
        courseId: courseId
      },
      data: {
        status: 'COMPLETED',
        completedAt: new Date()
      }
    });

    if (updatedEnrollment.count === 0) {
      return NextResponse.json({ error: 'Failed to update enrollment' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Course completed successfully',
      enrollment: {
        userId: session.user.id,
        courseId,
        status: 'COMPLETED',
        score: enrollment.quizScore,
        totalQuestions
      }
    });

  } catch (error) {
    console.error('Error completing enrollment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
