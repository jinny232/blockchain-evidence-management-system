import { NextResponse } from "next/server";
import {
  deleteTeamAssignment,
  getTeamAssignmentData,
  updateCaseTeam,
} from "@/services/team-assignment.service";
import {
  getRequestIp,
  recordAuditLog,
} from "@/services/audit-helper.service";

export async function handleGetTeamAssignments() {
  try {
    const data = await getTeamAssignmentData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET TEAM ASSIGNMENTS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch team assignments" },
      { status: 500 }
    );
  }
}

export async function handleUpdateCaseTeam(request: Request, caseId: string) {
  try {
    const body = await request.json();

    const assignments = Array.isArray(body.assignments)
      ? body.assignments
          .filter((item: any) => item.user_id && item.role)
          .map((item: any) => ({
            user_id: Number(item.user_id),
            role: String(item.role),
          }))
      : [];

    await updateCaseTeam({
      case_id: Number(caseId),
      assignments,
      assigned_by: body.assigned_by || "Admin",
    });

    await recordAuditLog({
      action: "Updated case team",
      entity_type: "Case",
      entity_id: caseId,
      details: `Updated team for case ID ${caseId}. Total assigned members: ${assignments.length}.`,
      ip_address: getRequestIp(request),
    });

    return NextResponse.json({
      success: true,
      message: "Case team updated successfully",
    });
  } catch (error) {
    console.error("UPDATE CASE TEAM ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update case team" },
      { status: 500 }
    );
  }
}

export async function handleDeleteTeamAssignment(id: string) {
  try {
    await deleteTeamAssignment(id);

    await recordAuditLog({
      action: "Removed team member",
      entity_type: "Team Assignment",
      entity_id: id,
      details: `Removed team assignment ID ${id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Team assignment removed successfully",
    });
  } catch (error) {
    console.error("DELETE TEAM ASSIGNMENT ERROR:", error);

    return NextResponse.json(
      { message: "Failed to remove team assignment" },
      { status: 500 }
    );
  }
}