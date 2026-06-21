import { SignJWT, jwtVerify } from "jose";
import type { UserRole } from "@/models/user.model";

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret");

export interface SessionPayload {
  userId: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as SessionPayload;
}

export function getRoleRedirectPath(role: UserRole) {
  const paths: Record<UserRole, string> = {
    Admin: "/admin",
    Investigator: "/investigator",
    "Lab Technician": "/lab",
    Lawyer: "/legal",
    Judge: "/judge",
  };

  return paths[role];
}