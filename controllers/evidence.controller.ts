import { NextResponse } from "next/server";
import {
  getEvidenceById,
  getEvidenceRecords,
} from "@/services/evidence.service";

export async function handleGetEvidenceRecords() {
  try {
    const evidence = await getEvidenceRecords();
    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET EVIDENCE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch evidence records" },
      { status: 500 }
    );
  }
}

export async function handleGetEvidenceById(id: string) {
  try {
    const evidence = await getEvidenceById(id);

    if (!evidence) {
      return NextResponse.json(
        { message: "Evidence not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("GET EVIDENCE BY ID ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch evidence details" },
      { status: 500 }
    );
  }
}