import { NextResponse } from "next/server";
import {
  createCase,
  deleteCase,
  getCases,
  updateCase,
} from "@/services/case.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";

export async function handleGetCases() {
  try {
    const cases = await getCases();
    return NextResponse.json(cases);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch cases" },
      { status: 500 }
    );
  }
}

export async function handleCreateCase(request: Request) {
  try {
    const body = await request.json();
    await createCase(body);

    await recordAuditLog({
      action: "Created case",
      entity_type: "Case",
      entity_id: body.case_code || null,
      details: `Created case ${body.case_code || ""} - ${body.title || ""}`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({ message: "Case created successfully" });
  } catch {
    return NextResponse.json(
      { message: "Failed to create case" },
      { status: 400 }
    );
  }
}

export async function handleUpdateCase(request: Request, id: string) {
  try {
    const body = await request.json();
    await updateCase(id, body);

    await recordAuditLog({
      action: "Updated case",
      entity_type: "Case",
      entity_id: id,
      details: `Updated case ${body.case_code || id} - ${body.title || ""}`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({ message: "Case updated successfully" });
  } catch {
    return NextResponse.json(
      { message: "Failed to update case" },
      { status: 400 }
    );
  }
}

export async function handleDeleteCase(id: string) {
  try {
    await deleteCase(id);

    await recordAuditLog({
      action: "Deleted case",
      entity_type: "Case",
      entity_id: id,
      details: `Deleted case ID ${id}`,
    });

    return NextResponse.json({ message: "Case deleted successfully" });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete case" },
      { status: 500 }
    );
  }
}