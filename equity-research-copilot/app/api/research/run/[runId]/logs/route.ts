import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await context.params;
    const logs = await fakeResearchService.getRunLogs(runId);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Error fetching run logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch run logs" },
      { status: 500 }
    );
  }
}
