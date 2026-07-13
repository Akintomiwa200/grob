import { NextRequest, NextResponse } from "next/server";

const PROD_DOMAIN = "grob.app";

function getSubdomain(host: string): string | null {
  const hostname = host.split(":")[0].toLowerCase();

  // lms.localhost → subdomain "lms"
  if (hostname.endsWith(".localhost")) {
    return hostname.replace(".localhost", "");
  }

  // lms.grob.app → subdomain "lms"
  const parts = hostname.split(".");
  if (parts.length >= 3 && hostname.endsWith(PROD_DOMAIN)) {
    return parts[0];
  }

  return null;
}

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const subdomain = getSubdomain(host);

  if (subdomain) {
    const pathname = req.nextUrl.pathname;
    if (pathname.startsWith("/p/")) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = `/p/${subdomain}${pathname}`;
    const res = NextResponse.rewrite(url);
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/(.*)"],
};
