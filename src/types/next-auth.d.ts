import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      emailVerified?: boolean | Date | null;
      phone?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    phone?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    id?: string;
    emailVerified?: boolean;
    phone?: string | null;
  }
}
