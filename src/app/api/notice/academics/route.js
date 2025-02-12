import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const academicsData = await query(`SELECT * FROM Notices WHERE notice_type = 'academics'`);

    return NextResponse.json(academicsData, { status: 200 });
  } catch (error) {
    console.error("Error fetching academic notices:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
