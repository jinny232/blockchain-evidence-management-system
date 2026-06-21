import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/session";
import {
  getInvestigatorEvidence,
  getInvestigatorEvidenceDetails,
  submitEvidenceByInvestigator,
} from "@/services/investigator-evidence.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";
import type { InvestigatorEvidenceType } from "@/models/investigator-evidence.model";

type SessionLike = {
  id?: string | number;
  userId?: string | number;
  role?: string;
};

const allowedEvidenceTypes: InvestigatorEvidenceType[] = [
  "Image",
  "Document",
  "Video",
  "Audio",
  "Disk Image",
  "Network Log",
  "Other",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

async function getInvestigatorIdFromRequest(request: NextRequest) {
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

  if (session.role !== "Investigator") {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Forbidden. Investigator access only." },
        { status: 403 }
      ),
    };
  }

  const rawUserId = session.id ?? session.userId;
  const investigatorId = Number(rawUserId);

  if (!Number.isFinite(investigatorId)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { message: "Invalid investigator session." },
        { status: 401 }
      ),
    };
  }

  return {
    ok: true as const,
    investigatorId,
  };
}

export async function handleGetInvestigatorEvidence(request: NextRequest) {
  try {
    const auth = await getInvestigatorIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const evidence = await getInvestigatorEvidence(auth.investigatorId);

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET INVESTIGATOR EVIDENCE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load your evidence." },
      { status: 500 }
    );
  }
}

export async function handleGetInvestigatorEvidenceDetails(
  request: NextRequest,
  evidenceId: string
) {
  try {
    const auth = await getInvestigatorIdFromRequest(request);

    if (!auth.ok) return auth.response;

    const numericEvidenceId = Number(evidenceId);

    if (!Number.isFinite(numericEvidenceId)) {
      return NextResponse.json(
        { message: "Invalid evidence ID." },
        { status: 400 }
      );
    }

    const evidence = await getInvestigatorEvidenceDetails(
      auth.investigatorId,
      numericEvidenceId
    );

    if (!evidence) {
      return NextResponse.json(
        { message: "Evidence not found or not submitted by you." },
        { status: 404 }
      );
    }

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET INVESTIGATOR EVIDENCE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load evidence details." },
      { status: 500 }
    );
  }
}

export async function handleSubmitInvestigatorEvidence(request: NextRequest) {
  const auth = await getInvestigatorIdFromRequest(request);

  if (!auth.ok) return auth.response;

  try {
    const formData = await request.formData();

    const caseIdValue = formData.get("caseId");
    const evidenceTypeValue = formData.get("evidenceType");
    const descriptionValue = formData.get("description");
    const fileValue = formData.get("file");

    const caseId = Number(caseIdValue);
    const evidenceType = String(
      evidenceTypeValue || ""
    ) as InvestigatorEvidenceType;

    const description =
      typeof descriptionValue === "string" && descriptionValue.trim()
        ? descriptionValue.trim()
        : null;

    if (!Number.isFinite(caseId)) {
      return NextResponse.json(
        { message: "Please choose a valid case." },
        { status: 400 }
      );
    }

    if (!allowedEvidenceTypes.includes(evidenceType)) {
      return NextResponse.json(
        { message: "Please choose a valid evidence type." },
        { status: 400 }
      );
    }

    if (!(fileValue instanceof File) || fileValue.size === 0) {
      return NextResponse.json(
        { message: "Please choose an evidence file." },
        { status: 400 }
      );
    }

    if (fileValue.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "File is too large. Maximum size is 50MB." },
        { status: 400 }
      );
    }

    const arrayBuffer = await fileValue.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const evidence = await submitEvidenceByInvestigator({
      investigatorId: auth.investigatorId,
      caseId,
      evidenceType,
      description,
      fileBuffer,
      fileName: fileValue.name,
      mimeType: fileValue.type || "application/octet-stream",
    });

    await recordAuditLog({
      actor_name: evidence.submitted_by,
      actor_role: "Investigator",
      action: "Submitted evidence",
      entity_type: "Evidence",
      entity_id: String(evidence.id),
      status: "Success",
      details: `Submitted ${evidence.evidence_type} evidence #${evidence.id} to case ${evidence.case_code}. SHA-256: ${evidence.file_hash}. Blockchain: ${
        evidence.blockchain_status || "Not Recorded"
      }. Tx: ${evidence.blockchain_tx_hash || "N/A"}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Evidence submitted successfully.",
      evidence,
    });
  } catch (error) {
    console.error("SUBMIT INVESTIGATOR EVIDENCE ERROR:", error);

    await recordAuditLog({
      actor_name: "Investigator",
      actor_role: "Investigator",
      action: "Submit evidence failed",
      entity_type: "Evidence",
      status: "Failed",
      details:
        error instanceof Error ? error.message : "Submit evidence failed.",
      ip_address: getRequestIp(request),
    });

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to submit evidence.",
      },
      { status: 500 }
    );
  }
}