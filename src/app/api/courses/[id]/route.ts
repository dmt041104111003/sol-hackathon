import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = params.id;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }
    const course = await (prisma as any).course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            walletAddress: true
          }
        },
        enrollments: {
          select: {
            id: true,
            userId: true,
            enrolledAt: true,
            paidAmount: true,
            status: true
          }
        },
        quizQuestions: {
          select: {
            id: true,
            question: true,
            options: true,
            correctAnswer: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: course.id,
      title: course.title,
      description: course.description,
      videoLink: course.videoLink,
      price: course.price,
      instructor: course.instructor,
      enrollments: course.enrollments,
      quizQuestions: course.quizQuestions,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}