import { handleDeleteTeamAssignment } from "@/controllers/team-assignment.controller";

interface Params {
  params: Promise<{ id: string }>;
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  return handleDeleteTeamAssignment(id);
}