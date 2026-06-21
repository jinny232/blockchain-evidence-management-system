import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import { verifyEvidenceHash } from "@/services/evidence-verification.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

const allowedRoles = [
  "Admin",
  "Investigator",
  "Lab Technician",
  "Lawyer",
  "Judge",
];

async function getSessionFromRequest(request: NextRequest) {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Unauthorized. Please login again." },
        { status: 401 }
      ),
    };
  }

  const session = (await verifySessionToken(token)) as SessionLike;

  if (!session.role || !allowedRoles.includes(session.role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Invalid role." },
        { status: 403 }
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}

export async function handleVerifyEvidenceHash(request: NextRequest) {
  try {
    const auth = await getSessionFromRequest(request);

    if (!auth.ok) return auth.response;

    const body = await request.json();

    const rawHash =
      typeof body.hash === "string" && body.hash.trim()
        ? body.hash.trim()
        : "";

    const normalizedHash = rawHash.replace(/^0x/i, "").toLowerCase();

    if (!normalizedHash) {
      return NextResponse.json(
        { message: "SHA-256 hash is required." },
        { status: 400 }
      );
    }

    if (!/^[a-f0-9]{64}$/.test(normalizedHash)) {
      return NextResponse.json(
        {
          message:
            "Invalid SHA-256 hash. It must be exactly 64 hexadecimal characters.",
        },
        { status: 400 }
      );
    }

    const result = await verifyEvidenceHash(normalizedHash);

    return NextResponse.json(result);
  } catch (error) {
    console.error("VERIFY EVIDENCE HASH ERROR:", error);

    return NextResponse.json(
      { message: "Failed to verify evidence hash." },
      { status: 500 }
    );
  }
}