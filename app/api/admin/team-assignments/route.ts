import { handleGetTeamAssignments } from "@/controllers/team-assignment.controller";

export async function GET() {
  return handleGetTeamAssignments();
}