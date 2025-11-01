# Aime - Institutional Equity Research Copilot

A production-grade, institutional equity research platform powered by AI that reduces 100-hour analyst workflows to 1-2 hours. This is a **fully functional mock** implementation with deterministic sample data, realistic latencies, and professional UX.

![Aime Platform](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38bdf8)

---

## 🚀 Features

### Core Capabilities
- **Natural Language Queries**: Ask complex research questions in plain English with automatic ticker detection.
- **Deep Research Mode**: Multi-agent pipeline with deterministic latencies, soft-error simulation, and restart controls.
- **Thinking Timeline**: Live decomposition, sub-agent metrics (coverage, confidence, latency) and logs with retry hooks.
- **Insight Canvas**: KPI grid, multi-chart analytics (price + drawdown, distribution, scatter, valuation bands), risk radar, peers, and citations.
- **Institutional Report Export**: Mocked PDF & DOCX generation with embedded sections via `/api/report`, downloadable immediately.
- **History & Audit**: Versioned run table with status, warnings, confidences, retry/share/export CTA, and CSV export.
- **AI Screener**: Multi-factor filters (score, momentum, valuation, quality) with CSV export and queue-to-report workflow.
- **Keyboard-first UX**: Global search (`/`), command palette (`⌘ + K` / `Ctrl + K`), shortcut overlay (`?`), and hot key to re-run active pipelines (`Shift + R`).

### Sub-Agent Pipeline
1. **Liquidity Agent**: FII/DII flows, MTF changes, volume analysis
2. **Sentiment Agent**: Consumer confidence, UPI trends, monsoon data
3. **Fundamentals Agent**: EPS revisions, margin trends, leverage metrics
4. **Macro/Global Agent**: USD/INR impact, Brent sensitivity
5. **Domestic Policy Agent**: RBI scenarios, CPI trajectory
6. **Additional Indicators**: PMI, derivatives positioning, IV analysis

### Design Excellence
- **Institutional Palette**: Navy/slate color scheme with high contrast (WCAG AA)
- **Typography**: Inter for UI, Roboto Mono for numbers
- **Responsive**: Optimized for 1280×800 and 1536×960
- **Performance**: Lazy loading, optimistic UI, < 100ms interactions

---

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router) + TypeScript
- **UI Components**: shadcn/ui + Radix UI primitives
- **Styling**: TailwindCSS 4 + CSS Variables
- **Charts**: Recharts (lightweight, customizable)
- **State**: React hooks + deterministic FakeService
- **Icons**: Lucide React

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- Modern browser (Chrome, Safari, Firefox)

### Installation

```bash
# Clone or navigate to project directory
cd equity-research-copilot

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Development Server
The app will run at **http://localhost:3000** (or next available port).

---

## 🎯 Demo Walkthrough (3-Minute Script)

### 1. Launch & Prompt (30s)
- Hit `⌘ + K` to surface the command palette, jump to **New Chat**.
- Showcase the hero line “Your Financial World, in One Intelligent Hub”.
- Type “Does Tata Motors go up or down in one-month horizon?” into the prompt bar (Deep Research ON) and submit.

### 2. Research Run (110s)
- **Header**: Highlight Run ID, timestamp, Deep badge, progress bar, retry/share/export CTAs.
- **Thinking Timeline**:
  - Expand **Retrieve Evidence** → watch agents stream coverage/confidence/latency.
  - Trigger a soft error (Random) → use `Shift + R` or Retry CTA to restart.
  - Open Liquidity Task Drawer → review queries, timeline notes, sources, “What’s Missing”, “Next Actions”.
- **Insight Canvas**:
  - Summary bar (price, target, conviction, returns).
  - KPI grid (returns, Sharpe, beta, max drawdown).
  - Walk through charts: Price + drawdown with event markers, Return distribution, Drivers, Vol vs Return scatter, Valuation bands, Risk radar.
  - Peer table → toggle columns, export CSV.
  - Citations with excerpts and timestamps.

### 3. Exports & Audit (40s)
- Hit **Generate Report** → lands in Report Builder with locked/unlocked sections.
- Export PDF and DOCX (real downloads) via `/api/report`.
- Jump to **History & Audit** → filter, copy share links, retry pipeline, export CSV.
- Show **AI Screener** filters (score slider, factor toggles) and queue one result to research.

---

## 📂 Project Structure

```
equity-research-copilot/
├── app/
│   ├── api/
│   │   ├── report/                 # Mock report export endpoints
│   │   └── research/               # Research run lifecycle (create/status/logs/retry/history)
│   ├── history/                    # History & audit table
│   ├── report-builder/             # Institutional report editor + exporter
│   ├── research/[runId]/           # Dynamic research run experience
│   ├── screener/                   # AI Screener (multi-factor filters)
│   ├── layout.tsx                  # Root layout with top-nav & left-rail
│   └── page.tsx                    # Home / chat prompt hub
├── components/
│   ├── layout/                     # Navigation shell, command palette, keyboard overlays
│   ├── research/                   # Prompt bar, timeline, task drawer, KPI/Chart cards, peer table
│   └── ui/                         # shadcn/ui primitives (button, input, etc.)
├── lib/
│   ├── services/
│   │   ├── fake-report-service.ts  # PDF/DOCX generator backed by pdf-lib & docx
│   │   └── fake-research-service.ts# Research mock pipelines, seeded runs, history store
│   ├── stores/                     # Zustand stores (toast bus)
│   ├── types.ts                    # Shared TypeScript contracts
│   └── utils.ts                    # Formatting helpers, deterministic random
├── tailwind.config.ts              # TailwindCSS config
├── tsconfig.json                   # TypeScript config
└── package.json                    # Dependencies
```

---

## 🧪 Mock Data & Seeding

The `fake-research-service.ts` uses **deterministic seeding** based on `(ticker + query)` to ensure:
- Same query always produces same results
- Reproducible research runs
- Realistic latencies (600-1400ms per sub-agent)
- 1-2% error rate simulation

### Pre-seeded Examples
- **TATAMOTORS.NS**: 1-month horizon analysis with full 6-agent pipeline
- **HDFCBANK.NS**: 5-year performance analysis
- **NVDA**: Target price analysis (US equity)

---

## 🎨 Design Tokens

### Colors
| Token                     | Value / Description                                            |
|---------------------------|----------------------------------------------------------------|
| `--primary`               | `hsl(217.2 91.2% 59.8%)` – Indigo gradient anchor              |
| `--background`            | `hsl(0 0% 100%)` light / `hsl(224 71% 4%)` dark                |
| `--border`                | `hsl(214.3 31.8% 91.4%)`                                       |
| `--accent`                | `hsl(216 34% 17%)` dark overlays                               |
| `--radius`                | `0.75rem` (cards), `0.5rem` (inputs)                           |
| Typeface                  | Inter (UI), Roboto Mono (metrics, tabular-nums)               |
| Baseline grid             | 16px base, 24px card padding, 1.5rem section gaps              |

---

## ⌨️ Keyboard Shortcuts

| Shortcut         | Action                           |
|------------------|----------------------------------|
| `⌘ + K` / `Ctrl + K` | Open command palette           |
| `/`              | Focus global search              |
| `?`              | Display shortcut reference modal |
| `Shift + R`      | Retry the active research run    |

---

## 🔧 Adding New Mock Endpoints

Example: Add a new valuation scenario endpoint

```typescript
// lib/services/fake-research-service.ts
async runValuationScenario(runId: string, params: ScenarioParams) {
  const seed = `${runId}-scenario-${params.waccDelta}`;
  return {
    baseCase: getDeterministicValue(seed, 100, 150),
    bullCase: getDeterministicValue(`${seed}-bull`, 120, 180),
    bearCase: getDeterministicValue(`${seed}-bear`, 80, 110),
  };
}

// app/api/valuation/scenario/route.ts
export async function POST(request: NextRequest) {
  const { runId, params } = await request.json();
  const results = await fakeResearchService.runValuationScenario(runId, params);
  return NextResponse.json(results);
}
```

---

## 🚢 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 🎬 Keyboard Shortcuts (Planned)

- `/` → Focus search
- `⌘K` → Command palette
- `?` → Show shortcuts
- `Esc` → Close drawer/modal

---

## 📊 Performance Metrics

- **Time to Interactive**: < 2s
- **First Contentful Paint**: < 1s
- **Chart Rendering**: < 100ms
- **API Mock Latency**: 600-1400ms (realistic simulation)

---

## 🔮 Future Enhancements (Stretch Goals)

- [ ] **Scenario Sandbox**: Sliders for USD/INR, Brent, Repo rate
- [ ] **Derivatives Lens**: IV surface, max pain, implied moves
- [ ] **Backtest Module**: Factor combos with Sharpe/turnover
- [ ] **Report Builder**: WYSIWYG editor with one-click PDF/Docx export
- [ ] **History & Audit**: Full run versioning and replay
- [ ] **AI Screener**: Multi-facet filters with saved screens

---

## 🙏 Credits

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS
- [Radix UI](https://www.radix-ui.com/) - Accessible components
- [Recharts](https://recharts.org/) - Chart library
- [Lucide](https://lucide.dev/) - Icon set

Inspired by institutional finance tools: AInvest, Moneycontrol Pro, Bloomberg Terminal.

---

## 📝 License

This is a **mock demonstration** project. Not intended for production trading/investment decisions.

---

## 📞 Support

For questions or demo requests, please contact the development team.

**Happy Analyzing! 📈**
