import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await context.params;
    const results = await fakeResearchService.getRunResults(runId);

    if (!results) {
      return NextResponse.json(
        { error: "Results not ready or run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching run results:", error);
    return NextResponse.json(
      { error: "Failed to fetch run results" },
      { status: 500 }
    );
  }
}
