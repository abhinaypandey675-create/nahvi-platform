import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    if (token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/admin/login?error=NotAdmin", req.url));
    }
  },
  {
    callbacks: {
      // Just checks a session exists; the ADMIN-role check happens above so
      // we can redirect to a friendlier page than the default NextAuth one.
      authorized: ({ token }) => !!token,
    },
    pages: { signIn: "/admin/login" },
  }
);

export const config = {
  matcher: ["/admin", "/admin/((?!login).*)", "/api/admin/:path*"],
};
