import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const webTeamData = await query(`SELECT * FROM webteam`);

    return NextResponse.json(
      webTeamData,
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching web team data:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
