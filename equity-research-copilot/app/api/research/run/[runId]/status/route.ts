import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await context.params;
    const status = await fakeResearchService.getRunStatus(runId);

    if (!status) {
      return NextResponse.json(
        { error: "Run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error("Error fetching run status:", error);
    return NextResponse.json(
      { error: "Failed to fetch run status" },
      { status: 500 }
    );
  }
}
