import { NextRequest, NextResponse } from "next/server";
import { fakeReportService } from "@/lib/services/fake-report-service";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ reportId: string }> },
) {
  const { reportId } = await context.params;
  const stored = fakeReportService.getReport(reportId);

  if (!stored) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 });
  }

  const buffer = Buffer.from(stored.docx);

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${reportId}.docx"`,
      "Cache-Control": "no-store",
    },
  });
}
