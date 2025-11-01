import { NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function GET() {
  try {
    const history = await fakeResearchService.getRunHistory();
    return NextResponse.json({ runs: history });
  } catch (error) {
    console.error("Error fetching run history:", error);
    return NextResponse.json(
      { error: "Failed to fetch run history" },
      { status: 500 },
    );
  }
}
