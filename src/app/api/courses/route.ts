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

    const courses = await prisma.course.findMany({
      where: {
        instructorId: session.user.id
      },
      include: {
        enrollments: true,
        quizQuestions: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, videoLink, price, quizQuestions } = body;

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        videoLink,
        price: price || 0,
        instructorId: session.user.id
      }
    });

    // Create quiz questions if provided
    if (quizQuestions && quizQuestions.length > 0) {
      await prisma.quizQuestion.createMany({
        data: quizQuestions.map((q: any) => ({
          courseId: course.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      });
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
