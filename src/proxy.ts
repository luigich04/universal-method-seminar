import { NextResponse, NextRequest } from "next/server";

const LOCALES = ["it", "en"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip api, admin, _next, and files with extensions (e.g. .png, .jpg, .ico, .css)
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if pathname already has a supported locale
  const pathnameHasLocale = LOCALES.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) return NextResponse.next();

  // Automatic browser language detection
  const acceptLang = request.headers.get("accept-language") || "";
  const preferredLocale = acceptLang.toLowerCase().includes("it") ? "it" : "en";

  const url = request.nextUrl.clone();
  url.pathname = `/${preferredLocale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!api|admin|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
