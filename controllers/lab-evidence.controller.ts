import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  acceptLabEvidence,
  getLabEvidenceDetails,
  getLabEvidenceQueue,
  submitLabResult,
} from "@/services/lab-evidence.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

async function getLabTechnicianIdFromRequest(request: NextRequest) {
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

  if (session.role !== "Lab Technician") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Lab Technician access only." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const technicianId = Number(rawUserId);

  if (!Number.isFinite(technicianId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid lab technician session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    technicianId,
  };
}

export async function handleGetLabEvidenceQueue(request: NextRequest) {
  try {
    const auth = await getLabTechnicianIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const evidence = await getLabEvidenceQueue(auth.technicianId);

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET LAB EVIDENCE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load lab evidence queue." },
      { status: 500 }
    );
  }
}

export async function handleGetLabEvidenceDetails(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getLabTechnicianIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const evidence = await getLabEvidenceDetails(
      auth.technicianId,
      numericEvidenceId
    );

    if (!evidence) {
      return NextResponse.json(
        { message: "Evidence not found or not assigned to you." },
        { status: 404 }
      );
    }

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET LAB EVIDENCE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load evidence details." },
      { status: 500 }
    );
  }
}

export async function handleAcceptLabEvidence(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getLabTechnicianIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const result = await acceptLabEvidence(auth.technicianId, numericEvidenceId);

    await recordAuditLog({
      actor_name: result.technician.full_name,
      actor_role: "Lab Technician",
      action: "Accepted evidence",
      entity_type: "Evidence",
      entity_id: evidenceId,
      status: "Success",
      details: `Accepted evidence #${evidenceId} for laboratory analysis.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Evidence accepted successfully.",
      evidence: result.evidence,
    });
  } catch (error) {
    console.error("ACCEPT LAB EVIDENCE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to accept evidence.",
      },
      { status: 500 }
    );
  }
}

export async function handleSubmitLabResult(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getLabTechnicianIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const formData = await request.formData();

const analysisTypeValue = formData.get("analysis_type");
const resultValue = formData.get("result");
const conclusionValue = formData.get("conclusion");
const attachmentValue = formData.get("attachment");

const analysisType =
  typeof analysisTypeValue === "string" && analysisTypeValue.trim()
    ? analysisTypeValue.trim()
    : null;

const result =
  typeof resultValue === "string" && resultValue.trim()
    ? resultValue.trim()
    : "";

const conclusion =
  typeof conclusionValue === "string" && conclusionValue.trim()
    ? conclusionValue.trim()
    : null;
const allowedMimeTypes = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const blockedExtensions = [
  ".exe",
  ".bat",
  ".cmd",
  ".sh",
  ".js",
  ".msi",
  ".dll",
];

let attachment:
  | {
      buffer: Buffer;
      fileName: string;
      mimeType: string;
      size: number;
    }
  | null = null;

if (attachmentValue instanceof File && attachmentValue.size > 0) {
  const fileName = attachmentValue.name.toLowerCase();

  const isBlocked = blockedExtensions.some((ext) => fileName.endsWith(ext));

  if (isBlocked) {
    return NextResponse.json(
      { message: "Executable files are not allowed for lab reports." },
      { status: 400 }
    );
  }

  if (!allowedMimeTypes.includes(attachmentValue.type)) {
    return NextResponse.json(
      {
        message:
          "Invalid attachment type. Please upload PDF, image, DOC/DOCX, TXT, CSV, or XLSX.",
      },
      { status: 400 }
    );
  }

  if (attachmentValue.size > 25 * 1024 * 1024) {
    return NextResponse.json(
      { message: "Attachment is too large. Maximum size is 25MB." },
      { status: 400 }
    );
  }

  const arrayBuffer = await attachmentValue.arrayBuffer();

  attachment = {
    buffer: Buffer.from(arrayBuffer),
    fileName: attachmentValue.name,
    mimeType: attachmentValue.type || "application/octet-stream",
    size: attachmentValue.size,
  };
}
    if (!result) {
      return NextResponse.json(
        { message: "Analysis result is required." },
        { status: 400 }
      );
    }

    const saved = await submitLabResult(auth.technicianId, numericEvidenceId, {
  analysis_type: analysisType,
  result,
  conclusion,
  attachment,
});

    await recordAuditLog({
      actor_name: saved.technician.full_name,
      actor_role: "Lab Technician",
      action: "Submitted lab result",
      entity_type: "Evidence",
      entity_id: evidenceId,
      status: "Success",
      details: `Submitted lab analysis result for evidence #${evidenceId}. Conclusion: ${
        conclusion || "N/A"
      }.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Lab result submitted successfully.",
      evidence: saved.evidence,
    });
  } catch (error) {
    console.error("SUBMIT LAB RESULT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit lab result.",
      },
      { status: 500 }
    );
  }
}