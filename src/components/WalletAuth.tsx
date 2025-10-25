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
          // Tự động đăng nhập với wallet address
          const result = await signIn('credentials', {
            walletAddress: publicKey.toString(),
            role: 'STUDENT', // Default role, có thể thay đổi sau
            redirect: false
          });

          if (result?.ok) {
            // Đăng nhập thành công, không redirect tự động
            // Người dùng có thể navigate tự do giữa các trang
            console.log('Wallet authentication successful');
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
