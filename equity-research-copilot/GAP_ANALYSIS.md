# Gap Analysis - What's Missing

## ✅ COMPLETED (Core MVP)

### Screens
- ✅ Home / Aime Chat with PromptBar
- ✅ Research Run View (two-pane layout)
- ✅ Thinking Timeline (left 30%)
- ✅ Insight Canvas (right 70%)
- ✅ Task Drawer (sub-agent details)

### Components Built
- ✅ PromptBar with Deep Research toggle
- ✅ ThinkingTimeline with 5 stages
- ✅ TaskDrawer with sub-questions, sources, What's Missing, Next Actions
- ✅ KPIGrid (4 tiles)
- ✅ ChartCard (Price, Drivers)
- ✅ PeerTable (sortable)
- ✅ InsightCanvas with Summary, KPIs, Charts, Peers, Valuation, Risk, Citations

### Infrastructure
- ✅ FakeService with deterministic seeding
- ✅ API routes (run, status, results, logs)
- ✅ Real-time polling (1s interval)
- ✅ TypeScript types
- ✅ Tailwind design system

---

## ❌ MISSING (Critical Gaps)

### 1. Home Page Features
- ❌ Tabs below fold: All, Symbols, News, People also ask
- ❌ Toast notification on submit: "Question analysis complete → Searching key information…"
- ❌ Run header pill display after submission

### 2. Insight Canvas - Performance Tiles
- ❌ 3M, 6M performance tiles (only have 1M, 1Y, 5Y, Max DD)
- ❌ "vs Nifty/sector" comparison badges

### 3. Charts (MAJOR GAP)
- ❌ Price with 50/200 DMA overlays
- ❌ Drawdowns chart (separate or dual)
- ❌ Rolling CAGR chart
- ❌ Distribution of daily returns
- ❌ Volatility vs peers scatter plot
- ❌ Event markers on price chart
- ❌ Attribution Waterfall chart (currently simple bar)
- ❌ Valuation Bands chart (forward PE time-band)
- ❌ UPI/PMI/CPI mini-charts in Macro panel

### 4. Insight Canvas Components
- ❌ Summary Bar sticky header with live price, 1D/1W/1M/1Y/5Y changes
- ❌ Valuation DCF slider (WACC, g)
- ❌ Column toggles on PeerTable
- ❌ Pin metrics feature

### 5. Report Builder (ENTIRE SCREEN MISSING)
- ❌ WYSIWYG editor
- ❌ Locked sections + analyst notes
- ❌ PDF/Docx export (real files, not just toast)
- ❌ Report template with sections
- ❌ Export toolbar

### 6. History & Audit (ENTIRE SCREEN MISSING)
- ❌ Table of runs
- ❌ Run details view
- ❌ Reproduce Run button
- ❌ Share Link

### 7. AI Screener (ENTIRE SCREEN MISSING)
- ❌ Multi-facet filters
- ❌ Saved screens
- ❌ Queue to Report

### 8. Other Missing Screens
- ❌ Data Agent
- ❌ Backtest
- ❌ AI Charts
- ❌ Dashboard
- ❌ Portfolio Builder
- ❌ Agent (multi-agent runs)
- ❌ Explore Community

### 9. Missing UI Elements
- ❌ KPIBadge with tiny sparkline
- ❌ InsightTag (positive/negative chips)
- ❌ CitationList grouped by source
- ❌ ReportToolbar
- ❌ Period selector on charts
- ❌ Full-screen expand on charts
- ❌ PNG download (only placeholder)
- ❌ CSV download (only placeholder)

### 10. Error States
- ❌ No data banner (red) with Try Again
- ❌ Partial coverage (yellow badge)
- ❌ Latency spikes with cancel button
- ❌ 1-2% soft error injection

### 11. Keyboard Shortcuts
- ❌ `/` to focus search
- ❌ `?` to open shortcuts
- ❌ `Cmd+K` command palette

### 12. Theme
- ❌ Dark mode toggle (system only, no UI toggle)
- ❌ Light/dark theme switching

### 13. Stretch Goals
- ❌ Scenario Sandbox
- ❌ Derivatives Lens
- ❌ Backtest tab

---

## 🔥 CRITICAL TO FIX NOW

1. **More Performance Tiles** (3M, 6M, 3Y)
2. **Additional Charts** (at least Drawdown, Rolling CAGR)
3. **Summary Bar** with live price ticker
4. **Report Builder** (basic version)
5. **History/Audit page**
6. **Error states** visible
7. **Export buttons** actually work (CSV at minimum)
8. **Toast notifications**

---

## Priority Order

### P0 (Must Have for Demo)
1. Summary Bar with ticker + price + changes
2. More performance tiles (3M, 6M, 3Y)
3. Drawdown chart
4. Rolling CAGR chart
5. Toast notifications
6. Error state examples
7. History page (basic)
8. Report Builder (basic with mock export)

### P1 (Should Have)
9. Additional charts (distribution, scatter)
10. Event markers
11. Valuation bands chart
12. DCF sliders
13. Dark mode toggle UI

### P2 (Nice to Have)
14. AI Screener
15. Other sidebar screens
16. Keyboard shortcuts
17. Scenario sandbox
