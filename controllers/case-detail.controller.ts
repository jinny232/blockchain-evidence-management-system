import { NextResponse } from "next/server";
import { getCaseDetails } from "@/services/case-detail.service";

export async function handleGetCaseDetails(id: string) {
  try {
    const data = await getCaseDetails(id);

    if (!data) {
      return NextResponse.json(
        { message: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET CASE DETAILS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch case details" },
      { status: 500 }
    );
  }
}