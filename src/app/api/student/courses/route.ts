import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User ID:', session.user.id);

    // Get enrolled courses for the student
    const enrollments = await (prisma as any).enrollment.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            },
            quizQuestions: true
          }
        }
      }
    });

    console.log('Found enrollments:', enrollments);

    // Transform the data to match the expected format
    const courses = enrollments.map((enrollment: any) => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      videoLink: enrollment.course.videoLink,
      price: enrollment.course.price,
      instructor: {
        name: enrollment.course.instructor.name || 'Unknown'
      },
      quizQuestions: enrollment.course.quizQuestions,
      enrollments: [{
        id: enrollment.id,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        enrolledAt: enrollment.enrolledAt,
        paidAmount: enrollment.paidAmount,
        status: enrollment.status,
        quizScore: enrollment.quizScore,
        quizAnswers: enrollment.quizAnswers,
        completedAt: enrollment.completedAt
      }]
    }));

    console.log('Transformed courses:', courses);
    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
