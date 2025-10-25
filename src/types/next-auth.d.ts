import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      walletAddress?: string
      role?: string
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    walletAddress?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    walletAddress?: string
    role?: string
  }
}
