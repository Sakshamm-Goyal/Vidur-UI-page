# 🎬 Aime Demo Script (3-Minute Walkthrough)

Use this narrative to show how Aime compresses the institutional equity workflow from natural language → transparent analysis → sharable artefacts.

---

## 🎯 Opening (15s)
> “Meet Aime: an institutional-grade equity research copilot that turns 100-hour analyst workflows into 1–2 hour deliverables. Everything you’ll see is a deterministic mock with production-ready UX — seeded runs, realistic latency, and exportable deliverables.”

Browser: open **http://localhost:3000**

---

## 1️⃣ Kick-off & Prompt (30s)

1. Press **⌘ + K** to launch the command palette → choose **New Chat**.
2. Highlight the hero copy “Your Financial World, in One Intelligent Hub”.
3. In the prompt bar type **“Does Tata Motors go up or down in one-month horizon?”** (ensure **Deep Research** toggle is ON) and submit.
4. Mention that the pipeline is instantly versioned (Run ID, timestamp, settings) and reproducible from History.

---

## 2️⃣ Research Run (110s)

### Header & Controls (15s)
- Show unique Run ID, Deep badge, live progress bar, share/re-run/export CTAs.
- Note keyboard shortcuts: `/` focuses global search, **Shift + R** restarts the pipeline, `?` opens the shortcut overlay.

### Thinking Timeline (40s)
- Expand **Retrieve Evidence** to reveal the six sub-agents.
- Narrate metrics per agent: coverage %, confidence %, latency, and soft-error badges.
- Trigger a retry: press **Shift + R** or click **Re-run** to show deterministic restart (status flips back to queued).
- Open the **Liquidity** agent — Task Drawer slides in with:
  - Sub-questions executed (FII/DII flows, MTF, breadth).
  - Timestamped processing timeline (fetch → parse → score).
  - Source cards, “What’s Missing”, and “Next Actions”.
  - “Retry sub-agent” button (press it to show the toast).

### Insight Canvas (55s)
Once status = Ready:
- **Summary Bar**: live price, target, conviction badge, confidence %, multi-period returns.
- **KPI Grid**: 1M/3M/6M/1Y/3Y returns, 5Y CAGR, max drawdown, Sharpe, beta.
- **Charts**:
  - Price + drawdown combo with event markers (policy, earnings, etc.).
  - Daily return distribution histogram.
  - Driver attribution bars.
  - Volatility vs return scatter for peers.
  - Valuation bands (forward PE percentile shading).
- **Risk Radar**: severity-tagged FX/Oil/Rate/Regulatory insights.
- **Peer Table**: toggle optional columns, sort metrics, click **Download** to export CSV.
- **Citations**: five seeded sources with excerpts and dates (deterministic per run).

---

## 3️⃣ Outputs & Audit (50s)

### Report Builder (25s)
1. Click **Generate Report** → navigates with `?runId=…`.
2. Point out locked AI sections vs analyst-editable ones.
3. Export both **PDF** and **DOCX** (real downloads served by `/api/report`).
4. Mention seeded template structure: thesis, flows, fundamentals, macro/policy, risks, valuation, appendix, disclosures.

### History & Screener (25s)
1. Navigate to **History & Audit** from sidebar (or `⌘ + K`).
   - Filter runs, copy share link, retry pipeline inline, export CSV.
2. Jump to **AI Screener**:
   - Adjust factor score slider, toggle momentum/valuation/quality pillars.
   - Queue a name (e.g., HDFCBANK.NS) to “Queue to Report” → toast confirms it would trigger a run.

---

## 🎤 Closing (10s)
> “We just went from a plain-English question to a transparent, auditable deep-dive, and exported institutional artefacts – all with seeded mocks that behave like production systems. That’s the Aime promise: institutional workflows at AI speed.”

Emphasise differentiators:
- Transparent multi-agent pipeline.
- Institutional polish (risk, valuation, citations).
- Reproducibility (versioned runs, seeded data, deterministic exports).
- Keyboard-first, latency-aware UX.

Invite questions.
