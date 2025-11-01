// Core research types
export interface ResearchRun {
  runId: string;
  query: string;
  ticker?: string;
  deep: boolean;
  createdAt: string;
  stages: Stage[];
  etaMs: number;
}

export interface Stage {
  id: string;
  name: string;
  agents: string[];
}

export interface SubAgentStatus {
  id: string;
  name: string;
  status: "queued" | "fetching" | "parsed" | "scored" | "error";
  coverage: number; // 0-1
  confidence: number; // 0-1
  latencyMs: number;
  lastUpdated: string;
  badges?: Array<{
    label: string;
    value: string;
    tone?: "positive" | "negative" | "neutral";
  }>;
  issues?: string[];
}

export interface StageStatus {
  id: string;
  status: "queued" | "running" | "done" | "error";
  coverage: number; // 0-1
  confidence: number; // 0-1
  latencyMs: number;
  agents?: SubAgentStatus[];
}

export interface RunStatus {
  runId: string;
  overall: "queued" | "running" | "synthesizing" | "ready" | "error";
  progress: number; // 0-1
  stages: StageStatus[];
  progressiveQna?: Array<{
    question: string;
    answer?: string;
    status: "thinking" | "answering" | "complete";
  }>;
}

export interface PricePoint {
  t: string; // ISO date
  c: number; // close price
  v?: number; // volume
}

export interface PeerRow {
  ticker: string;
  name: string;
  pe: number;
  pb: number;
  roe: number;
  nim?: number;
  npa?: number;
  llp?: number;
}

export interface Citation {
  id: string;
  domain: string;
  title: string;
  dt: string;
  url: string;
  excerpt?: string;
}

export interface DriverContribution {
  bucket: string;
  score: number; // -1 to +1
}

export interface ValuationMetrics {
  fwd_pe: number;
  ev_ebitda: number;
  percentile: {
    pe: number; // 0-1
    ev: number; // 0-1
  };
}

// Intuition Cycle - Chain of Thought visualization
export interface ThoughtNode {
  id: string;
  type: "hypothesis" | "analysis" | "evidence" | "conclusion" | "contradiction";
  content: string;
  confidence: number; // 0-1
  timestamp: number;
  dependencies: string[]; // IDs of nodes this depends on
  impact: "low" | "medium" | "high";
}

export interface ThoughtPath {
  id: string;
  name: string;
  nodes: ThoughtNode[];
  outcome: "accepted" | "rejected" | "merged";
  confidenceScore: number;
}

export interface IntuitionCycle {
  cycles: Array<{
    id: string;
    question: string;
    paths: ThoughtPath[];
    synthesis: string;
    timeline: number; // ms taken
  }>;
}

export interface QnaPair {
  question: string;
  answer: string;
  intuitionCycle?: IntuitionCycle; // Behind-the-scenes reasoning
}

export interface ResearchResults {
  summary: {
    thesis: string;
    confidence: number; // 0-1
    conviction: "High" | "Medium" | "Low";
    convictionScore: number; // 0-100
    headline: string;
  };
  ticker: {
    symbol: string;
    name: string;
    currentPrice: number;
    currency: string;
    changes: {
      "1D": number;
      "1W": number;
      "1M": number;
      "1Y": number;
      "5Y": number;
    };
  };
  kpis: {
    priceTarget?: number;
    ret_1m: number;
    ret_3m: number;
    ret_6m: number;
    ret_1y: number;
    ret_3y: number;
    cagr_5y: number;
    max_dd_5y: number;
    sharpe_5y: number;
    beta_1y: number;
  };
  drivers: DriverContribution[];
  charts: {
    price: PricePoint[];
    rolling_cagr: number[];
    drawdown: number[];
    distribution: Array<{ bucket: string; frequency: number }>;
    volatilityScatter: Array<{
      ticker: string;
      name: string;
      oneMonthReturn: number;
      volatility: number;
      marketCap: number;
    }>;
    valuationBands: Array<{
      t: string;
      low: number;
      base: number;
      high: number;
    }>;
    events: Array<{
      t: string;
      label: string;
      type: "earnings" | "policy" | "macro" | "product";
      impact: "positive" | "negative" | "neutral";
    }>;
  };
  peers: PeerRow[];
  valuation: ValuationMetrics;
  riskFactors: Array<{
    name: string;
    level: "Low" | "Medium" | "Elevated";
    description: string;
  }>;
  citations: Citation[];
  modelQna?: QnaPair[]; // Model's internal Q&A reasoning
}

export interface LogEvent {
  time: string;
  agent: string;
  message: string;
  sourceRefs?: string[];
  status?: "queued" | "fetching" | "parsed" | "scored" | "error";
}

export interface SubAgentTask {
  id: string;
  agentId: string;
  agent: string;
  queries: string[];
  status: "queued" | "fetching" | "parsed" | "scored" | "error";
  coverage: number;
  confidence: number;
  latencyMs: number;
  notes: Array<{
    timestamp: string;
    message: string;
  }>;
  sources: Array<{
    domain: string;
    title: string;
  }>;
  whatsMissing?: string[];
  nextActions?: string[];
  errors?: string[];
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
  locked: boolean;
  charts?: string[]; // chart IDs
  tables?: string[]; // table IDs
}

export interface Report {
  reportId: string;
  runId: string;
  template: string;
  sections: ReportSection[];
  url_pdf?: string;
  url_docx?: string;
}

export interface RunHistoryEntry {
  runId: string;
  query: string;
  ticker: string;
  createdAt: string;
  deep: boolean;
  status: "queued" | "running" | "ready" | "error";
  progress: number;
  confidence?: number;
  durationMs?: number;
  exported?: boolean;
  warningCount?: number;
}

// UI State types
export interface ThinkingTimelineState {
  collapsed: boolean;
  selectedAgent: string | null;
}
