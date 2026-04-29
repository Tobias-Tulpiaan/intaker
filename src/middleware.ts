import { auth } from "@/auth";

export default auth((req) => {
  const isLogin = req.nextUrl.pathname.startsWith("/login");
  if (!req.auth && !isLogin) {
    const url = new URL("/login", req.nextUrl);
    return Response.redirect(url);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
