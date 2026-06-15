import { NextResponse } from "next/server";

const PUBLIC_PATHS = [
  "/onboarding",
  "/login",
  "/api/auth",
  "/_next",
  "/favicon",
];

function isPublic(pathname) {
  return (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) || pathname.match(/\.\w+$/)
  );
}

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  try {
    const authUrl = request.nextUrl.origin;
    const res = await fetch(`${authUrl}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") ?? "" },
    });

    if (!res.ok) {
      return NextResponse.next();
    }

    const session = await res.json();
    const pseudo = session?.user?.pseudo;

    if (session?.user && (pseudo === null || pseudo === undefined)) {
      const onboardingUrl = new URL("/onboarding", request.url);
      onboardingUrl.searchParams.set("redirect", pathname + search);
      return NextResponse.redirect(onboardingUrl);
    }
  } catch {
    // Ne pas bloquer la navigation si l'endpoint auth est indisponible
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
