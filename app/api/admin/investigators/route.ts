import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      `
      SELECT id, full_name
      FROM users
      WHERE role = 'Investigator'
      AND active = 1
      ORDER BY full_name
      `
    );

    return NextResponse.json(rows);
  } catch {
    return NextResponse.json(
      { message: "Failed to load investigators" },
      { status: 500 }
    );
  }
}