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
    const { courseId, walletAddress, paymentSignature, preCheck } = body;

    if (!courseId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if course exists and get instructor wallet address
    const course = await (prisma as any).course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            walletAddress: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check if instructor has wallet address set
    if (!course.instructor.walletAddress) {
      return NextResponse.json({ 
        error: 'Instructor has not set up payment wallet. Please contact the instructor.' 
      }, { status: 400 });
    }

    // If this is a preCheck, just return instructor wallet address
    if (preCheck) {
      return NextResponse.json({
        instructorWalletAddress: course.instructor.walletAddress,
        courseTitle: course.title,
        coursePrice: course.price
      });
    }

    // Check if user is trying to enroll in their own course
    if (course.instructorId === session.user.id) {
      return NextResponse.json({ 
        error: 'You cannot enroll in your own course' 
      }, { status: 400 });
    }

    // Check if user is an educator trying to enroll in another educator's course
    if (session.user.role === 'EDUCATOR') {
      return NextResponse.json({ 
        error: 'Educators cannot enroll in courses. Only students can enroll.' 
      }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.user.id,
          courseId: courseId
        }
      }
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 400 });
    }

    // Verify payment signature if provided
    if (paymentSignature) {
      try {
        const { Connection } = await import('@solana/web3.js');
        const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
        
        // Verify the transaction exists and is confirmed
        const transaction = await connection.getTransaction(paymentSignature);
        if (!transaction) {
          return NextResponse.json({ error: 'Payment transaction not found' }, { status: 400 });
        }
        
        console.log('Payment verified:', paymentSignature);
      } catch (error) {
        console.error('Payment verification error:', error);
        return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }
    }

    const paymentAmount = course.price; // Amount in SOL

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: session.user.id,
        courseId: courseId,
        paidAmount: paymentAmount,
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Successfully enrolled in course',
      enrollment: {
        id: enrollment.id,
        course: {
          id: enrollment.course.id,
          title: enrollment.course.title,
          instructor: enrollment.course.instructor.name
        },
        paidAmount: enrollment.paidAmount,
        enrolledAt: enrollment.enrolledAt
      }
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
