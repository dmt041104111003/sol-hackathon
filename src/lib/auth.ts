import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "wallet",
      credentials: {
        walletAddress: { label: "Wallet Address", type: "text" },
        role: { label: "Role", type: "text" }
      },
      async authorize(credentials) {
        console.log('Auth credentials:', credentials);
        
        if (!credentials?.walletAddress) {
          console.log('No wallet address provided');
          return null
        }

        let user;
        try {
          // Check if user exists
          console.log('Checking if user exists...');
          user = await prisma.user.findUnique({
            where: { walletAddress: credentials.walletAddress }
          })
          console.log('User found:', user);

          // Create user if doesn't exist
          if (!user) {
            console.log('Creating new user...');
            const userData: any = {
              walletAddress: credentials.walletAddress
            };
            
            // Only set role if it's provided and valid
            if (credentials.role && (credentials.role === 'STUDENT' || credentials.role === 'EDUCATOR')) {
              userData.role = credentials.role;
            }
            
            user = await prisma.user.create({
              data: userData
            })
            console.log('User created:', user);
          } else {
            // Update role if provided and user exists
            if (credentials.role && (credentials.role === 'STUDENT' || credentials.role === 'EDUCATOR')) {
              console.log('Updating user role...');
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: credentials.role }
              });
              console.log('User role updated:', user);
            }
          }
        } catch (error) {
          console.error('Database error:', error);
          return null;
        }

        if (!user) {
          console.log('User not found or created');
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress,
          role: user.role
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.walletAddress = user.walletAddress
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub as string
        session.user.walletAddress = token.walletAddress as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: "/auth/signin"
  },
  session: {
    strategy: "jwt"
  }
}
