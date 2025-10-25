import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const courseId = params.id;

    // Check if course exists and belongs to the instructor
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id
      }
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    // Delete course (cascade will handle related records)
    await prisma.course.delete({
      where: {
        id: courseId
      }
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
