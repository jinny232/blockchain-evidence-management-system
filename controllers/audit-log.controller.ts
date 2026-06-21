import { NextResponse } from "next/server";
import { getAuditLogs } from "@/services/audit-log.service";

export async function handleGetAuditLogs() {
  try {
    const logs = await getAuditLogs();

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET AUDIT LOGS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch audit logs" },
      { status: 500 }
    );
  }
}