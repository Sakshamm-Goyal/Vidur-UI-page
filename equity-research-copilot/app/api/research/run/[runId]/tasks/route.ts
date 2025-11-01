import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ runId: string }> },
) {
  try {
    const { runId } = await context.params;
    const tasks = fakeResearchService.getSubAgentTasks(runId);
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching sub-agent tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub-agent tasks" },
      { status: 500 },
    );
  }
}
