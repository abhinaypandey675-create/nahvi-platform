import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { notify } from "./email";
import type { RequestMeta } from "./email";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("LOGIN ATTEMPT:", credentials?.email, "pw length:", credentials?.password?.length);
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        console.log("USER FOUND:", user ? user.email : "NONE", "hash exists:", !!user?.passwordHash);
        console.log("HASH FROM APP:", JSON.stringify(user?.passwordHash));
        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        console.log("PASSWORD VALID:", valid);
        if (!valid) return null;

        if (!user.emailVerified) {
          console.log("EMAIL NOT VERIFIED");
          throw new Error("EmailNotVerified");
        }

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role ?? "USER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      await prisma.loginEvent.create({
        data: { userId: (user as any).id },
      });
      await notify.userLoggedIn({ name: user.name, email: user.email! });
    },
    async createUser({ user }) {
      await notify.userRegistered({ name: user.name, email: user.email! });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export async function logLoginWithMeta(userId: string, meta: RequestMeta) {
  await prisma.loginEvent.create({
    data: { userId, ip: meta.ip, userAgent: meta.userAgent, country: meta.country },
  });
}
