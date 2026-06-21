import { NextResponse } from "next/server";
import { getAdminDashboardData } from "@/services/admin-dashboard.service";

export async function handleGetAdminDashboard() {
  try {
    const data = await getAdminDashboardData();

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET ADMIN DASHBOARD ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch admin dashboard data" },
      { status: 500 }
    );
  }
}