import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { CITY_COOKIE } from "./domain/cities";

const intl = createMiddleware(routing);

/** First app start (no city chosen yet) opens the welcome screen instead of the home screen. */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const home = routing.locales.find((l) => pathname === `/${l}` || pathname === `/${l}/`);
  if (home && !request.cookies.get(CITY_COOKIE)) {
    return NextResponse.redirect(new URL(`/${home}/willkommen`, request.url));
  }
  return intl(request);
}

export const config = {
  matcher: "/((?!api|app-icon|_next|_vercel|.*\\..*).*)",
};
