'use client';

import { useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function WalletAuth() {
  const { publicKey, connected } = useWallet();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    const handleWalletAuth = async () => {
      if (connected && publicKey && !session) {
        try {
          const result = await signIn('credentials', {
            walletAddress: publicKey.toString(),
            role: '',
            redirect: false
          });

          if (result?.ok) {
            router.push('/auth/role-selection');
          }
        } catch (error) {
        }
      } else if (!connected && session) {
        signOut();
      }
    };

    handleWalletAuth();
  }, [connected, publicKey, session, router]);

  return null;
}
