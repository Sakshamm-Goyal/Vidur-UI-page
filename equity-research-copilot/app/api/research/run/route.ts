import { NextRequest, NextResponse } from "next/server";
import { fakeResearchService } from "@/lib/services/fake-research-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, ticker, deep = false } = body;

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const run = await fakeResearchService.createRun(query, ticker, deep);

    return NextResponse.json(run);
  } catch (error) {
    console.error("Error creating research run:", error);
    return NextResponse.json(
      { error: "Failed to create research run" },
      { status: 500 }
    );
  }
}
