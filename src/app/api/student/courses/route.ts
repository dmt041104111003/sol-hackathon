import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get enrolled courses for the student
    const enrollments = await prisma.enrollment.findMany({
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

    // Transform the data to match the expected format
    const courses = enrollments.map(enrollment => ({
      id: enrollment.course.id,
      title: enrollment.course.title,
      description: enrollment.course.description,
      videoLink: enrollment.course.videoLink,
      instructor: {
        name: enrollment.course.instructor.name || 'Unknown'
      },
      quizQuestions: enrollment.course.quizQuestions
    }));

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching student courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
