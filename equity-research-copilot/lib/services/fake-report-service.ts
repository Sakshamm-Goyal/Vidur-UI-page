import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import {
  Document,
  HeadingLevel,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  Packer,
} from "docx";
import type { Report, ReportSection } from "@/lib/types";
import { fakeResearchService } from "./fake-research-service";
import { formatNumber } from "@/lib/utils";

interface StoredReport {
  meta: Report;
  pdf: Uint8Array;
  docx: Uint8Array;
  createdAt: string;
}

class FakeReportService {
  private reports = new Map<string, StoredReport>();

  async createReport(runId: string, template: string, sections: ReportSection[]): Promise<Report> {
    const reportId = `REP-${Date.now().toString(36).toUpperCase()}`;
    const reportMeta: Report = {
      reportId,
      runId,
      template,
      sections,
    };

    const [pdf, docx] = await Promise.all([
      this.buildPdf(reportMeta),
      this.buildDocx(reportMeta),
    ]);

    this.reports.set(reportId, {
      meta: reportMeta,
      pdf,
      docx,
      createdAt: new Date().toISOString(),
    });

    await fakeResearchService.markRunExported(runId);

    return {
      ...reportMeta,
      url_pdf: `/api/report/${reportId}/pdf`,
      url_docx: `/api/report/${reportId}/docx`,
    };
  }

  getReport(reportId: string): StoredReport | null {
    return this.reports.get(reportId) || null;
  }

  private async buildPdf(report: Report): Promise<Uint8Array> {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const { width, height } = page.getSize();
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const margin = 48;
    let cursorY = height - margin;

    const results = await fakeResearchService.getRunResults(report.runId);

    const drawText = (text: string, size = 12, bold = false, lineSpacing = 18) => {
      const usedFont = bold ? fontBold : font;
      page.drawText(text, {
        x: margin,
        y: cursorY,
        size,
        font: usedFont,
        color: rgb(0.12, 0.16, 0.24),
      });
      cursorY -= lineSpacing;
    };

    drawText("Aime Institutional Equity Research Copilot", 11, true, 16);
    drawText(`Run ID: ${report.runId}`, 10, false, 14);
    drawText(`Generated: ${new Date().toLocaleString()}`, 10);
    cursorY -= 12;

    drawText(results?.summary.headline || "Institutional Research Summary", 18, true, 24);
    drawText(results?.summary.thesis || "Thesis unavailable", 11, false, 18);
    cursorY -= 6;

    if (results) {
      drawText("Key Metrics", 13, true, 20);
      const metricBlockY = cursorY;
      const blockHeight = 90;

      page.drawRectangle({
        x: margin,
        y: metricBlockY - blockHeight,
        width: width - margin * 2,
        height: blockHeight,
        color: rgb(0.95, 0.97, 1),
        borderColor: rgb(0.63, 0.76, 0.96),
        borderWidth: 1,
      });

      const metrics = [
        `1M Return: ${(results.kpis.ret_1m * 100).toFixed(1)}%`,
        `5Y CAGR: ${(results.kpis.cagr_5y * 100).toFixed(1)}%`,
        `Max Drawdown: ${(results.kpis.max_dd_5y * 100).toFixed(1)}%`,
        `Forward PE: ${results.valuation.fwd_pe.toFixed(1)}x`,
        `EV/EBITDA: ${results.valuation.ev_ebitda.toFixed(1)}x`,
      ];

      metrics.forEach((metric, idx) => {
        page.drawText(metric, {
          x: margin + 12,
          y: metricBlockY - 24 - idx * 16,
          font,
          size: 10,
        });
      });

      cursorY = metricBlockY - blockHeight - 20;

      // Mock chart placeholders
      const chartWidth = (width - margin * 2 - 24) / 2;
      const chartHeight = 120;
      const charts = ["Price | Drawdown Overlay", "Drivers Attribution"];
      charts.forEach((title, idx) => {
        const x = margin + idx * (chartWidth + 24);
        page.drawRectangle({
          x,
          y: cursorY - chartHeight,
          width: chartWidth,
          height: chartHeight,
          borderColor: rgb(0.25, 0.35, 0.58),
          borderWidth: 1.4,
          color: rgb(0.98, 0.99, 1),
        });
        page.drawText(title, {
          x: x + 12,
          y: cursorY - 18,
          font: fontBold,
          size: 11,
        });
        page.drawLine({
          start: { x: x + 12, y: cursorY - chartHeight + 18 },
          end: { x: x + chartWidth - 12, y: cursorY - chartHeight + 18 },
          color: rgb(0.78, 0.84, 0.94),
          thickness: 1,
        });
      });

      cursorY -= chartHeight + 40;

      drawText("Risk Radar", 13, true, 20);
      const risks = results.riskFactors.slice(0, 4);
      risks.forEach((risk) => {
        drawText(`• [${risk.level}] ${risk.name} – ${risk.description}`, 10, false, 16);
      });
      cursorY -= 16;
    }

    drawText("Analyst Notes", 13, true, 20);
    report.sections.slice(0, 3).forEach((section) => {
      drawText(section.title, 11, true, 18);
      const lines = section.content.split(/\n+/);
      lines.forEach((line) => drawText(line, 10, false, 14));
      cursorY -= 6;
    });

    drawText("Prepared by Aime Copilot • Institutional Draft", 9, false, 14);
    return pdf.save();
  }

  private async buildDocx(report: Report): Promise<Uint8Array> {
    const results = await fakeResearchService.getRunResults(report.runId);
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              text: "Aime Institutional Equity Research Copilot",
              heading: HeadingLevel.TITLE,
            }),
            new Paragraph({
              children: [
                new TextRun({ text: `Run ID: ${report.runId}`, italics: true }),
                new TextRun({ text: ` • Generated: ${new Date().toLocaleString()}`, italics: true }),
              ],
            }),
            new Paragraph({ text: "" }),
            ...(results
              ? [
                  new Paragraph({
                    text: results.summary.headline,
                    heading: HeadingLevel.HEADING_1,
                  }),
                  new Paragraph(results.summary.thesis),
                  new Paragraph({ text: "" }),
                  new Paragraph({
                    text: "Key Metrics",
                    heading: HeadingLevel.HEADING_2,
                  }),
                  this.buildMetricsTable(results),
                  new Paragraph({ text: "" }),
                  new Paragraph({
                    text: "Risk Factors",
                    heading: HeadingLevel.HEADING_2,
                  }),
                  ...results.riskFactors.slice(0, 4).map(
                    (risk) =>
                      new Paragraph({
                        text: `${risk.name} (${risk.level}) – ${risk.description}`,
                        bullet: { level: 0 },
                      }),
                  ),
                  new Paragraph({ text: "" }),
                ]
              : []),
            new Paragraph({
              text: "Analyst Sections",
              heading: HeadingLevel.HEADING_2,
            }),
            ...report.sections.map(
              (section) =>
                new Paragraph({
                  children: [
                    new TextRun({
                      text: section.title,
                      bold: true,
                    }),
                    new TextRun({ text: "\n" + section.content }),
                  ],
                }),
            ),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return new Uint8Array(buffer);
  }

  private buildMetricsTable(results: NonNullable<Awaited<ReturnType<typeof fakeResearchService.getRunResults>>>) {
    const rows: TableRow[] = [
      new TableRow({
        children: [
          this.metricCell("Ticker"),
          this.metricCell(results.ticker.symbol, true),
          this.metricCell("Price"),
          this.metricCell(`${results.ticker.currency}${formatNumber(results.ticker.currentPrice, { decimals: 2 })}`, true),
        ],
      }),
      new TableRow({
        children: [
          this.metricCell("1M Return"),
          this.metricCell(`${(results.kpis.ret_1m * 100).toFixed(1)}%`, true),
          this.metricCell("5Y CAGR"),
          this.metricCell(`${(results.kpis.cagr_5y * 100).toFixed(1)}%`, true),
        ],
      }),
      new TableRow({
        children: [
          this.metricCell("Forward PE"),
          this.metricCell(results.valuation.fwd_pe.toFixed(1) + "x", true),
          this.metricCell("EV/EBITDA"),
          this.metricCell(results.valuation.ev_ebitda.toFixed(1) + "x", true),
        ],
      }),
    ];

    return new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows,
    });
  }

  private metricCell(text: string, bold = false) {
    return new TableCell({
      children: [
        new Paragraph({
          children: [
            new TextRun({
              text,
              bold,
            }),
          ],
        }),
      ],
    });
  }
}

export const fakeReportService = new FakeReportService();
