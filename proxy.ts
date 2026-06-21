import { NextResponse, type NextRequest } from "next/server";
import { getRoleRedirectPath, verifySessionToken } from "@/lib/session";
import type { UserRole } from "@/models/user.model";

function getRequiredRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/admin")) return "Admin";
  if (pathname.startsWith("/investigator")) return "Investigator";
  if (pathname.startsWith("/lab")) return "Lab Technician";
  if (pathname.startsWith("/legal")) return "Lawyer";
  if (pathname.startsWith("/judge")) return "Judge";

  return null;
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const requiredRole = getRequiredRole(pathname);

  if (!requiredRole) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const session = await verifySessionToken(token);

    if (session.role !== requiredRole) {
      const correctDashboard = getRoleRedirectPath(session.role);
      return NextResponse.redirect(new URL(correctDashboard, request.url));
    }

    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", request.url);

    const response = NextResponse.redirect(loginUrl);

    response.cookies.set("session", "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return response;
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/investigator/:path*",
    "/lab/:path*",
    "/legal/:path*",
    "/judge/:path*",
  ],
};