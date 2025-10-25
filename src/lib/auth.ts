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
        if (!credentials?.walletAddress) {
          return null
        }

        let user;
        try {
          user = await prisma.user.findUnique({
            where: { walletAddress: credentials.walletAddress }
          })

          if (!user) {
            const userData: any = {
              walletAddress: credentials.walletAddress
            };

            if (credentials.role && (credentials.role === 'STUDENT' || credentials.role === 'EDUCATOR')) {
              userData.role = credentials.role;
            }

            user = await prisma.user.create({
              data: userData
            })
          } else {
            if (credentials.role && (credentials.role === 'STUDENT' || credentials.role === 'EDUCATOR')) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { role: credentials.role }
              });
            }
          }
        } catch (error) {
          return null;
        }

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          walletAddress: user.walletAddress || undefined,
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
