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

        // Check if user exists
        let user = await prisma.user.findUnique({
          where: { walletAddress: credentials.walletAddress }
        })

        // Create user if doesn't exist
        if (!user) {
          user = await prisma.user.create({
            data: {
              walletAddress: credentials.walletAddress,
              role: credentials.role as "STUDENT" | "EDUCATOR" || "STUDENT"
            }
          })
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
    signIn: "/auth/signin",
    signUp: "/auth/role-selection"
  },
  session: {
    strategy: "jwt"
  }
}
