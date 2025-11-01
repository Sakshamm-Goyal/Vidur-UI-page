import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await context.params;
    const run = await fakeResearchService.getRun(runId);
    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    return NextResponse.json(run);
  } catch (error) {
    console.error("Error fetching run details:", error);
    return NextResponse.json(
      { error: "Failed to fetch run details" },
      { status: 500 },
    );
  }
}
