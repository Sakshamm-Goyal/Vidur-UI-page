"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Download,
  Save,
  Lock,
  Unlock,
  Plus,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Table as TableIcon,
  AlignLeft,
} from "lucide-react";
import { useToastStore } from "@/lib/stores/toast-store";

interface ReportSection {
  id: string;
  title: string;
  content: string;
  locked: boolean;
  type: "text" | "chart" | "table";
}

const INITIAL_SECTIONS: ReportSection[] = [
  {
    id: "summary",
    title: "Executive Summary",
    content:
      "This report provides a comprehensive analysis of TATAMOTORS.NS based on our AI-powered research. Key findings include moderate positive bias on 1M horizon driven by DIIs cushioning FII outflows, JLR revenue momentum, and improved domestic PV mix.",
    locked: true,
    type: "text",
  },
  {
    id: "thesis",
    title: "Investment Thesis",
    content:
      "Moderate positive bias on 1M horizon driven by DIIs cushioning FII outflows. JLR revenue momentum and improved domestic PV mix offset near-term margin pressure from INR volatility. FY25 EPS revisions stable; debt/EBITDA at 1.2x suggests limited refinancing risk.",
    locked: false,
    type: "text",
  },
  {
    id: "performance",
    title: "Performance Analysis",
    content: "[Performance charts and KPIs will be inserted here]",
    locked: true,
    type: "chart",
  },
  {
    id: "valuation",
    title: "Valuation",
    content:
      "Current Forward P/E of 15.2x is at the 68th percentile of its 5-year range. EV/EBITDA multiple of 8.5x suggests fair valuation relative to sector peers.",
    locked: false,
    type: "text",
  },
  {
    id: "risks",
    title: "Risk Factors",
    content:
      "Key risks include FX volatility, oil price fluctuations, regulatory changes, and competitive pressures in the domestic market.",
    locked: false,
    type: "text",
  },
  {
    id: "peer-comp",
    title: "Peer Comparison",
    content: "[Peer comparison table will be inserted here]",
    locked: true,
    type: "table",
  },
];

export default function ReportBuilderPage() {
  return (
    <Suspense fallback={<div className="px-6 py-8 text-sm text-muted-foreground">Loading report builder…</div>}>
      <ReportBuilderContent />
    </Suspense>
  );
}

function ReportBuilderContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("runId") ?? "RUN-01043";

  const [sections, setSections] = useState<ReportSection[]>(INITIAL_SECTIONS);
  const [reportTitle, setReportTitle] = useState(
    runId === "RUN-01043" ? "TATAMOTORS.NS - 1M Horizon Analysis" : `${runId} - Institutional Draft`
  );
  const [selectedSection, setSelectedSection] = useState<string | null>(
    "summary"
  );
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);
  const { addToast } = useToastStore();

  const handleToggleLock = (id: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, locked: !s.locked } : s))
    );
  };

  const handleUpdateContent = (id: string, content: string) => {
    setSections(
      sections.map((s) => (s.id === id ? { ...s, content } : s))
    );
  };

  const handleAddSection = () => {
    const newSection: ReportSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      content: "Enter your analysis here...",
      locked: false,
      type: "text",
    };
    setSections([...sections, newSection]);
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  };

  const exportPayload = useMemo(
    () => ({
      runId,
      template: "institutional_v1",
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        locked: section.locked,
        type: section.type,
      })),
    }),
    [runId, sections],
  );

  const downloadFile = async (url: string, filename: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Download failed");
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(objectUrl);
  };

  const handleExport = async (format: "pdf" | "docx") => {
    try {
      setIsExporting(format);
      addToast({
        title: `Exporting ${format.toUpperCase()}`,
        description: "Generating mocked institutional report…",
        variant: "default",
      });

      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exportPayload),
      });

      if (!response.ok) {
        throw new Error("Report generation failed");
      }

      const data = await response.json();
      const url = format === "pdf" ? data.url_pdf : data.url_docx;
      if (!url) throw new Error("Download URL missing");

      await downloadFile(
        url,
        `${reportTitle.replace(/\s+/g, "_").toLowerCase()}.${format}`,
      );

      addToast({
        title: `${format.toUpperCase()} ready`,
        description: "Download complete with embedded charts, tables, and metadata.",
        variant: "success",
      });
    } catch (error) {
      console.error("Export error", error);
      addToast({
        title: "Export failed",
        description: "We could not generate the mock export. Please retry.",
        variant: "error",
      });
    } finally {
      setIsExporting(null);
    }
  };

  const handleSaveDraft = () => {
    addToast({
      title: "Draft Saved",
      description: "Your changes have been saved",
      variant: "success",
    });
  };

  const selectedSectionData = sections.find((s) => s.id === selectedSection);

  return (
    <div className="container max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <FileText className="h-8 w-8 text-primary" />
            <Input
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              className="max-w-2xl text-2xl font-bold"
            />
          </div>
          <p className="text-muted-foreground">
            Build and customize your equity research report
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("docx")}
            className="gap-2"
            disabled={isExporting !== null}
          >
            <Download className="h-4 w-4" />
            DOCX
          </Button>
          <Button onClick={() => handleExport("pdf")} className="gap-2" disabled={isExporting !== null}>
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Left: Section List */}
        <div className="col-span-3">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Report Sections</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleAddSection}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setSelectedSection(section.id)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                      selectedSection === section.id
                        ? "bg-muted border-l-4 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {section.type === "text" && (
                        <AlignLeft className="h-4 w-4 flex-shrink-0" />
                      )}
                      {section.type === "chart" && (
                        <ImageIcon className="h-4 w-4 flex-shrink-0" />
                      )}
                      {section.type === "table" && (
                        <TableIcon className="h-4 w-4 flex-shrink-0" />
                      )}
                      <span className="text-sm font-medium truncate">
                        {section.title}
                      </span>
                    </div>
                    {section.locked && (
                      <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-base">Report Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sections:</span>
                <span className="font-mono">{sections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Locked:</span>
                <span className="font-mono">
                  {sections.filter((s) => s.locked).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated:</span>
                <span className="text-xs">Just now</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Editor */}
        <div className="col-span-9">
          {selectedSectionData ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Input
                      value={selectedSectionData.title}
                      onChange={(e) =>
                        setSections(
                          sections.map((s) =>
                            s.id === selectedSectionData.id
                              ? { ...s, title: e.target.value }
                              : s
                          )
                        )
                      }
                      className="font-semibold text-lg border-0 shadow-none focus-visible:ring-0 px-0"
                      disabled={selectedSectionData.locked}
                    />
                    <Badge variant="outline">
                      {selectedSectionData.type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        handleToggleLock(selectedSectionData.id)
                      }
                      className="gap-2"
                    >
                      {selectedSectionData.locked ? (
                        <>
                          <Lock className="h-4 w-4" />
                          Locked
                        </>
                      ) : (
                        <>
                          <Unlock className="h-4 w-4" />
                          Unlocked
                        </>
                      )}
                    </Button>
                    {!selectedSectionData.locked && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          handleDeleteSection(selectedSectionData.id)
                        }
                        className="gap-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {selectedSectionData.locked ? (
                  <div className="bg-muted/30 border-2 border-dashed rounded-lg p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Lock className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          AI-Generated Section (Locked)
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          This section was generated by AI and is locked to
                          preserve data integrity. You can view but not edit
                          this content.
                        </p>
                        <div className="bg-background rounded-lg p-4 border">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {selectedSectionData.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <textarea
                      value={selectedSectionData.content}
                      onChange={(e) =>
                        handleUpdateContent(
                          selectedSectionData.id,
                          e.target.value
                        )
                      }
                      className="w-full min-h-[400px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter your analysis here..."
                    />
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Edit3 className="h-3 w-3" />
                      <span>
                        {selectedSectionData.content.length} characters
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Section Selected</h3>
                <p className="text-sm text-muted-foreground">
                  Select a section from the left to start editing
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
