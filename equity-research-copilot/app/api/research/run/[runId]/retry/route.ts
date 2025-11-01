import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await context.params;
    const status = await fakeResearchService.retryRun(runId);
    if (!status) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }
    return NextResponse.json(status);
  } catch (error) {
    console.error("Error retrying research run:", error);
    return NextResponse.json(
      { error: "Failed to retry research run" },
      { status: 500 },
    );
  }
}
