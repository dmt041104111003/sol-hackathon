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
          console.log('Attempting wallet authentication...');
          // Tự động đăng nhập với wallet address (no role by default)
          const result = await signIn('credentials', {
            walletAddress: publicKey.toString(),
            role: '', // Empty string instead of null
            redirect: false
          });

          console.log('SignIn result:', result);
          
          if (result?.ok) {
            // Đăng nhập thành công, redirect đến role selection
            console.log('Wallet authentication successful, redirecting to role selection');
            router.push('/auth/role-selection');
          } else {
            console.log('SignIn failed:', result?.error);
          }
        } catch (error) {
          console.error('Wallet auth error:', error);
        }
      } else if (!connected && session) {
        // Nếu wallet disconnect thì sign out
        signOut();
      }
    };

    handleWalletAuth();
  }, [connected, publicKey, session, router]);

  return null; // Component này không render gì, chỉ xử lý logic
}
