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
    console.log('POST /api/courses - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session);
    
    if (!session?.user?.id) {
      console.log('No session or user ID');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Request body:', body);
    
    const { title, description, videoLink, priceUSD, quizQuestions } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
    }

    // Convert USD to SOL (assuming $200 per SOL)
    const SOL_RATE = 200;
    const priceInSOL = priceUSD ? priceUSD / SOL_RATE : 0;

    console.log('Creating course with data:', {
      title,
      description,
      videoLink,
      price: priceInSOL,
      instructorId: session.user.id
    });

    // Create course
    const course = await prisma.course.create({
      data: {
        title,
        description,
        videoLink,
        price: priceInSOL,
        instructorId: session.user.id
      }
    });

    console.log('Course created:', course);

    // Create quiz questions if provided
    if (quizQuestions && quizQuestions.length > 0) {
      console.log('Creating quiz questions:', quizQuestions);
      await prisma.quizQuestion.createMany({
        data: quizQuestions.map((q: any) => ({
          courseId: course.id,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer
        }))
      });
    }

    return NextResponse.json({ 
      success: true,
      course: {
        id: course.id,
        title: course.title,
        description: course.description,
        videoLink: course.videoLink,
        price: course.price
      }
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
