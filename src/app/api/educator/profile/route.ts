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
    if (session.user.role !== 'EDUCATOR') {
      return NextResponse.json({ error: 'Only educators can access this endpoint' }, { status: 403 });
    }
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      walletAddress: (user as any).walletAddress,
      role: user.role
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (session.user.role !== 'EDUCATOR') {
      return NextResponse.json({ error: 'Only educators can access this endpoint' }, { status: 403 });
    }

    const body = await request.json();
    const { walletAddress } = body;

    if (!walletAddress) {
      return NextResponse.json({ error: 'Wallet address is required' }, { status: 400 });
    }
    const updatedUser = await (prisma as any).user.update({
      where: { id: session.user.id },
      data: { walletAddress }
    });

    return NextResponse.json({
      message: 'Wallet address updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        walletAddress: (updatedUser as any).walletAddress,
        role: updatedUser.role
      }
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
