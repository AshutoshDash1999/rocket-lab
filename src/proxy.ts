import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

const authProxy = auth.middleware({
  loginUrl: "/",
  publicRoutes: ["/"],
});

/**
 * Auth gate. Signed-out visitors are sent to `/`; remember where they were
 * headed (e.g. a shared blueprint link) as `?next=` so sign-in returns them.
 */
export default async function proxy(request: NextRequest) {
  const res = await authProxy(request);
  const { pathname, search, origin } = request.nextUrl;
  const location = res.headers.get("location");
  if (location && pathname !== "/") {
    const to = new URL(location, request.url);
    if (to.origin === origin && to.pathname === "/") {
      to.searchParams.set("next", pathname + search);
      res.headers.set("location", to.toString());
    }
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg|jpeg|webp|ico)$).*)",
  ],
};
