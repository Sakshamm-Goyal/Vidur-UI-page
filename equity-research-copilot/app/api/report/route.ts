import { NextRequest, NextResponse } from "next/server";
import { fakeReportService } from "@/lib/services/fake-report-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { runId, template = "institutional_v1", sections = [] } = body;

    if (!runId) {
      return NextResponse.json({ error: "runId is required" }, { status: 400 });
    }

    const report = await fakeReportService.createReport(runId, template, sections);

    return NextResponse.json(report);
  } catch (error) {
    console.error("Error generating mock report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
