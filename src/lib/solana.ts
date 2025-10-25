import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { AnchorProvider, Program, BN } from '@coral-xyz/anchor';
import idl from '../idl/apec_lms.json';

export const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');

export class SolanaService {
  private connection: Connection;
  private program: Program;
  private provider: AnchorProvider;

  constructor() {
    this.connection = new Connection(
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      'confirmed'
    );
    
    const keypair = Keypair.generate();
    const wallet = {
      publicKey: keypair.publicKey,
      signTransaction: async (tx: any) => {
        tx.sign(keypair);
        return tx;
      },
      signAllTransactions: async (txs: any[]) => {
        return txs.map(tx => {
          tx.sign(keypair);
          return tx;
        });
      }
    };
    this.provider = new AnchorProvider(this.connection, wallet as any, {});
    this.program = new Program(idl as any, PROGRAM_ID, this.provider);
  }

  async initializeLMS(name: string, description: string) {
    try {
      const [lmsAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('lms')],
        this.program.programId
      );

      const tx = await this.program.methods
        .initializeLms(name, description)
        .accounts({
          lmsAccount,
          authority: this.provider.wallet.publicKey,
          systemProgram: PublicKey.default,
        })
        .rpc();

      return { success: true, tx, lmsAccount: lmsAccount.toString() };
    } catch (error) {
      console.error('Error initializing LMS:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async createCourse(
    courseId: string,
    title: string,
    description: string,
    price: number,
    maxStudents: number
  ) {
    try {
      const [courseAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('course'), Buffer.from(courseId)],
        this.program.programId
      );

      const [lmsAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('lms')],
        this.program.programId
      );

      const tx = await this.program.methods
        .createCourse(courseId, title, description, new BN(price), maxStudents)
        .accounts({
          course: courseAccount,
          lmsAccount,
          instructor: this.provider.wallet.publicKey,
          systemProgram: PublicKey.default,
        })
        .rpc();

      return { success: true, tx, courseAccount: courseAccount.toString() };
    } catch (error) {
      console.error('Error creating course:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async enrollStudent(enrollmentId: string, courseId: string) {
    try {
      const [enrollmentAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('enrollment'), Buffer.from(enrollmentId)],
        this.program.programId
      );

      const [courseAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('course'), Buffer.from(courseId)],
        this.program.programId
      );

      const [lmsAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('lms')],
        this.program.programId
      );

      const tx = await this.program.methods
        .enrollStudent(enrollmentId)
        .accounts({
          enrollment: enrollmentAccount,
          course: courseAccount,
          lmsAccount,
          student: this.provider.wallet.publicKey,
          systemProgram: PublicKey.default,
        })
        .rpc();

      return { success: true, tx, enrollmentAccount: enrollmentAccount.toString() };
    } catch (error) {
      console.error('Error enrolling student:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async issueCertificate(
    certificateId: string,
    student: PublicKey,
    courseId: string,
    credentialType: string,
    metadataUri: string
  ) {
    try {
      const [certificateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('certificate'), Buffer.from(certificateId)],
        this.program.programId
      );

      const [courseAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('course'), Buffer.from(courseId)],
        this.program.programId
      );

      const tx = await this.program.methods
        .issueCertificate(certificateId, credentialType, metadataUri)
        .accounts({
          certificate: certificateAccount,
          course: courseAccount,
          student,
          instructor: this.provider.wallet.publicKey,
          systemProgram: PublicKey.default,
        })
        .rpc();

      return { success: true, tx, certificateAccount: certificateAccount.toString() };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async awardTokens(amount: number, achievementType: string, student: PublicKey) {
    try {
      const [achievementAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('achievement'), student.toBuffer(), Buffer.from(achievementType)],
        this.program.programId
      );

      const tx = await this.program.methods
        .awardTokens(new BN(amount), achievementType)
        .accounts({
          achievement: achievementAccount,
          student,
          studentTokenAccount: student, // Use student's main account
          authority: this.provider.wallet.publicKey,
          tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          systemProgram: PublicKey.default,
        })
        .rpc();

      return { success: true, tx, achievementAccount: achievementAccount.toString() };
    } catch (error) {
      console.error('Error awarding tokens:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async updateProgress(enrollmentId: string, progress: number) {
    try {
      const [enrollmentAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('enrollment'), Buffer.from(enrollmentId)],
        this.program.programId
      );

      const tx = await this.program.methods
        .updateProgress(progress)
        .accounts({
          enrollment: enrollmentAccount,
          student: this.provider.wallet.publicKey,
        })
        .rpc();

      return { success: true, tx };
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getLMSAccount() {
    try {
      const [lmsAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('lms')],
        this.program.programId
      );

      const account = await this.program.account.lmsAccount.fetch(lmsAccount);
      return { success: true, data: account };
    } catch (error) {
      console.error('Error fetching LMS account:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCourse(courseId: string) {
    try {
      const [courseAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('course'), Buffer.from(courseId)],
        this.program.programId
      );

      const account = await this.program.account.course.fetch(courseAccount);
      return { success: true, data: account };
    } catch (error) {
      console.error('Error fetching course:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getEnrollment(enrollmentId: string) {
    try {
      const [enrollmentAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('enrollment'), Buffer.from(enrollmentId)],
        this.program.programId
      );

      const account = await this.program.account.enrollment.fetch(enrollmentAccount);
      return { success: true, data: account };
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async getCertificate(certificateId: string) {
    try {
      const [certificateAccount] = PublicKey.findProgramAddressSync(
        [Buffer.from('certificate'), Buffer.from(certificateId)],
        this.program.programId
      );

      const account = await this.program.account.certificate.fetch(certificateAccount);
      return { success: true, data: account };
    } catch (error) {
      console.error('Error fetching certificate:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

}

export const solanaService = new SolanaService();
