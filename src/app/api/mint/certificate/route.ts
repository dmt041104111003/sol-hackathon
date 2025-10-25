import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { solanaService } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'EDUCATOR') {
      return NextResponse.json({ error: 'Only educators can mint certificates' }, { status: 403 });
    }

    const body = await request.json();
    const { studentId, courseId, credentialType, metadataUri } = body;

    if (!studentId || !courseId || !credentialType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const studentPublicKey = new PublicKey(studentId);

      const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const result = await solanaService.issueCertificate(
        certificateId,
        studentPublicKey,
        courseId,
        credentialType,
        metadataUri || `https://api.example.com/certificates/${certificateId}`
      );

      if (result.success) {
        return NextResponse.json({
          success: true,
          certificateId,
          transaction: result.tx,
          certificateAccount: result.certificateAccount,
          message: 'Certificate minted successfully'
        });
      } else {
        return NextResponse.json({
          error: 'Failed to mint certificate',
          details: result.error
        }, { status: 500 });
      }
    } catch (error) {
      return NextResponse.json({
        error: 'Failed to mint certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
