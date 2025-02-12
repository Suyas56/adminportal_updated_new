import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const eventData = await query(`SELECT * FROM events ORDER BY eventStartDate DESC`);

    return NextResponse.json(eventData, { status: 200 });
  } catch (error) {
    console.error("Error fetching event data:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
