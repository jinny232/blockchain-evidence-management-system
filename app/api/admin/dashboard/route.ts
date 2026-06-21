import { handleGetAdminDashboard } from "@/controllers/admin-dashboard.controller";

export async function GET() {
  return handleGetAdminDashboard();
}