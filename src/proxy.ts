import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Matcher for all paths except api (unless we want to protect all API routes too, but we'll do API protection in the route handlers),
  // _next/static, _next/image, favicon.ico, images/ etc.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images/).*)"],
};
