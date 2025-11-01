import type {
  Stage,
  ResearchRun,
  RunStatus,
  ResearchResults,
  LogEvent,
  SubAgentTask,
  SubAgentStatus,
  RunHistoryEntry,
  IntuitionCycle,
  ThoughtNode,
  ThoughtPath,
} from "@/lib/types";
import {
  getDeterministicValue,
  generateTimeSeriesData,
  seedRandom,
  formatNumber,
} from "@/lib/utils";
import { aiResearchService } from "./ai-research-service";
import { stockPriceService } from "./stock-price-service";

interface SubAgentDefinition {
  id: string;
  name: string;
  queries: string[];
  whatsMissing: string[];
  nextActions: string[];
  sources: Array<{ domain: string; title: string }>;
  coverageRange: [number, number];
  confidenceRange: [number, number];
  latencyRange: [number, number];
}

interface TickerInfo {
  name: string;
  price: number;
  sector: string;
  currency: "₹" | "$";
  beta: number;
  marketCap: number; // in base currency
}

const STAGE_DEFINITIONS: Stage[] = [
  { id: "decompose", name: "Decompose Question", agents: [] },
  {
    id: "retrieve",
    name: "Retrieve Data",
    agents: [
      "liquidity",
      "sentiment",
      "fundamentals",
      "macro",
      "policy",
      "additional",
    ],
  },
  { id: "analyze", name: "Analyze", agents: [] },
  { id: "synthesize", name: "Synthesize", agents: [] },
  { id: "draft", name: "Draft Report", agents: [] },
];

const STAGE_LOOKUP = new Map(STAGE_DEFINITIONS.map((stage) => [stage.id, stage]));

const STAGE_START_NOTES: Record<string, string> = {
  decompose: "Normalising query, identifying tickers, scoping investigative pillars.",
  retrieve: "Dispatching specialised agents across liquidity, sentiment, macro, and policy feeds.",
  analyze: "Triangulating signals, stress-testing drivers, reconciling quantitative overlays.",
  synthesize: "Cross-validating narratives, aligning factor stacks with historical playbooks.",
  draft: "Composing institutional output with audit trail, citations, and reproducibility metadata.",
};

const STAGE_COMPLETE_NOTES: Record<string, string> = {
  decompose: "Question decomposed into six workstreams with success criteria and guardrails.",
  retrieve: "Evidence packs ingested and scored across all agents.",
  analyze: "Signal stack ranked; deltas quantified against long-term baselines.",
  synthesize: "Narrative stitched with upside/downside cases and probabilistic weightings.",
  draft: "Draft ready with charts, tables, disclosures, and rerun metadata.",
};

const SUB_AGENT_DEFINITIONS: SubAgentDefinition[] = [
  {
    id: "liquidity",
    name: "Liquidity",
    queries: [
      "FII net flows last 30D/3M/6M as % of market cap",
      "DII net flows same periods",
      "MTF change 30D and leverage build-up",
      "Auto index breadth & volume rank vs 12M history",
    ],
    whatsMissing: [
      "End-of-day broker level flow splits",
      "Intraday block deal tracker for last 5 sessions",
    ],
    nextActions: [
      "Ping prime broker for mid-week FII seat-turns",
      "Watch NSE bulk block tape for >₹50 crore prints",
    ],
    sources: [
      { domain: "nseindia.com", title: "Daily FII/DII Activity" },
      { domain: "moneycontrol.com", title: "MTF Utilisation Snapshot" },
      { domain: "bloomberg.com", title: "Auto Index Breadth Monitor" },
    ],
    coverageRange: [0.72, 0.95],
    confidenceRange: [0.64, 0.88],
    latencyRange: [780, 1680],
  },
  {
    id: "sentiment",
    name: "Sentiment",
    queries: [
      "Consumer confidence trend vs 3Y mean",
      "Monsoon deviation vs auto demand sensitivity",
      "UPI discretionary ticket growth MoM",
      "Social buzz & dealer surveys (qualitative)",
    ],
    whatsMissing: [
      "Dealer level colour for premium SUV bookings",
      "Regional festive demand anecdotes (Tier 2/3)",
    ],
    nextActions: [
      "Scrape latest Vahan data refresh for EV share",
      "Overlay Google mobility for metros vs Tier 2",
    ],
    sources: [
      { domain: "rbi.org.in", title: "Consumer Confidence Survey" },
      { domain: "upidata.gov.in", title: "UPI Trend Dashboard" },
      { domain: "cmie.com", title: "Household Sentiment Tracker" },
    ],
    coverageRange: [0.65, 0.9],
    confidenceRange: [0.58, 0.82],
    latencyRange: [720, 1620],
  },
  {
    id: "fundamentals",
    name: "Fundamentals",
    queries: [
      "EPS & target revisions last 30D",
      "Revenue/EBITDA margin trend QoQ/YoY",
      "Debt/EBITDA profile & maturity buckets",
      "Dealer discounting vs historical bands",
    ],
    whatsMissing: [
      "Latest management commentary from roadshows",
      "Unit economics for EV vs ICE mix",
    ],
    nextActions: [
      "Pull sell-side revision monitor for last 48h",
      "Stress-test FY26 EBITDA vs FX sensitivity",
    ],
    sources: [
      { domain: "reuters.com", title: "Consensus Revision Tracker" },
      { domain: "cmie.com", title: "Quarterly Financials Extract" },
      { domain: "company filings", title: "Debt Maturity Schedule" },
    ],
    coverageRange: [0.78, 0.96],
    confidenceRange: [0.68, 0.88],
    latencyRange: [840, 1740],
  },
  {
    id: "macro",
    name: "Macro/Global",
    queries: [
      "USD/INR 30D move & margin bps sensitivity",
      "Brent 30D move vs CV/JLR exposure",
      "Global auto PMI vs shipments correlation",
      "GBP trend impact on JLR cash flows",
    ],
    whatsMissing: [
      "High-frequency diesel price trajectory",
      "Component import exposure by currency mix",
    ],
    nextActions: [
      "Back-test INR sensitivity vs EBIT delta",
      "Refresh GBP risk reversals for implied skew",
    ],
    sources: [
      { domain: "rbi.org.in", title: "FX Reference Data" },
      { domain: "opec.org", title: "Crude Price Monitor" },
      { domain: "ihsmarkit.com", title: "Global Auto PMI" },
    ],
    coverageRange: [0.6, 0.92],
    confidenceRange: [0.52, 0.8],
    latencyRange: [860, 1820],
  },
  {
    id: "policy",
    name: "Domestic Policy",
    queries: [
      "RBI calendar & probability of 25-50 bps moves",
      "CPI headline & core vs tolerance band",
      "Auto scrappage incentives & GST tweaks",
      "EV subsidy cadence & state-level adoption",
    ],
    whatsMissing: [
      "Upcoming GST council agenda leaks",
      "State-level registration fee changes (draft)",
    ],
    nextActions: [
      "Track parliamentary questions for auto incentives",
      "Flag next MPC minutes for forward guidance tone",
    ],
    sources: [
      { domain: "mfin.gov.in", title: "Policy Release Calendar" },
      { domain: "prsindia.org", title: "Legislative Tracker" },
      { domain: "rbi.org.in", title: "MPC Minutes" },
    ],
    coverageRange: [0.68, 0.9],
    confidenceRange: [0.6, 0.85],
    latencyRange: [640, 1380],
  },
  {
    id: "additional",
    name: "Additional Indicators",
    queries: [
      "Monthly wholesale vs retail sales run-rate",
      "PMI / GPR overlays vs demand surprises",
      "Derivatives IV percentile, PCR, OI concentration",
      "Implied move bands (68% / 95%) from options surface",
    ],
    whatsMissing: [
      "Dealer-level colour on cancellations",
      "High-frequency EV searches (Google Trend API)",
    ],
    nextActions: [
      "Monitor IV crush post expiry for rerun",
      "Refresh PMI 10D tracker with latest print",
    ],
    sources: [
      { domain: "dsi.in", title: "Auto Sales Flash" },
      { domain: "markiteconomics.com", title: "India PMI Releases" },
      { domain: "nseindia.com", title: "Options OI Heatmap" },
    ],
    coverageRange: [0.62, 0.88],
    confidenceRange: [0.55, 0.82],
    latencyRange: [720, 1640],
  },
];

const TICKER_DATA: Record<string, TickerInfo> = {
  "TATAMOTORS.NS": {
    name: "Tata Motors Ltd",
    price: 405,
    sector: "Automobile",
    currency: "₹",
    beta: 1.12,
    marketCap: 1780000000000,
  },
  "HDFCBANK.NS": {
    name: "HDFC Bank Ltd",
    price: 1650.3,
    sector: "Banking",
    currency: "₹",
    beta: 0.82,
    marketCap: 11600000000000,
  },
  NVDA: {
    name: "NVIDIA Corporation",
    price: 495.22,
    sector: "Technology",
    currency: "$",
    beta: 1.48,
    marketCap: 1230000000000,
  },
};

const SOFT_ERROR_RATE = 0.018;

class FakeResearchService {
  private runs: Map<string, ResearchRun> = new Map();
  private runStatuses: Map<string, RunStatus> = new Map();
  private runResults: Map<string, ResearchResults> = new Map();
  private runLogs: Map<string, LogEvent[]> = new Map();
  private runHistory: RunHistoryEntry[] = [];
  private softErrorAgents: Map<string, string | null> = new Map();
  private runStartTimes: Map<string, number> = new Map();
  private seeded = false;

  constructor() {
    if (typeof window === "undefined") {
      this.ensureSeeded();
    }
  }

  private generateDeterministicRunId(query: string, ticker: string, deep: boolean): string {
    // Create a deterministic hash from query, ticker, and deep flag
    const seed = `${query}|${ticker}|${deep}`.trim().toLowerCase();
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash | 0; // Convert to 32-bit signed integer
    }
    // Convert to positive number and format as RUN-XXXXX
    const runNumber = Math.abs(hash) % 99999;
    return `RUN-${runNumber.toString().padStart(5, "0")}`;
  }

  private findExistingRun(query: string, ticker: string, deep: boolean): ResearchRun | null {
    const normalizedTicker = ticker || this.inferTickerFromQuery(query) || "TATAMOTORS.NS";
    // First try to find by deterministic ID
    const deterministicId = this.generateDeterministicRunId(query, normalizedTicker, deep);
    const existingRun = this.runs.get(deterministicId);
    if (existingRun && 
        existingRun.query.toLowerCase().trim() === query.toLowerCase().trim() &&
        existingRun.ticker === normalizedTicker &&
        existingRun.deep === deep) {
      return existingRun;
    }
    // Fallback: search all runs for matching query/ticker/deep
    for (const [_, run] of this.runs.entries()) {
      if (run.query.toLowerCase().trim() === query.toLowerCase().trim() &&
          run.ticker === normalizedTicker &&
          run.deep === deep) {
        return run;
      }
    }
    return null;
  }

  async createRun(query: string, ticker?: string, deep: boolean = false): Promise<ResearchRun> {
    this.ensureSeeded();
    const normalizedTicker = ticker || this.inferTickerFromQuery(query) || "TATAMOTORS.NS";
    
    // Check if a run already exists for this query/ticker/deep combination
    const existingRun = this.findExistingRun(query, normalizedTicker, deep);
    if (existingRun) {
      return existingRun;
    }
    
    // Generate deterministic ID based on query, ticker, and deep flag
    const runId = this.generateDeterministicRunId(query, normalizedTicker, deep);
    const createdAt = new Date().toISOString();

    const run: ResearchRun = {
      runId,
      query,
      ticker: normalizedTicker,
      deep,
      createdAt,
      stages: STAGE_DEFINITIONS,
      etaMs: deep ? 62000 : 34000,
    };

    this.runs.set(runId, run);
    this.initializeRunStatus(runId);
    this.generateLogs(runId, query, normalizedTicker, createdAt);
    this.prepareSoftError(runId);

    this.runHistory.unshift({
      runId,
      query,
      ticker: normalizedTicker,
      createdAt,
      deep,
      status: "queued",
      progress: 0,
      confidence: undefined,
      durationMs: undefined,
      exported: false,
      warningCount: 0,
    });
    this.runHistory = this.runHistory.slice(0, 24);

    this.runStartTimes.set(runId, Date.now());
    setTimeout(() => {
      this.processRun(runId, query, normalizedTicker, deep).catch((error) => {
        console.error("FakeResearchService processRun error", error);
      });
    }, 300);

    return run;
  }

  private ensureSeeded() {
    if (this.seeded) return;
    this.seedInitialRuns();
    this.seeded = true;
  }

  private seedInitialRuns() {
    const seeds: Array<{ runId: string; query: string; ticker: string; deep: boolean; createdAtOffsetMins: number }> = [
      {
        runId: "RUN-01043",
        query: "Does Tata Motors go up or down in one-month horizon?",
        ticker: "TATAMOTORS.NS",
        deep: true,
        createdAtOffsetMins: 65,
      },
      {
        runId: "RUN-01012",
        query: "How has HDFC Bank performed in the last 5 years?",
        ticker: "HDFCBANK.NS",
        deep: false,
        createdAtOffsetMins: 185,
      },
    ];

    seeds.forEach((seed) => {
      const createdAt = new Date(Date.now() - seed.createdAtOffsetMins * 60 * 1000).toISOString();
      const run: ResearchRun = {
        runId: seed.runId,
        query: seed.query,
        ticker: seed.ticker,
        deep: seed.deep,
        createdAt,
        stages: STAGE_DEFINITIONS,
        etaMs: seed.deep ? 62000 : 34000,
      };

      this.runs.set(seed.runId, run);
      const status = this.initializeRunStatus(seed.runId);
      status.overall = "ready";
      status.progress = 1;

      status.stages.forEach((stage, idx) => {
        stage.status = "done";
        stage.coverage = 1;
        stage.confidence = getDeterministicValue(`${seed.runId}-stage-${stage.id}-conf`, 0.74, 0.9);
        stage.latencyMs = Math.floor(getDeterministicValue(`${seed.runId}-stage-${stage.id}-lat`, 420, 1400));
        if (stage.id === "retrieve" && stage.agents) {
          stage.agents = stage.agents.map((agent, agentIdx) => {
            const def = SUB_AGENT_DEFINITIONS[agentIdx];
            const coverage = getDeterministicValue(`${seed.runId}-${agent.id}-cov`, def.coverageRange[0], def.coverageRange[1]);
            const confidence = getDeterministicValue(`${seed.runId}-${agent.id}-conf`, def.confidenceRange[0], def.confidenceRange[1]);
            const latency = Math.floor(getDeterministicValue(`${seed.runId}-${agent.id}-lat`, def.latencyRange[0], def.latencyRange[1]));
            return {
              ...agent,
              status: "scored",
              coverage,
              confidence,
              latencyMs: latency,
              lastUpdated: createdAt,
              badges: [
                { label: "Coverage", value: `${Math.round(coverage * 100)}%`, tone: coverage > 0.8 ? "positive" : "neutral" },
                { label: "Signal", value: confidence > 0.75 ? "Constructive" : "In-line" },
                { label: "Latency", value: `${latency} ms`, tone: latency > 1100 ? "negative" : "neutral" },
              ],
            };
          });
        }
      });

      this.runStatuses.set(seed.runId, status);
      this.generateResults(seed.runId, seed.query, seed.ticker, false);
      this.generateLogs(seed.runId, seed.query, seed.ticker, createdAt, true);
      const completedResults = this.runResults.get(seed.runId);
      this.runHistory.unshift({
        runId: seed.runId,
        query: seed.query,
        ticker: seed.ticker,
        createdAt,
        deep: seed.deep,
        status: "ready",
        progress: 1,
        confidence: completedResults?.summary.confidence,
        durationMs: 26800,
        exported: seed.runId === "RUN-01012",
        warningCount: 0,
      });
      this.softErrorAgents.set(seed.runId, null);
    });

    this.runHistory = this.runHistory.slice(0, 24);
  }

  private initializeRunStatus(runId: string): RunStatus {
    const nowIso = new Date().toISOString();
    const stages = STAGE_DEFINITIONS.map<SubAgentStatus[] | undefined>((stage) => {
      if (stage.id !== "retrieve") return undefined;
      return SUB_AGENT_DEFINITIONS.map((def) => ({
        id: def.id,
        name: def.name,
        status: "queued",
        coverage: 0,
        confidence: 0,
        latencyMs: 0,
        lastUpdated: nowIso,
        badges: [
          { label: "Coverage", value: "0%", tone: "neutral" },
          { label: "Signal", value: "Pending", tone: "neutral" },
          { label: "Latency", value: "—", tone: "neutral" },
        ],
      }));
    });

    const runStatus: RunStatus = {
      runId,
      overall: "queued",
      progress: 0,
      stages: STAGE_DEFINITIONS.map((stage, idx) => ({
        id: stage.id,
        status: "queued",
        coverage: 0,
        confidence: 0,
        latencyMs: 0,
        agents: stages[idx],
      })),
      progressiveQna: [],
    };

    this.runStatuses.set(runId, runStatus);
    return runStatus;
  }

  private prepareSoftError(runId: string) {
    const rng = seedRandom(`${runId}-soft-error`);
    const roll = rng();
    if (roll < SOFT_ERROR_RATE) {
      const pick = Math.floor(rng() * SUB_AGENT_DEFINITIONS.length) % SUB_AGENT_DEFINITIONS.length;
      this.softErrorAgents.set(runId, SUB_AGENT_DEFINITIONS[pick].id);
    } else {
      this.softErrorAgents.set(runId, null);
    }
  }

  private async processRun(runId: string, query: string, ticker: string, deep: boolean, opts?: { skipError?: boolean }) {
    const status = this.runStatuses.get(runId);
    const run = this.runs.get(runId);
    if (!status || !run) return;

    status.overall = "running";
    this.updateHistory(runId, { status: "running" });
    const softErrorTarget = opts?.skipError ? null : this.softErrorAgents.get(runId) ?? null;

    // Decompose
    await this.completeStage(runId, "decompose", 0.16, [900, 1600], [0.86, 0.96]);

    // Retrieve with agents
    const retrieveStage = status.stages.find((s) => s.id === "retrieve");
    if (!retrieveStage) return;
    retrieveStage.status = "running";
    retrieveStage.latencyMs = 0;
    retrieveStage.coverage = 0;
    retrieveStage.confidence = 0;
    this.appendLog(runId, {
      time: new Date().toISOString(),
      agent: STAGE_LOOKUP.get("retrieve")?.name ?? "Retrieve",
      message: "Coordinating six specialised agents across market, macro, and policy data feeds.",
      status: "fetching",
    });

    const agents = retrieveStage.agents ?? [];
    for (let idx = 0; idx < agents.length; idx++) {
      const agentStatus = agents[idx];
      const def = SUB_AGENT_DEFINITIONS[idx];
      const agentSeed = `${runId}-${def.id}`;
      agentStatus.status = "fetching";
      agentStatus.lastUpdated = new Date().toISOString();
      this.appendLog(runId, {
        time: agentStatus.lastUpdated,
        agent: def.name,
        message: `Running ${def.queries.length} scoped queries`,
        status: "fetching",
      });

      const latency = Math.floor(getDeterministicValue(`${agentSeed}-lat`, def.latencyRange[0], def.latencyRange[1]));
      await this.delay(latency);
      retrieveStage.latencyMs += latency;
      agentStatus.latencyMs = latency;

      if (softErrorTarget === agentStatus.id) {
        agentStatus.status = "error";
        agentStatus.issues = [
          "Primary data vendor timeout after 18s.",
          "Fallback source queued; waiting for retry.",
        ];
        agentStatus.badges = [
          { label: "Coverage", value: `${Math.round(agentStatus.coverage * 100)}%`, tone: "negative" },
          { label: "Signal", value: "Blocked", tone: "negative" },
          { label: "Latency", value: `${latency} ms`, tone: "negative" },
        ];
        retrieveStage.status = "error";
        status.overall = "error";
        this.appendLog(runId, {
          time: new Date().toISOString(),
          agent: def.name,
          message: "Soft error: vendor timeout. Manual retry available.",
          status: "error",
        });
        this.updateHistory(runId, {
          status: "error",
          progress: status.progress,
          warningCount: 1,
        });
        return;
      }

      agentStatus.coverage = getDeterministicValue(`${agentSeed}-cov`, def.coverageRange[0], def.coverageRange[1]);
      agentStatus.confidence = getDeterministicValue(`${agentSeed}-conf`, def.confidenceRange[0], def.confidenceRange[1]);
      agentStatus.status = "scored";
      agentStatus.badges = [
        { label: "Coverage", value: `${Math.round(agentStatus.coverage * 100)}%`, tone: agentStatus.coverage > 0.82 ? "positive" : "neutral" },
        { label: "Signal", value: agentStatus.confidence > 0.75 ? "Constructive" : "Balanced" },
        { label: "Latency", value: `${latency} ms`, tone: latency > 1100 ? "negative" : "neutral" },
      ];
      retrieveStage.coverage = (idx + 1) / agents.length;
      retrieveStage.confidence =
        idx === 0
          ? agentStatus.confidence
          : (retrieveStage.confidence * idx + agentStatus.confidence) / (idx + 1);
      status.progress = 0.18 + retrieveStage.coverage * 0.46;
      this.updateHistory(runId, { progress: status.progress });
      this.appendLog(runId, {
        time: new Date().toISOString(),
        agent: def.name,
        message: `Parsed responses • Coverage ${Math.round(agentStatus.coverage * 100)}% • Confidence ${Math.round(
          agentStatus.confidence * 100,
        )}%`,
        status: "scored",
      });
    }

    retrieveStage.status = "done";
    this.appendLog(runId, {
      time: new Date().toISOString(),
      agent: STAGE_LOOKUP.get("retrieve")?.name ?? "Retrieve",
      message: "All evidence packets evaluated and scored.",
      status: "scored",
    });

    // Analyze, Synthesize, Draft + Stream Q&A
    const tickerInfo = TICKER_DATA[ticker] || TICKER_DATA["TATAMOTORS.NS"];

    // Start Q&A streaming in parallel with analysis
    const qnaStreamPromise = this.streamProgressiveQna(runId, ticker, tickerInfo.name);

    await this.completeStage(runId, "analyze", 0.82, [1400, 2200], [0.72, 0.88]);
    status.overall = "synthesizing";
    await this.completeStage(runId, "synthesize", 0.92, [900, 1600], [0.74, 0.9]);
    await this.completeStage(runId, "draft", 1, [820, 1500], [0.78, 0.92]);

    // Ensure Q&A streaming completes before marking as ready
    await qnaStreamPromise;

    status.overall = "ready";
    status.progress = 1;
    await this.generateResults(runId, query, ticker);
    const results = this.runResults.get(runId);
    this.updateHistory(runId, {
      status: "ready",
      progress: 1,
      confidence: results?.summary.confidence,
      durationMs: this.getRunDuration(runId),
      warningCount: 0,
    });
    this.appendLog(runId, {
      time: new Date().toISOString(),
      agent: "Draft",
      message: "Institutional-grade dossier prepared with citations and metadata.",
      status: "scored",
    });
  }

  private async completeStage(
    runId: string,
    stageId: string,
    progress: number,
    latencyRange: [number, number],
    confidenceRange: [number, number],
  ) {
    const status = this.runStatuses.get(runId);
    if (!status) return;
    const stage = status.stages.find((s) => s.id === stageId);
    if (!stage) return;
    stage.status = "running";
    const stageName = STAGE_LOOKUP.get(stageId)?.name ?? stageId;
    const startMessage = STAGE_START_NOTES[stageId] || "Stage initiated.";
    this.appendLog(runId, {
      time: new Date().toISOString(),
      agent: stageName,
      message: startMessage,
      status: "fetching",
    });
    const latency = Math.floor(getDeterministicValue(`${runId}-${stage.id}-lat`, latencyRange[0], latencyRange[1]));
    await this.delay(latency);
    stage.latencyMs = latency;
    stage.coverage = 1;
    stage.confidence = getDeterministicValue(`${runId}-${stage.id}-conf`, confidenceRange[0], confidenceRange[1]);
    stage.status = "done";
    status.progress = Math.max(status.progress, progress);
    this.appendLog(runId, {
      time: new Date().toISOString(),
      agent: stageName,
      message: STAGE_COMPLETE_NOTES[stageId] || "Stage completed.",
      status: "scored",
    });
    this.updateHistory(runId, { progress: status.progress });
  }

  private getRunDuration(runId: string): number | undefined {
    const start = this.runStartTimes.get(runId);
    if (!start) return undefined;
    const duration = Date.now() - start;
    this.runStartTimes.delete(runId);
    return duration;
  }

  private async generateResults(runId: string, query: string, ticker: string, useAI: boolean = true) {
    const seed = `${ticker}-${query}`.trim().toUpperCase();
    const tickerInfo = TICKER_DATA[ticker] || TICKER_DATA["TATAMOTORS.NS"];

    // Temporarily disabled real-time stock fetching due to API limitations
    // Using fallback data for now
    const realPrice = tickerInfo.price;
    const currency = tickerInfo.currency;
    const companyName = tickerInfo.name;

    // Generate synthetic data based on base price
    const priceSeries = generateTimeSeriesData(`${seed}-price`, 1260, realPrice, 0.024);

    const drawdownSeries = priceSeries.map((point, idx) => {
      if (idx === 0) return { t: point.t, dd: 0 };
      const peak = Math.max(...priceSeries.slice(0, idx + 1).map((p) => p.c));
      return { t: point.t, dd: (point.c - peak) / peak };
    });

    const summaryConfidence = getDeterministicValue(`${seed}-conf`, 0.6, 0.82);
    const convictionScore = Math.round(summaryConfidence * 100);
    const conviction =
      convictionScore >= 75 ? "High" : convictionScore >= 55 ? "Medium" : "Low";

    // Try to get AI-generated research
    let aiThesis = this.generateThesis(ticker, query);
    let aiHeadline = this.generateHeadline(ticker);

    if (useAI && process.env.ENABLE_AI_RESEARCH === "true") {
      try {
        const aiResponse = await aiResearchService.generateResearch({
          query,
          ticker,
          deep: false,
        });
        aiThesis = aiResponse.thesis;
        aiHeadline = aiResponse.headline;
      } catch (error) {
        console.error("Failed to generate AI research, using fallback:", error);
      }
    }

    // Calculate real returns from price series data with realistic bounds
    const calculateReturn = (daysAgo: number, minReturn?: number, maxReturn?: number): number => {
      if (priceSeries.length < daysAgo) {
        const defaultMin = minReturn ?? -0.5;
        const defaultMax = maxReturn ?? 1.0;
        return getDeterministicValue(`${seed}-chg-${daysAgo}`, defaultMin, defaultMax);
      }
      const currentPrice = priceSeries[priceSeries.length - 1].c;
      const pastPrice = priceSeries[priceSeries.length - daysAgo]?.c || currentPrice;
      let returnValue = (currentPrice - pastPrice) / pastPrice;
      
      // Clamp to realistic ranges based on time period
      if (minReturn !== undefined || maxReturn !== undefined) {
        const min = minReturn ?? -0.99; // Cap at -99% to prevent -100%
        const max = maxReturn ?? 10.0; // Allow up to 1000% for very long periods
        returnValue = Math.max(min, Math.min(max, returnValue));
      } else {
        // Default bounds to prevent extreme values
        returnValue = Math.max(-0.99, Math.min(10.0, returnValue));
      }
      
      return returnValue;
    };

    const results: ResearchResults = {
      summary: {
        thesis: aiThesis,
        confidence: summaryConfidence,
        conviction,
        convictionScore,
        headline: aiHeadline,
      },
      ticker: {
        symbol: ticker,
        name: companyName,
        currentPrice: realPrice,
        currency: currency,
        changes: {
          "1D": calculateReturn(1, -0.1, 0.1),
          "1W": calculateReturn(5, -0.15, 0.15),
          "1M": calculateReturn(21, -0.3, 0.3),
          "1Y": calculateReturn(252, -0.6, 1.0),
          "5Y": (() => {
            // For 5Y, use deterministic value to ensure realistic returns
            // Realistic 5Y returns: -50% to +200% (some stocks can have extreme moves)
            const fiveYearReturn = getDeterministicValue(`${seed}-chg-5y`, -0.5, 2.0);
            // If price series has enough data, validate against it but clamp to realistic range
            if (priceSeries.length >= 1260) {
              const calculated = calculateReturn(1260, -0.5, 2.0);
              // Use calculated value only if it's in reasonable range, otherwise use deterministic
              return (calculated >= -0.5 && calculated <= 2.0) ? calculated : fiveYearReturn;
            }
            return fiveYearReturn;
          })(),
        },
      },
      kpis: {
        priceTarget: (() => {
          // Calculate upside target based on conviction score and fundamentals
          // High conviction (75-100): 15-25% upside
          // Medium conviction (55-74): 8-15% upside
          // Low conviction (0-54): 3-10% upside
          const baseUpside = conviction === "High"
            ? getDeterministicValue(`${seed}-upside`, 0.15, 0.25)
            : conviction === "Medium"
            ? getDeterministicValue(`${seed}-upside`, 0.08, 0.15)
            : getDeterministicValue(`${seed}-upside`, 0.03, 0.10);

          return realPrice * (1 + baseUpside);
        })(),
        ret_1m: calculateReturn(21, -0.3, 0.3),
        ret_3m: calculateReturn(63, -0.4, 0.5),
        ret_6m: calculateReturn(126, -0.5, 0.7),
        ret_1y: calculateReturn(252, -0.6, 1.0),
        ret_3y: (() => {
          const threeYearReturn = getDeterministicValue(`${seed}-ret-3y`, -0.4, 1.5);
          if (priceSeries.length >= 756) {
            const calculated = calculateReturn(756, -0.4, 1.5);
            return (calculated >= -0.4 && calculated <= 1.5) ? calculated : threeYearReturn;
          }
          return threeYearReturn;
        })(),
        cagr_5y: getDeterministicValue(`${seed}-cagr-5y`, 0.08, 0.19),
        max_dd_5y: Math.min(
          ...drawdownSeries.map(d => d.dd),
          getDeterministicValue(`${seed}-max-dd`, -0.36, -0.18),
        ),
        sharpe_5y: getDeterministicValue(`${seed}-sharpe`, 0.55, 1.35),
        beta_1y: getDeterministicValue(`${seed}-beta`, tickerInfo.beta * 0.88, tickerInfo.beta * 1.12),
      },
      drivers: [
        { bucket: "Liquidity", score: getDeterministicValue(`${seed}-driver-liq`, -0.1, 0.3) },
        { bucket: "Sentiment", score: getDeterministicValue(`${seed}-driver-sent`, -0.05, 0.24) },
        { bucket: "Fundamentals", score: getDeterministicValue(`${seed}-driver-fund`, -0.12, 0.28) },
        { bucket: "Macro/Global", score: getDeterministicValue(`${seed}-driver-macro`, -0.18, 0.12) },
        { bucket: "Domestic Policy", score: getDeterministicValue(`${seed}-driver-policy`, -0.08, 0.18) },
        { bucket: "Additional", score: getDeterministicValue(`${seed}-driver-add`, -0.1, 0.16) },
      ],
      charts: {
        price: priceSeries,
        rolling_cagr: Array.from({ length: 60 }, (_, i) =>
          getDeterministicValue(`${seed}-rolling-${i}`, 0.05, 0.21),
        ),
        drawdown: drawdownSeries.map((d) => d.dd),
        distribution: this.generateReturnDistribution(seed),
        volatilityScatter: this.generateVolatilityScatter(seed, ticker),
        valuationBands: this.generateValuationBands(seed, ticker),
        events: this.generateEventMarkers(seed, ticker),
      },
      peers: this.generatePeers(ticker),
      valuation: {
        fwd_pe: getDeterministicValue(`${seed}-pe`, 11.5, 24),
        ev_ebitda: getDeterministicValue(`${seed}-ev`, 5.8, 12.8),
        percentile: {
          pe: getDeterministicValue(`${seed}-pe-pct`, 0.38, 0.78),
          ev: getDeterministicValue(`${seed}-ev-pct`, 0.35, 0.74),
        },
      },
      riskFactors: this.generateRiskFactors(ticker),
      citations: this.generateCitations(seed, ticker),
      modelQna: this.generateModelQna(seed, ticker, companyName),
    };

    this.runResults.set(runId, results);
  }

  private generateThesis(ticker: string, query: string): string {
    const mapping: Record<string, string> = {
      "TATAMOTORS.NS":
        "Near-term pressure on 1M horizon with mild negative tilt (-0.7% expected return). DIIs cushioning FII outflows provides support, but current price above target (₹668 vs ₹785) suggests downside. JLR pricing discipline and richer domestic mix absorb FX volatility. FY25 EBITDA sensitivity well-hedged; leverage trending to 1.1x. Medium conviction with 55% confidence.",
      "HDFCBANK.NS":
        "5Y view constructive: deposit repricing near trough, fee engines stable, and cost-to-income benign. Valuation modestly above long-term mean, but risk-adjusted RoE profile attractive within large-cap financials.",
      NVDA:
        "Still leadership in accelerated compute with hyperscaler capex locked through FY26. Near-term digestion risk acknowledged, yet backlog, software attach, and gross margin mix keep upside skewed.",
    };
    return (
      mapping[ticker] ||
      `Baseline constructive with nuanced risks identified for ${ticker}. Focus remains on balancing ${query.toLowerCase()} against macro and positioning signals.`
    );
  }

  private generateHeadline(ticker: string): string {
    const map: Record<string, string> = {
      "TATAMOTORS.NS": "Near-term downside pressure; DIIs cushion FII outflows but price above target.",
      "HDFCBANK.NS": "Deposit mix stabilises; credit cost discipline intact.",
      NVDA: "AI infra demand resilient; valuation still premium relative to history.",
    };
    return map[ticker] || "Balanced outlook with identifiable upside/downside catalysts.";
  }

  private generatePeers(ticker: string) {
    const peers: Record<string, any[]> = {
      "TATAMOTORS.NS": [
        { ticker: "TATAMOTORS.NS", name: "Tata Motors", pe: 15.2, pb: 2.1, roe: 14.5, nim: 9.2 },
        { ticker: "MARUTI.NS", name: "Maruti Suzuki", pe: 22.8, pb: 3.5, roe: 16.2, nim: 11.1 },
        { ticker: "M&M.NS", name: "Mahindra & Mahindra", pe: 18.5, pb: 2.8, roe: 15.8, nim: 10.3 },
        { ticker: "EICHERMOT.NS", name: "Eicher Motors", pe: 28.2, pb: 4.2, roe: 18.5, nim: 12.4 },
      ],
      "HDFCBANK.NS": [
        { ticker: "HDFCBANK.NS", name: "HDFC Bank", pe: 18.5, pb: 2.1, roe: 16.5, nim: 4.2, npa: 1.2, llp: 0.3 },
        { ticker: "ICICIBANK.NS", name: "ICICI Bank", pe: 16.2, pb: 2.4, roe: 17.8, nim: 4.5, npa: 2.1, llp: 0.6 },
        { ticker: "SBIN.NS", name: "State Bank of India", pe: 10.5, pb: 1.1, roe: 14.2, nim: 3.2, npa: 2.8, llp: 0.8 },
        { ticker: "AXISBANK.NS", name: "Axis Bank", pe: 12.8, pb: 1.5, roe: 12.5, nim: 3.8, npa: 1.8, llp: 0.5 },
      ],
      NVDA: [
        { ticker: "NVDA", name: "NVIDIA Corp", pe: 45.3, pb: 28.1, roe: 38.5 },
        { ticker: "AMD", name: "Advanced Micro Devices", pe: 34.2, pb: 21.6, roe: 21.8 },
        { ticker: "AVGO", name: "Broadcom", pe: 26.5, pb: 14.3, roe: 31.4 },
        { ticker: "TSM", name: "Taiwan Semi", pe: 22.4, pb: 6.1, roe: 27.2 },
      ],
    };
    return peers[ticker] || peers["TATAMOTORS.NS"];
  }

  private generateReturnDistribution(seed: string) {
    const buckets = [
      "-4.0%",
      "-3.0%",
      "-2.0%",
      "-1.0%",
      "-0.5%",
      "0%",
      "+0.5%",
      "+1.0%",
      "+2.0%",
      "+3.0%",
      "+4.0%",
    ];
    return buckets.map((bucket, idx) => ({
      bucket,
      frequency: Math.round(getDeterministicValue(`${seed}-dist-${idx}`, 2, 16)),
    }));
  }

  private generateVolatilityScatter(seed: string, ticker: string) {
    const basePeers = this.generatePeers(ticker);
    const universe = [
      {
        ticker,
        name: TICKER_DATA[ticker]?.name ?? ticker,
      },
      ...basePeers.filter((peer) => peer.ticker !== ticker),
    ];
    return universe.map((peer, idx) => ({
      ticker: peer.ticker,
      name: peer.name,
      oneMonthReturn: getDeterministicValue(`${seed}-scatter-ret-${idx}`, -0.08, 0.19),
      volatility: getDeterministicValue(`${seed}-scatter-vol-${idx}`, 0.12, 0.38),
      marketCap: getDeterministicValue(`${seed}-scatter-mcap-${idx}`, 1.2e11, 1.2e12),
    }));
  }

  private generateValuationBands(seed: string, ticker: string) {
    const months = 36;
    const baseSeries = generateTimeSeriesData(`${seed}-valuation`, months, 16, 0.08);
    return baseSeries.map((point, idx) => {
      const base = point.c;
      const low = base * getDeterministicValue(`${seed}-valuation-low-${idx}`, 0.82, 0.92);
      const high = base * getDeterministicValue(`${seed}-valuation-high-${idx}`, 1.06, 1.22);
      return {
        t: point.t,
        low,
        base,
        high,
      };
    });
  }

  private generateEventMarkers(seed: string, ticker: string) {
    const events = [
      { label: "Q4 Earnings", type: "earnings" as const },
      { label: "Policy Rate Hold", type: "policy" as const },
      { label: "FX Shock", type: "macro" as const },
      { label: "Product Launch", type: "product" as const },
      { label: "Dividend Announce", type: "earnings" as const },
      { label: "Budget Update", type: "policy" as const },
    ];
    return events.map((event, idx) => {
      const roll = getDeterministicValue(`${seed}-event-impact-${idx}`, 0, 1);
      const impact: "positive" | "negative" | "neutral" = roll > 0.6 ? "positive" : roll < 0.35 ? "negative" : "neutral";
      return {
        t: generateTimeSeriesData(`${seed}-event-${idx}`, 1, 0, 0)[0].t,
        label: event.label,
        type: event.type,
        impact,
      };
    });
  }

  private generateRiskFactors(ticker: string) {
    const riskMap: Record<
      string,
      Array<{ name: string; level: "Low" | "Medium" | "Elevated"; description: string }>
    > = {
      "TATAMOTORS.NS": [
        { name: "FX Sensitivity", level: "Medium", description: "GBP/INR depreciation shaves 35-45 bps off margin per 1% move." },
        { name: "Commodity Input", level: "Low", description: "Aluminium/steel hedges cover 70% of FY25 requirement." },
        { name: "Leverage", level: "Medium", description: "Net debt/EBITDA at 1.2x; refinance optionality intact." },
        { name: "Regulatory", level: "Elevated", description: "Stringent emissions norms could pull forward capex by ₹45-50 bn." },
      ],
      "HDFCBANK.NS": [
        { name: "Rates", level: "Low", description: "1% parallel shift impacts NIM by ~8 bps given balance sheet hedges." },
        { name: "Asset Quality", level: "Medium", description: "Retail unsecured book growing 22% YoY – monitoring early buckets." },
        { name: "Liquidity", level: "Low", description: "LCR at 120%; CASA stabilising with granular deposits." },
        { name: "Regulatory", level: "Medium", description: "Priority sector requirements could pressure near-term spreads." },
      ],
      NVDA: [
        { name: "Supply Chain", level: "Elevated", description: "HBM capacity remains tight; any delay extends lead time to 32-34 weeks." },
        { name: "Valuation", level: "Elevated", description: "Operate at 95th percentile of 5Y multiple range; sentiment-sensitive." },
        { name: "Competition", level: "Medium", description: "Accelerator share comfortable but hyperscaler ASIC plans remain a watch." },
        { name: "Macro", level: "Medium", description: "US-China export controls create scenario variance on FY26 revenue mix." },
      ],
    };
    return riskMap[ticker] || riskMap["TATAMOTORS.NS"];
  }

  private generateCitations(seed: string, ticker: string) {
    const base = [
      {
        domain: "moneycontrol.com",
        title: "Auto Sector Monthly Dashboard",
        dt: "2024-10-28",
        url: "#",
        excerpt: "Detailed wholesale vs retail mix; DIIs absorbed ₹1,250 crore in October roll.",
      },
      {
        domain: "economictimes.com",
        title: "RBI MPC Minutes – October",
        dt: "2024-10-08",
        url: "#",
        excerpt: "Policy bias unchanged; opening for calibrated liquidity infusions flagged.",
      },
      {
        domain: "nseindia.com",
        title: "Derivatives positioning report",
        dt: "2024-10-30",
        url: "#",
        excerpt: "OI walls at ₹850 strike; IV percentile at 62% with bullish skew.",
      },
      {
        domain: "rbi.org.in",
        title: "Consumer Confidence Survey",
        dt: "2024-09-30",
        url: "#",
        excerpt: "Discretionary intent index upticks 3 pts QoQ; auto intention resilient.",
      },
      {
        domain: "bloomberg.com",
        title: "Global Autos – FX & Commodity Watch",
        dt: "2024-10-18",
        url: "#",
        excerpt: "GBP weakness offsets Brent spike; net margin impact contained at 35 bps.",
      },
    ];
    return base.map((citation, idx) => ({
      ...citation,
      id: `${ticker}-${idx + 1}`,
    }));
  }

  private generateIntuitionCycle(seed: string, question: string): IntuitionCycle {
    // Generate realistic multi-path chain-of-thought reasoning
    const paths: ThoughtPath[] = [];
    const numPaths = getDeterministicValue(`${seed}-paths`, 2, 3) > 2.5 ? 3 : 2;

    for (let pathIdx = 0; pathIdx < numPaths; pathIdx++) {
      const pathSeed = `${seed}-path-${pathIdx}`;
      const nodes: ThoughtNode[] = [];

      // Generate thought nodes for this path
      const numNodes = Math.floor(getDeterministicValue(`${pathSeed}-nodes`, 4, 6));
      const nodeTypes: Array<ThoughtNode["type"]> = ["hypothesis", "analysis", "evidence", "conclusion"];

      for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        const nodeSeed = `${pathSeed}-node-${nodeIdx}`;
        const nodeType = nodeIdx === 0
          ? "hypothesis"
          : nodeIdx === numNodes - 1
            ? "conclusion"
            : nodeIdx % 3 === 0
              ? "evidence"
              : "analysis";

        // Generate realistic thought content based on type
        const contentMap = {
          hypothesis: [
            "Initial assumption: Price action driven by institutional flows",
            "Working theory: Fundamentals show divergence from peer group",
            "Starting hypothesis: Macro headwinds offsetting micro strength",
            "Primary thesis: Valuation compression reflects sentiment shift",
          ],
          analysis: [
            "Cross-referencing earnings trajectory with sector multiples",
            "Decomposing revenue growth into volume vs price components",
            "Mapping correlation between inventory cycles and margin pressure",
            "Analyzing relationship between FX movements and reported margins",
          ],
          evidence: [
            "Q4 data confirms 8% YoY revenue decline in core segment",
            "Bloomberg consensus shows 12 upgrades vs 3 downgrades in 30d",
            "Derivatives positioning indicates net long accumulation",
            "Channel checks reveal 15% inventory drawdown vs last quarter",
          ],
          conclusion: [
            "Evidence supports upside case with 65% confidence",
            "Analysis leans bearish given margin compression trajectory",
            "Balanced view: upside potential exists but risks remain elevated",
            "Strong conviction on positive outlook based on converging signals",
          ],
          contradiction: [
            "Counter-evidence: Management guidance conflicts with street estimates",
            "Conflicting signal: Technical breakdown despite strong fundamentals",
          ],
        };

        const content = contentMap[nodeType][Math.floor(getDeterministicValue(`${nodeSeed}-content`, 0, contentMap[nodeType].length))];

        nodes.push({
          id: `${pathSeed}-${nodeIdx}`,
          type: nodeType,
          content,
          confidence: getDeterministicValue(`${nodeSeed}-conf`, 0.55, 0.92),
          timestamp: Date.now() + nodeIdx * 100,
          dependencies: nodeIdx > 0 ? [`${pathSeed}-${nodeIdx - 1}`] : [],
          impact: getDeterministicValue(`${nodeSeed}-impact`, 0, 1) > 0.7
            ? "high"
            : getDeterministicValue(`${nodeSeed}-impact`, 0, 1) > 0.4
              ? "medium"
              : "low",
        });
      }

      // Determine path outcome
      const outcomeRoll = getDeterministicValue(`${pathSeed}-outcome`, 0, 1);
      const outcome: ThoughtPath["outcome"] =
        outcomeRoll > 0.6 ? "accepted" :
        outcomeRoll > 0.3 ? "merged" :
        "rejected";

      const pathNames = [
        "Bullish Scenario",
        "Base Case Analysis",
        "Bearish Scenario",
        "Risk-Adjusted View",
        "Contrarian Take",
      ];

      paths.push({
        id: `path-${pathIdx}`,
        name: pathNames[pathIdx % pathNames.length],
        nodes,
        outcome,
        confidenceScore: getDeterministicValue(`${pathSeed}-score`, 0.58, 0.88),
      });
    }

    // Generate synthesis
    const syntheses = [
      "After evaluating multiple reasoning paths, the evidence converges on a moderately bullish outlook. Key conviction drivers: institutional accumulation, valuation discount vs peers, and improving operational metrics. Primary risk remains macro uncertainty.",
      "Cross-path analysis reveals mixed signals. While fundamental strength is evident, technical indicators and sentiment metrics suggest caution. Balanced position recommended with tight risk management.",
      "Synthesis of competing hypotheses favors the upside case with medium-high conviction. Catalyst timeline supports 3-6 month horizon, though near-term volatility expected given elevated positioning.",
      "Weighing bullish and bearish scenarios against base case, the probability-weighted outcome tilts positive. Conviction strengthened by converging fundamental and flow-based signals.",
    ];

    return {
      cycles: [{
        id: `cycle-${seed}`,
        question,
        paths,
        synthesis: syntheses[Math.floor(getDeterministicValue(`${seed}-synth`, 0, syntheses.length))],
        timeline: Math.floor(getDeterministicValue(`${seed}-time`, 1200, 2800)),
      }],
    };
  }

  private generateModelQna(seed: string, ticker: string, companyName: string) {
    const qnaMap: Record<string, Array<{ question: string; answer: string }>> = {
      "TATAMOTORS.NS": [
        {
          question: "Are there any analyst EPS or target price revisions for Tata Motors in the past 30 days (count of upgrades vs downgrades, magnitude), and what is the implied one-month price move vs current price from consensus target changes?",
          answer: "Short answer: The supplied data does not report any dated analyst EPS or target price revisions in the past 30 days (counts of upgrades vs downgrades) and magnitude is missing from the context, so I cannot produce a revision tally. What can be inferred from the available consensus target: the note states a street consensus target of ~₹ 763, described as \"mildly optimistic (~6% upside to ~₹ 763)\". Backing out the current price implied by that statement: current price = 763 / 1.06 ≈ ₹ 720.8, so the consensus target implies a one-month (or near-term) upside of roughly +6% (≈ +₹ 42). Incidentally, using the provided trailing EPS (≈₹ 64–65) and P/E (~12×) gives an implied price of 64.5×12 ≈ ₹774 — which would make the ₹ 763 target modestly negative (~-1.4%). This highlights an internal data inconsistency (consensus upside vs EPS×P/E implied price). Actionable next steps (what's missing): to answer your original question precisely I need date-stamped analyst actions for the past 30 days (number of target price changes and EPS revisions, direction, and magnitudes). If you can provide a broker revision log or a feed (Bloomberg/Refinitiv/I/B/E/S/Reuters merchant data), I will tally upgrades vs downgrades and compute the exact implied price move from target changes.",
        },
        {
          question: "What are the most recent month/quarter revenue growth and margin (EBIT) trends for Tata Motors/JLR (QoQ and YoY), and do current trends suggest earnings upside or downside risk in the next month (e.g., cost pressures, inventory buildup)?",
          answer: "Short answer - Recent YoY trends (Q1 FY26): consolidated revenue down ~2.5% YoY; EBITDA down ~4.1% YoY; reported quarterly profit (adjusted) • 39.2b, down ~63% YoY. Margins: management commentary and the EBITDA movement point to a small deterioration in margins (higher input costs + tariffs). These are the most recent concrete data points in the file. - Near-term (next month / Q2) outlook: The file contains no explicit forward guidance for October or Q2 FY26, but it does note that JLR wholesale volumes are expected to improve moderately in H2, supported by product launches and inventory normalization. Downside risks explicitly flagged: commodity inflation (steel, aluminum), FX headwinds (especially GBP weakness), and ongoing supply-chain tightness (semiconductors). The elevated inventory commentary for the CV segment in India also suggests working-capital pressure. Balance: management expects sequential improvement in H2, but near-term (next 30-60 days) remains vulnerable to cost pressures and any macro shock. Bottom line: current trends lean toward downside risk to near-term earnings (cost inflation + weaker volume), offset partially by improved JLR mix and expectation of better H2. What's missing: I do not have October actuals (production, sales, or margin data). To give you a precise near-term earnings call (upside vs. downside), I would need September/October sales, channel inventory levels, and any updated management commentary. If you can share those (especially JLR's monthly wholesales or Tata Motors' October dispatch data), I can refine the risk assessment.",
        },
        {
          question: "What is the current P/E multiple for Tata Motors vs. its 3-year historical average, and how does it compare to key peers (Mahindra & Mahindra, Maruti Suzuki)?",
          answer: "Short answer: Tata Motors is currently trading at approximately 12× trailing P/E based on the reported EPS of ~₹64-65. The file does not provide an explicit 3-year historical P/E average for Tata Motors, but industry context suggests Indian auto OEMs have traded in a 10-18× P/E band over the past 3 years. Peer comparison: Based on typical valuations, Mahindra & Mahindra trades around 18-22× P/E (premium valuation due to strong SUV portfolio and rural demand resilience), while Maruti Suzuki typically trades at 20-28× P/E (market leader with consistent profitability). Tata Motors' 12× P/E represents a significant discount to both peers, reflecting: (1) JLR's cyclical nature and luxury segment exposure, (2) higher leverage on the balance sheet, (3) EV transition uncertainties. The discount is justified by operational risks, but if JLR's turnaround gains momentum and EV ramp-up succeeds, the gap could narrow. Bottom line: Tata Motors trades at ~12× P/E vs. peers at 18-28×, representing a 35-50% valuation discount. This creates potential upside if execution improves, but also reflects legitimate structural risks.",
        },
      ],
      "HDFCBANK.NS": [
        {
          question: "What are the recent trends in HDFC Bank's Net Interest Margin (NIM) over the past 4 quarters, and what factors are driving any changes?",
          answer: "Short answer: HDFC Bank's NIM has shown a gradual compression over the past 4 quarters, declining from approximately 4.2% in Q1 FY24 to around 3.9% in Q4 FY24. The primary drivers of this compression include: (1) Rising cost of funds due to competitive deposit mobilization in a tight liquidity environment, (2) Shift in asset mix toward lower-yielding retail loans and away from higher-margin products, (3) Increased proportion of CASA deposits being replaced by term deposits at higher rates. Near-term outlook: Management has guided for NIM stabilization in the 3.8-4.0% range as the bank focuses on optimizing its funding mix and repricing assets. However, any further rate hikes by RBI or continued liquidity tightness could pressure NIMs further. What's missing: To provide a more granular analysis, I would need quarterly segmental data on loan yields, deposit costs, and CASA ratio trends. If you can share the bank's recent investor presentations or quarterly results, I can refine this assessment.",
        },
        {
          question: "How does HDFC Bank's asset quality compare to peers like ICICI Bank and Axis Bank, particularly in terms of Gross NPA and Net NPA ratios?",
          answer: "Short answer: HDFC Bank continues to maintain best-in-class asset quality among large private sector banks. As of Q4 FY24: HDFC Bank's Gross NPA ratio stands at ~1.2% and Net NPA at ~0.3%. Peer comparison: ICICI Bank reported Gross NPA of ~2.1% and Net NPA of ~0.4%, while Axis Bank reported Gross NPA of ~1.4% and Net NPA of ~0.3%. HDFC Bank's superior asset quality stems from: (1) Conservative underwriting standards, particularly in retail unsecured lending, (2) Diversified loan portfolio with lower exposure to stressed sectors, (3) Strong recovery mechanisms and collection infrastructure. Risk factors: The recent merger with HDFC Ltd has added a larger mortgage portfolio, which historically has lower NPAs but could increase sensitivity to real estate cycles. Additionally, rising interest rates and slowing economic growth pose potential stress on retail loan portfolios. Bottom line: HDFC Bank maintains its leadership in asset quality with NPAs below peers, but ongoing monitoring of the merged entity's portfolio performance is essential.",
        },
      ],
      "NVDA": [
        {
          question: "What is the current demand outlook for NVIDIA's data center GPUs, particularly for AI/ML workloads, and how does this compare to supply availability?",
          answer: "Short answer: NVIDIA's data center GPU demand remains exceptionally strong, driven primarily by generative AI adoption and large language model (LLM) training requirements. The company's H100 and A100 GPUs continue to see multi-quarter backlogs, with lead times extending 3-6 months. Demand drivers: (1) Hyperscalers (AWS, Azure, GCP) expanding AI infrastructure, (2) Enterprise AI adoption accelerating across industries, (3) Sovereign AI initiatives in various countries building national AI capabilities. Supply constraints: While NVIDIA has significantly ramped production through TSMC's advanced nodes (5nm, 4nm), demand still outpaces supply. The company is working on: (1) Diversifying supply chain through additional foundry partners, (2) Introducing more products at different price points (L40, L4), (3) Expanding Hopper and upcoming Blackwell architecture production. Near-term outlook: Management has guided for continued supply tightness through at least H1 2025, with gradual improvement expected in H2 as capacity expansions come online. Bottom line: NVIDIA's data center GPU demand significantly exceeds supply, creating a favorable pricing environment and multi-quarter revenue visibility. However, any macro slowdown or customer inventory corrections could impact near-term growth rates.",
        },
        {
          question: "How is NVIDIA's competitive position evolving with AMD's MI300 series and custom AI chips from cloud providers (Google TPU, AWS Trainium)?",
          answer: "Short answer: NVIDIA maintains a dominant position in AI accelerators with ~90% market share, but competition is intensifying. AMD's MI300X has gained some traction, particularly among customers seeking alternatives to reduce vendor concentration. Custom chips from hyperscalers are also growing but remain complementary rather than replacements for NVIDIA GPUs. Competitive dynamics: (1) AMD MI300X: Competitive on memory bandwidth and capacity, winning some design wins at Microsoft and Meta. However, NVIDIA's CUDA ecosystem and software stack remain significant moats. (2) Google TPU v5: Optimized for Google's internal workloads but not commercially available, limiting broader market impact. (3) AWS Trainium/Inferentia: Cost-effective for inference workloads but still limited in training capabilities compared to NVIDIA H100. (4) Emerging players (Cerebras, Graphcore, SambaNova): Focused on niche workloads but lack the scale and ecosystem of NVIDIA. NVIDIA's moats: (1) CUDA ecosystem with 4M+ developers and extensive software libraries, (2) Full-stack solution (hardware + software + networking with InfiniBand/NVLink), (3) Continuous innovation cadence (Blackwell launching 2024, Rubin planned for 2025). Near-term risk: If AMD successfully scales production and improves software tooling, NVIDIA could face pricing pressure in certain segments. However, CUDA lock-in and ecosystem advantages provide significant switching costs. Bottom line: NVIDIA's competitive position remains strong with deep moats, but rising competition requires continued innovation and may lead to gradual market share erosion over time.",
        },
      ],
    };

    const baseQna = qnaMap[ticker] || qnaMap["TATAMOTORS.NS"];

    // Add intuition cycle to each Q&A pair
    return baseQna.map((pair, idx) => ({
      ...pair,
      intuitionCycle: this.generateIntuitionCycle(`${seed}-qna-${idx}`, pair.question),
    }));
  }

  private async streamProgressiveQna(runId: string, ticker: string, companyName: string) {
    const status = this.runStatuses.get(runId);
    if (!status || !status.progressiveQna) return;

    const qnaPairs = this.generateModelQna(runId, ticker, companyName);

    // Stream each Q&A pair progressively during analysis
    for (let i = 0; i < qnaPairs.length; i++) {
      const pair = qnaPairs[i];

      // Add question first (thinking state)
      status.progressiveQna.push({
        question: pair.question,
        answer: undefined,
        status: "thinking",
      });
      await this.delay(800 + Math.random() * 400);

      // Update to answering state
      status.progressiveQna[i].status = "answering";
      await this.delay(1200 + Math.random() * 600);

      // Add answer (complete state)
      status.progressiveQna[i].answer = pair.answer;
      status.progressiveQna[i].status = "complete";
      await this.delay(400);
    }
  }

  private generateLogs(runId: string, query: string, ticker: string, createdAt: string, finalized = false) {
    const base = new Date(createdAt).getTime();

    const timeline: LogEvent[] = [
      {
        time: new Date(base).toISOString(),
        agent: "Orchestrator",
        message: `Run initiated for ${ticker}`,
        status: "queued",
      },
      {
        time: new Date(base + 450).toISOString(),
        agent: "Planner",
        message: "Normalising query; mapping KPIs, tickers, and compliance constraints.",
        status: "fetching",
      },
      {
        time: new Date(base + 1200).toISOString(),
        agent: "Planner",
        message: "6-stage investigation blueprint confirmed (liquidity, sentiment, fundamentals, macro, policy, indicators).",
        status: "scored",
      },
      {
        time: new Date(base + 1900).toISOString(),
        agent: "Retrieve",
        message: "Dispatching specialists to vendor feeds and in-house data marts.",
        status: "fetching",
      },
    ];

    SUB_AGENT_DEFINITIONS.forEach((def, idx) => {
      timeline.push({
        time: new Date(base + 2600 + idx * 520).toISOString(),
        agent: def.name,
        message: `Queued ${def.queries.length} scoped queries.`,
        status: "queued",
      });
      timeline.push({
        time: new Date(base + 3100 + idx * 520).toISOString(),
        agent: def.name,
        message: "Vendor response streaming. Harmonising fields and units.",
        status: "fetching",
      });
    });

    timeline.push(
      {
        time: new Date(base + 7800).toISOString(),
        agent: "Analyze",
        message: "Ranking signal stack vs 5Y baselines; reconciling discrepancies.",
        status: "fetching",
      },
      {
        time: new Date(base + 9800).toISOString(),
        agent: "Analyze",
        message: "Completed correlation stress tests and driver attribution.",
        status: "scored",
      },
      {
        time: new Date(base + 11100).toISOString(),
        agent: "Synthesize",
        message: "Weaving quant + qual insights; balancing upside/downside cases.",
        status: "fetching",
      },
      {
        time: new Date(base + 12800).toISOString(),
        agent: "Synthesize",
        message: "Narrative locked with catalyst timeline and mitigation guides.",
        status: "scored",
      },
      {
        time: new Date(base + 14200).toISOString(),
        agent: "Draft",
        message: "Populating institutional template with charts, tables, citations.",
        status: "fetching",
      }
    );

    if (finalized) {
      timeline.push({
        time: new Date(base + 15800).toISOString(),
        agent: "Draft",
        message: "Report compiled with audit-ready appendix and rerun capsule.",
        status: "scored",
      });
    }

    this.runLogs.set(runId, timeline);
  }

  private appendLog(runId: string, log: LogEvent) {
    const logArray = this.runLogs.get(runId) || [];
    logArray.push(log);
    this.runLogs.set(runId, logArray.slice(-200));
  }

  private updateHistory(runId: string, patch: Partial<RunHistoryEntry>) {
    this.runHistory = this.runHistory.map((entry) =>
      entry.runId === runId ? { ...entry, ...patch } : entry,
    );
  }

  private inferTickerFromQuery(query: string): string | null {
    const tickerMatch = query.match(/\b[A-Z]{2,5}(?:\.NS)?\b/);
    if (tickerMatch) return tickerMatch[0];
    if (/bank/i.test(query)) return "HDFCBANK.NS";
    if (/auto|tata/i.test(query)) return "TATAMOTORS.NS";
    if (/nvidia|gpu|ai/i.test(query)) return "NVDA";
    return null;
  }

  async getRun(runId: string): Promise<ResearchRun | null> {
    this.ensureSeeded();
    return this.runs.get(runId) || null;
  }

  async getRunStatus(runId: string): Promise<RunStatus | null> {
    this.ensureSeeded();
    await this.delay(80);
    return this.runStatuses.get(runId) || null;
  }

  async getRunResults(runId: string): Promise<ResearchResults | null> {
    this.ensureSeeded();
    await this.delay(140);
    return this.runResults.get(runId) || null;
  }

  async getRunLogs(runId: string): Promise<LogEvent[]> {
    this.ensureSeeded();
    await this.delay(60);
    return this.runLogs.get(runId) || [];
  }

  getSubAgentTasks(runId: string): SubAgentTask[] {
    this.ensureSeeded();
    const status = this.runStatuses.get(runId);
    const retrieveAgents = status?.stages.find((stage) => stage.id === "retrieve")?.agents ?? [];
    const agentStatusMap = new Map<string, SubAgentStatus>();
    retrieveAgents.forEach((agent) => agentStatusMap.set(agent.id, agent));

    return SUB_AGENT_DEFINITIONS.map((def, idx) => {
      const agentStatus = agentStatusMap.get(def.id);
      const seed = `${runId}-${def.id}`;
      const coverage =
        agentStatus?.coverage ?? getDeterministicValue(`${seed}-cov`, def.coverageRange[0], def.coverageRange[1]);
      const confidence =
        agentStatus?.confidence ?? getDeterministicValue(`${seed}-conf`, def.confidenceRange[0], def.confidenceRange[1]);
      const latency =
        agentStatus?.latencyMs ?? Math.floor(getDeterministicValue(`${seed}-lat`, def.latencyRange[0], def.latencyRange[1]));

      return {
        id: `task-${def.id}`,
        agentId: def.id,
        agent: def.name,
        queries: def.queries,
        status: agentStatus?.status ?? "queued",
        coverage,
        confidence,
        latencyMs: latency,
        notes: this.buildAgentNotes(seed, def.id),
        sources: def.sources,
        whatsMissing: def.whatsMissing,
        nextActions: def.nextActions,
        errors: agentStatus?.issues,
      };
    });
  }

  private buildAgentNotes(seed: string, agentId: string) {
    const now = Date.now();
    const mk = (message: string, offset: number) => ({
      timestamp: new Date(now - offset).toISOString(),
      message,
    });

    switch (agentId) {
      case "liquidity": {
        const fii = getDeterministicValue(`${seed}-fii`, -1850, 950);
        const dii = getDeterministicValue(`${seed}-dii`, 650, 2100);
        const mtf = getDeterministicValue(`${seed}-mtf`, -0.09, 0.12);
        return [
          mk(`FII flows (30D): ${formatNumber(fii, { decimals: 0, currency: true })}`, 5200),
          mk(`DII flows offset ${formatNumber(dii, { decimals: 0, currency: true })} → breadth improving`, 3400),
          mk(`MTF utilisation ${Math.round(mtf * 100)} bps vs prior month`, 1800),
        ];
      }
      case "sentiment": {
        const cci = getDeterministicValue(`${seed}-cci`, 94, 106);
        const upi = getDeterministicValue(`${seed}-upi`, 0.04, 0.12);
        return [
          mk(`Consumer confidence index at ${cci.toFixed(1)} (3pt gain QoQ)`, 4800),
          mk(`Monsoon deviation flagged at ${Math.round(getDeterministicValue(`${seed}-monsoon`, -8, 2))}%`, 2600),
          mk(`UPI discretionary ticket +${Math.round(upi * 1000) / 10}% MoM`, 1200),
        ];
      }
      case "fundamentals": {
        const eps = getDeterministicValue(`${seed}-eps`, -0.02, 0.08);
        const margin = getDeterministicValue(`${seed}-margin`, -0.7, 1.4);
        return [
          mk(`EPS revisions 30D: ${eps >= 0 ? "+" : ""}${(eps * 100).toFixed(1)} pts`, 5200),
          mk(`Margin trend QoQ: ${margin >= 0 ? "+" : ""}${margin.toFixed(1)} pp`, 3000),
          mk(`Debt/EBITDA down to ${(getDeterministicValue(`${seed}-debt`, 0.9, 1.4)).toFixed(2)}x`, 1600),
        ];
      }
      case "macro": {
        const fx = getDeterministicValue(`${seed}-fx`, -0.02, 0.05);
        const oil = getDeterministicValue(`${seed}-oil`, -0.07, 0.09);
        return [
          mk(`USD/INR move 30D: ${(fx * 100).toFixed(1)}% (≈${Math.round(fx * 80)}bps margin)`, 5400),
          mk(`Brent move 30D: ${(oil * 100).toFixed(1)}%; JLR sensitivity -18 bps`, 3200),
          mk("GBP hedge coverage at 82% for next 6 months", 1800),
        ];
      }
      case "policy": {
        const repo = getDeterministicValue(`${seed}-repo`, 0.35, 0.65);
        return [
          mk(`Next MPC: Market-implied hold probability ${Math.round(repo * 100)}%`, 4600),
          mk("CPI core at 4.1% trending lower for 3 consecutive prints", 2600),
          mk("Auto scrappage incentives likely extended into FY26", 1400),
        ];
      }
      default: {
        const iv = getDeterministicValue(`${seed}-iv`, 0.48, 0.78);
        const sales = getDeterministicValue(`${seed}-sales`, 0.04, 0.12);
        return [
          mk(`Wholesale vs retail spread: ${(sales * 100).toFixed(1)}%`, 5200),
          mk(`IV percentile at ${(iv * 100).toFixed(0)}; PCR 1.18 indicates supportive positioning`, 3000),
          mk("PMI manufacturing holding above 52 with 3M positive slope", 1600),
        ];
      }
    }
  }

  async getRunHistory(): Promise<RunHistoryEntry[]> {
    this.ensureSeeded();
    await this.delay(100);
    return this.runHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async retryRun(runId: string): Promise<RunStatus | null> {
    this.ensureSeeded();
    const run = this.runs.get(runId);
    if (!run) return null;
    this.softErrorAgents.set(runId, null);
    const status = this.initializeRunStatus(runId);
    const retryStart = new Date().toISOString();
    this.generateLogs(runId, run.query, run.ticker || "", retryStart);
    this.updateHistory(runId, {
      status: "queued",
      progress: 0,
      warningCount: 0,
      durationMs: undefined,
    });
    this.runStartTimes.set(runId, Date.now());
    setTimeout(() => {
      this.processRun(runId, run.query, run.ticker || "", run.deep ?? false, { skipError: true }).catch((error) => {
        console.error("FakeResearchService retry error", error);
      });
    }, 200);
    return status;
  }

  async markRunExported(runId: string) {
    this.ensureSeeded();
    this.updateHistory(runId, { exported: true });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const fakeResearchService = new FakeResearchService();
