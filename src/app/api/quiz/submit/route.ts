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
    const { courseId, answers } = body;

    if (!courseId || !answers) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get quiz questions for the course
    const quizQuestions = await (prisma as any).quizQuestion.findMany({
      where: { courseId },
      select: {
        id: true,
        correctAnswer: true
      }
    });

    if (quizQuestions.length === 0) {
      return NextResponse.json({ error: 'No quiz questions found for this course' }, { status: 404 });
    }

    // Calculate score
    let correctAnswers = 0;
    quizQuestions.forEach((question: any) => {
      if (answers[question.id] === question.correctAnswer) {
        correctAnswers++;
      }
    });

    const score = correctAnswers;
    const totalQuestions = quizQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    // Save quiz result to enrollment
    const isPerfectScore = score === totalQuestions;
    
    await (prisma as any).enrollment.updateMany({
      where: {
        userId: session.user.id,
        courseId: courseId
      },
      data: {
        quizScore: score,
        quizAnswers: answers,
        status: isPerfectScore ? 'COMPLETED' : 'ACTIVE',
        completedAt: isPerfectScore ? new Date() : null
      }
    });

    return NextResponse.json({
      score,
      totalQuestions,
      percentage,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
