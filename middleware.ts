import { NextResponse, type NextRequest } from "next/server";

import { getSessionFromRequest } from "@/lib/auth";

export const middleware = async (request: NextRequest) => {
  const session = await getSessionFromRequest(request);
  if (!session) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
};

export const config = {
  matcher: ["/dashboard/:path*"],
};
