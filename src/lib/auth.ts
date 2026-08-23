import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const identifier = (credentials.email as string).trim();
        const cleanedPhone = identifier.replace(/[\s\-()]/g, "");
        const phoneVariations = Array.from(
          new Set([
            identifier,
            cleanedPhone,
            ...(cleanedPhone.startsWith("0")
              ? ["254" + cleanedPhone.slice(1), "+254" + cleanedPhone.slice(1)]
              : cleanedPhone.startsWith("+254")
              ? ["0" + cleanedPhone.slice(4), cleanedPhone.slice(1)]
              : cleanedPhone.startsWith("254")
              ? ["0" + cleanedPhone.slice(3), "+" + cleanedPhone]
              : []),
          ])
        ).filter(Boolean);

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              ...phoneVariations.map((p) => ({ phone: p })),
            ],
          },
        });

        if (!user) return null;

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) return null;

        // Allow login whether verified or not (soft verification)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          emailVerified: !!user.emailVerified,
          phone: user.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
        token.emailVerified = (user as any).emailVerified;
        token.phone = (user as any).phone;
      }
      if (trigger === "update" && session) {
        if (typeof session.emailVerified !== "undefined") {
          token.emailVerified = session.emailVerified;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
        (session.user as any).emailVerified = !!token.emailVerified;
        session.user.phone = (token.phone as string) || null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
});
