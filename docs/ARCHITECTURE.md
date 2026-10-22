# Website architecture

How the DeepAgentLabs website is put together: which files exist, what each one does,
how the pages are built, and how to change things safely.

The marketing site is **plain HTML, CSS and vanilla JavaScript**. The Pages
workflow stages those files and builds MCP and Control Tower documentation from
their source repositories. All six product docs share one MkDocs Material theme.
See [documentation publishing](DOCUMENTATION_PUBLISHING.md) for build and deployment details.

---

## 1. Folder structure

```
deepagentlabs.github.io/
├── index.html                  Homepage
├── roadmap.html                Roadmap page (AI Operations Specification milestones)
├── 404.html                    Not-found page; shows "coming soon" for product/docs links
├── CNAME                       Custom domain → deepagentlabs.io
├── .nojekyll                   Tells GitHub Pages to serve files as-is (no Jekyll)
├── README.md                   Publish + local preview instructions
├── .github/
│   └── CODEOWNERS
├── assets/
│   ├── css/                    Stylesheets (one file per area, see §3)
│   ├── js/                     Scripts (one file per feature, see §4)
│   └── img/
│       ├── dal-logo.png        Brand mark (header, footer)
│       └── ecosystem.png       Hero diagram + social share image (og:image)
└── docs/
    ├── ARCHITECTURE.md         This file
    ├── CHANGELOG.md            What changed on the website and why
    └── ecosystem/              Internal engineering notes about the DeepAgentLabs repos
                                (not part of the website, not linked from it)
```

Rules of thumb:

- **Pages live at the root.** A new page is a new `*.html` file next to `index.html`.
- **Everything a page loads lives in `assets/`**, sorted by type (`css/`, `js/`, `img/`).
- **Docs live in `docs/`.** Nothing in `docs/` is loaded by the website.
- File names are lowercase and use hyphens. No spaces.

---

## 2. Pages

### `index.html` — homepage

| # | Section (id)        | What it shows                                              | Main files |
|---|---------------------|------------------------------------------------------------|------------|
| – | Header / nav        | Logo, mega-menus (Platform, Products, Docs, Use cases), links, GitHub | `nav.css`, `nav.js`, `usecases-data.js`, `usecases.js`, `site.js` |
| 1 | `#top` hero         | Headline, intro, buttons, ecosystem diagram card           | `styles.css`, `theme.css`, `enhance.*` |
| – | Package ticker      | Scrolling lime strip of package names (built by script)    | `enhance.*`, `theme.css` |
| 2 | `#loop`             | "One loop, five stages" – the operating loop               | `styles.css`, `theme.css`, `enhance.js` |
| 3 | `#architecture`     | Interactive capability map + details panel                 | `architecture.*`, `architecture-theme.css`, `architecture-compact.js` |
| 4 | `#dashboards`       | "What each framework actually does": tabbed showcase of the seven DeepAgentLabs frameworks with sample output      | `tools.*`, `copy.*` |
| 5 | `#adoption`         | Ecosystem downloads stat card with count-up                | `adoption.css`, `adoption-card.css`, `adoption.js` |
| 6 | `#roadmap`          | Eight milestone cards linking into `roadmap.html`          | `roadmap.css`, `roadmap.js` |
| 7 | `#faq`              | Accordion of common questions                              | `styles.css`, `site.js` |
| 8 | `#why`              | "One contract beats separate tools" comparison tiles       | `styles.css`, `theme.css` |
| 9 | `#newsletter`       | Buttondown sign-up form                                    | `styles.css` |
| – | `#community` CTA + footer | "Build with us" lime band with the community links (Discord, LinkedIn, Instagram, GitHub rows); dark footer with Products / Explore / Community columns, a short company statement with principles as the first column, big centred wordmark and a status bar | `styles.css`, `theme.css`, `footer.css` |

### Updating the Use cases menu

The Use cases dropdown is a single dark “Start here” card, with links to the six
actual demos and `/usecases/`. The old package-category grid and placeholder
“Most asked” links have been removed. `assets/js/usecases-data.js` owns the demo
titles, descriptions and destinations; `assets/js/usecases.js` builds the six
compact links in `[data-uc-most-asked]`. The legacy attribute name remains only
as the shared rendering hook. `packages` maps those actual demo links for
product-page use-case lists and the not-found page. It contains no placeholders.

The card is present across the shared HTML headers, including on mobile.
Styles are scoped to `#mega-usecases` in `assets/css/nav.css`. The Docs menu
retains its own separate links and quickstart card.

### Product pages (`/control-tower/`)

`control-tower/index.html` is the first real product page (served at `/control-tower/`, which the
Products menu links to). It reuses the site header, menus and footer (absolute `/assets/...`
paths because it lives in a folder). Content comes from the Control Tower console prototype.

Sections: hero (pitch, **Open Control Tower ↗** to `https://controltower.deepagentlabs.io`, GitHub,
`pip install`, key facts, simulated live fleet card) · Why it exists · **What it does** (sideways
feature carousel with console close-ups `img/feat-*.webp`) · Two ways to run it (self-hosted / hosted) ·
**Inside the console** (auto-cycling screenshots `img/console-*.webp`) · How it works (real commands) ·
Health states · Part of the ecosystem (loop + catalog versions table) · Status · FAQ · lime CTA band.

- Screenshots: `control-tower/img/*.webp` (cropped from the console, ~40-50 KB each). To update
  one, replace the file with the same name and size ratio.
- Versions in the catalog table and the Status lists are plain HTML: update them with each release.
- Styles: `assets/css/product.css`. Script: `assets/js/product.js` (use cases from
  `usecases-data.js`, scroll reveals, live fleet card, console tabs).

### `404.html` — not found

GitHub Pages serves this for any missing URL. It uses absolute paths (`/assets/...`)
because it can be served from any depth. If the URL starts with a product slug from the
menu (`/agenticlens`, `/mcp/docs`, `/agentic-evals/usecases`, …) it says the page is coming soon and links to that
product's GitHub README and PyPI package; otherwise it shows a plain not-found message.
The product list lives in the small script at the bottom of the file.

### `roadmap.html` — roadmap page

| Section            | What it shows                                                   |
|--------------------|-----------------------------------------------------------------|
| `.rp-hero`         | Headline, intro, buttons, "Step 1 of 8" progress meter           |
| `.rp-ticker`       | Lime strip of all milestones                                     |
| `.rp-why`          | Four "promise" colour tiles                                      |
| `.rp-dark` / `#milestones` | One block per milestone (`#v0-1` … `#v1-0`) with an animated illustration |
| `.rp-gates`        | "What unlocks the next step" cards                               |
| `.cta`             | "Review the spec" band                                           |

The homepage roadmap cards link to these anchors (`roadmap.html#v0-3` etc.).

---

## 3. Stylesheets (`assets/css/`)

Stylesheets are loaded **in this order**. Later files override earlier ones, so the
order matters.

| Order | File                      | Loaded on | Responsibility |
|------:|---------------------------|-----------|----------------|
| 1 | `styles.css`              | both | Base: colour tokens (`--ink`, `--paper`, `--acid`, `--mint`, …), typography, layout shell, hero, loop, FAQ, newsletter, CTA, footer |
| 2 | `architecture.css`        | home | Original capability-map layout (grid, cards, connection lines, details panel) |
| 3 | `enhance.css`             | both | Scroll progress bar, reveal-on-scroll, ticker, background grid, hover effects |
| 4 | `adoption.css`            | home | Adoption section heading and layout |
| 5 | `roadmap.css`             | both | Homepage roadmap cards **and** the whole `roadmap.html` page |
| 6 | `nav.css`                 | both | Mega-menu dropdowns (Products, Docs, Use cases, Platform), Use cases package groups (`.uc-*`), sliding lime pill, mobile menu accordion |
| 7 | `theme.css`               | both | Site-wide look: fonts (Bricolage Grotesque / Inter / Instrument Serif), lime highlight on key words, section labels, dark loop band, "Why us" tiles, ticker colours |
| 8 | `background.css`          | both | Positions the animated background canvas behind content |
| 9 | `copy.css`                | both | Copy-to-clipboard button on install commands |
| 10 | `tools.css`              | home | Tabbed framework showcase (tabs and panels) |
| 11 | `architecture-theme.css` | home | Capability map in the site theme + compact view + "click for details" hints |
| 12 | `adoption-card.css`      | home | Dark downloads stat card |
| 13 | `polish.css`             | all  | Loaded last: extra tokens (`--focus`, `--danger`, `--ease`, `--dur-hover`, `--header-h`), sticky header, one focus style, hover timing (≤ 0.3s, no bounce), 404 layout, reduced-motion overrides |
| 14 | `mobile.css`             | home | Phone layouts (≤ 680px): frameworks accordion, compact adoption rows, two-column roadmap cards, capability map shows a package's capabilities only when selected |
| 15 | `beam.css`               | all  | Border beam: a streak of light that travels around a border (`@property` + conic gradient). Variants: `glow` (lime), `quick`, `ink` (offset ink outline), `hover`, `focus` |
| 16 | `community.css`          | home | "Build with us" band combined with the community links: call to action left, ink link rows right (white on hover); one column under 900px |
| 17 | `footer.css`             | all  | Site footer (`footer.site-footer`): three columns → two on phones, centred wordmark with a slow sheen, "Back to top" |

**Design tokens** (defined in `styles.css` `:root`):

| Token     | Value     | Use |
|-----------|-----------|-----|
| `--ink`   | `#07110e` | Text, dark surfaces |
| `--paper` | `#f2f0e9` | Page background |
| `--acid`  | `#b7f343` | Lime accent (highlights, active states, CTAs) |
| `--mint`  | `#d8f7c0` | Soft lime surfaces |
| `--muted` | `#5f6863` | Secondary text |
| `--line`  | `rgba(7,17,14,.18)` | Hairline borders |

Fonts are loaded from Google Fonts (`@import` at the top of `styles.css` and `theme.css`).

---

## 4. Scripts (`assets/js/`)

Every script is loaded with `defer`, wraps itself in an IIFE, and exits quietly if
the elements it needs are not on the page. That is why the same script can be loaded
on both pages.

| File                      | Loaded on | Responsibility |
|---------------------------|-----------|----------------|
| `site.js`                 | both | Mobile menu toggle, footer year, FAQ accordion |
| `architecture.js`         | home | Builds the capability map from its data, draws connection lines, details panel, Trace request |
| `architecture-compact.js` | home | "Full detail" toggle, "+N more" hints, interactive hint bar, scrolls the details panel into view |
| `enhance.js`              | home | Scroll progress, hero word reveal, hero network canvas, package ticker, reveal-on-scroll, loop step cycling |
| `adoption.js`             | home | Fetches PyPI download counts (Pepy badges, with fallback numbers) and runs the count-up |
| `tools.js`                | home | Framework showcase: tabs on desktop (hover / click / arrow keys, auto-advance); on phones (≤ 680px) it moves each card under its name and works as an accordion |
| `roadmap.js`              | both | Progress bars on both pages; reveal animations on `roadmap.html` |
| `nav.js`                  | both | Mega-menus (hover on desktop, tap on mobile, Esc / outside click), sliding lime pill |
| `usecases-data.js`        | both + 404 | Use cases menu content: packages, use cases, links, "Most asked" chips. Edit this one |
| `usecases.js`             | both | Builds the Use cases dropdown from `usecases-data.js` |
| `product.js`              | product pages | Use cases from `usecases-data.js`, scroll reveals, live example fleet card, console screenshot tabs |

Dropdown arrows (desktop, pure CSS at the end of `nav.css`): Platform, Products, Docs and Use cases show a small chevron after the name so visitors can see they open a menu; it flips while that menu is open. Phones use the +/- boxes instead. Menu order: Platform, Products, Docs, Use cases, then the plain links.
| `background.js`           | both | Slow animated "signals" on the background grid (canvas, paused when tab hidden) |
| `beam.js`                 | all  | Adds the border beam to a short list of elements (hero card, framework showcase, downloads card, milestone in review, menu spec card, 404 card; primary buttons on hover; newsletter form on focus). Ambient beams only run while on screen |
| `copy.js`                 | both | Adds a copy button to every `pip install …` command |

### Data that lives in scripts

- **Capability map content** (components, capabilities, relationships, outputs): `architecture.js` → `DATA`.
- **PyPI packages and fallback download numbers**: `adoption.js` → `packages`.

---

## 5. External services

| Service | Used for | Where |
|---------|----------|-------|
| Google Fonts | DM Mono, Manrope, Bricolage Grotesque, Inter, Instrument Serif | `styles.css`, `theme.css` |
| Pepy (`api.pepy.tech/badge/<package>`) | All-time PyPI download counts | `adoption.js` |
| PyPI (`pypi.org/project/<package>/`) | Package pages linked from the site | `index.html`, `roadmap.html`, `adoption.js` |
| Buttondown | Newsletter sign-up | `index.html` |
| GitHub | Repository links | `index.html`, `roadmap.html` |
| Font Awesome Free 6.5.2 (cdnjs, brand icons, CC BY 4.0) | Discord, LinkedIn, Instagram and GitHub icons | `index.html`, `roadmap.html`, `404.html` |
| Discord, LinkedIn, Instagram | Community links (community section, Platform menu, footer on every page) | `index.html`, `roadmap.html`, `404.html` |

If Pepy cannot be reached, the stat card falls back to the numbers in `adoption.js`.

---

## 6. Behaviour and accessibility rules

- **Reduced motion:** every animation checks `prefers-reduced-motion` and shows the
  final state instead (no count-up, no ticker, no background signals).
- **Keyboard:** menus open with Enter/Space and close with Esc; tool tabs support the
  arrow keys, Home and End; FAQ items are buttons with `aria-expanded`.
- **No hidden content on failure:** reveal animations have a fallback, so content is
  shown even if a script fails.
- **Mobile:** layouts collapse at 900px and 680px; the header becomes a Menu button at 820px.
  Pages must not scroll sideways at 360px.
- **Header:** sticky on every page; `scroll-padding-top` keeps anchor targets below it.
- **Focus:** one visible focus ring (`--focus`) on every link, button and input.
- **Hover:** short (≤ 0.3s), subtle lift, borders and shadows kept intact; no springy bounce.
- **Honest content:** sample output is labelled illustrative; download numbers come from Pepy and say when a snapshot is shown.

---

## Interactive ecosystem use cases

The generic index at `/usecases/` links to `/usecases/1/`
(MCP operations), `/usecases/2/` (replay and optimization), and `/usecases/3/`
(recorded-run evaluation and candidate comparison), plus `/usecases/4/`
(AgenticLens distributed tracing and observability). Directory `index.html` files
support these requested URLs on GitHub Pages, including redirects from paths
without a trailing slash. The pages reuse the site header, footer and brand styles.

- `assets/css/usecase-demos.css`: responsive index cards and walkthrough workspace.
- `assets/js/usecase-demos.js`: local scripted interactions, sample JSON download,
  fault selection, candidate configuration, comparisons, prerequisite checks and reset.
- `assets/js/usecases-data.js`: real featured demo links in the shared Use cases menu.

All content and metrics are fictional; package activity is conceptual. The sample
JSON is explicitly simplified and is not a validated AI Operations Specification
payload. Evaluation of stored evidence and replay of a new candidate execution
are separate operations. Nothing sends API requests or modifies production.

Browser verification: serve the repository with `python3 -m http.server 8793`,
then run `node scripts/check_usecase_demos.cjs` with Playwright installed.
The script checks all routes and interactions at 360, 768 and 1440 pixels.

### AgenticLens observability concept dashboard

`usecases/4/index.html` reuses the website shell and loads scoped
`assets/css/lens-demo.css` and `assets/js/lens-demo.js`. The index includes its
fourth card; the AgenticLens menu links directly to this dashboard.

The browser-local dataset has six traces across two fictional versions. All
filter-dependent metric cards derive from that dataset, including nearest-rank
p95 and the proportion of traces containing an error span. Recovered traces keep
their original error spans. Run comparisons use a separately labeled fixed cohort
of all six traces. No statistical significance is claimed for scripted samples.

Only model-call leaves own tokens and estimated cost. Parent subtree metrics
include descendants without adding them again to run totals. Cost uses explicitly
fictional per-model input/output rates. Tools have no LLM token usage in this
sample. A selected trace exports as simplified demo JSON, not validated OTLP or
AI Operations Specification output. Captured content is fictional and redacted.

The distributed call graph, span inspector, topology, token attribution, diagnostics and
comparison illustrate capabilities checked against the local AgenticLens README.
No external observability service, live collector or backend is connected.

Run `node scripts/check_lens_demo.cjs` with Playwright and the preview server.
`USECASE_PREVIEW_URL` overrides the default `http://127.0.0.1:8793`.
Checks cover span drilldown, token aggregation, filters, empty states, diagnostic
evidence, candidate comparisons, JSON downloads, keyboard tabs and mobile widths.

The distributed trace view now renders a semantic nested call graph instead of
horizontal timing bars. Edges follow each span's `parent` field. Agent 1 branches
to MCP (with a child tool call), an external CRM API, a vector database, a triage
subagent (web search, model and memory) and an order subagent. The order subagent
itself delegates to a resolution subagent with retrieval, model and memory spans.
Selecting any node updates the inspector; tabbing and keyboard activation work.
The graph scrolls within its panel on small screens. Parent durations contain
child spans, and token totals continue to count model leaves once.

### AgenticOps loop diagram (use case 03)

Below the evaluation walkthrough, `ops-loop.css` and `ops-loop.js` render the
supplied loop as HTML stage buttons with inline SVG connectors, not a raster
image. It includes capture, standardization, recording, replay, separate Chaos
and Evals branches into analysis, optimization, validation, deployment and the
return path to production. Selecting a stage updates its live explanation.
Below 1000px, the semantic ordered stages become a readable vertical flow; a plus
sign groups Chaos and Evals as the two checks feeding analysis. No-JavaScript
viewers retain the full diagram and labels. Run `check_ops_loop.cjs` with
Playwright and a preview server to verify stage activation and responsive layout.

The loop presentation adds inline stage icons, gradient cards, a dotted canvas,
a central progress ring, animated connector packets and Play/Pause, Next stage
and Restart controls. Ten playback phases group Chaos and Evals as parallel
checks. Clicking either branch pauses playback and shows its individual detail.
Playback begins only while the diagram is visible, pauses its timer and animation
when out of view or the document is hidden, and defaults off for reduced motion.
Autoplay updates do not trigger live-region announcements or move keyboard focus.
Tests also cover timed advancement, pausing and reduced-motion behavior.

### Passive Sidecar supervision loop (use case 05)

`usecases/5/index.html` loads `sidecar-loop.css` and `sidecar-loop.js` for an
automatically animated concept diagram based on the supplied guardrails/context
reference. This replaces the removed interactive incident concept; no visitor
action controls or human decision buttons are present.

Four fictional proposals cycle through external CRM, MCP, vector retrieval and
a critical refund tool. Critical actions repeat eight one-second phases: propose, guardrails,
intent/context, self-critique, scripted human review, execute, result and context
re-injection. Read-only API, MCP and vector queries skip the human-approval phase and show
“not required”; they execute after automated guardrails, context and critique.
The critical $25 refund additionally requires scripted human approval before
its dependency can highlight as executing. Actual policy can differ. Nothing executes outside
the browser. Timers pause offscreen and in hidden documents. Reduced motion uses
a static overview and disables automatic stage changes and animation.

`check_sidecar_loop.cjs` checks passive markup and mobile/tablet/desktop layout,
then advances a controlled browser clock through all four call cycles to verify
the gate sequence, context reset and reduced-motion pause.

The Sidecar simulation places the four compact supervision cards and execution
gate inside an enlarged Support agent boundary. Outbound dependencies remain
outside that boundary; the existing animation order and approvals are unchanged.

The Sidecar loop now uses the AgentHealth reference's dotted SVG probe wires:
measured curves connect the agent to internal checks and the gate to outbound
dependencies. A pulse travels out and back during a check, a spinner marks the
pending response, and a tick appears on completion. Skipped approval stays dashed
with a dash rather than a tick. ResizeObserver redraws connections after layout
changes, including mobile. Existing critical-action gating remains unchanged.

### Control Tower fleet operations (use case 06)

`usecases/6/index.html` loads scoped `tower-demo.css` and `tower-demo.js`. Eight
fictional deployments represent Incident Response, Deployment, Security Triage
and Cost Optimization agents across production, staging and development.
Environment/team/search filters update both the table and its metric cards.
Selected-agent profiles expose version, owner, capabilities, reported health,
evidence freshness and native Lens/Evals/Sidecar outcomes as separate signals.

The conceptual action-review flow supports approve, reject, request changes,
revision and a separate simulated execution. Revisions require new approval;
approval never automatically executes a command. A scoped emergency confirmation
pauses either all new work for the selected agent or only its production actions.
Production-only hold retains read-only investigation. Nonproduction agents do not
show the production-only choice. Holds prevent approvals/execution; resuming
clears only that hold without changing native evidence or declaring recovery.
Operator decisions are recorded per agent and reset with the demo/page reload.

These controls are explicitly conceptual, not live features of the current
read-only Control Tower console or proof of production runtime adapters.
`check_tower_demo.cjs` verifies filtering, evidence, approval decisions/revisions,
agent-vs-production holds, scope isolation, resume, keyboard tabs and layouts.

The expanded Control Tower use case presents OPERATE as discovery, monitoring,
configuration visibility and unified cross-environment operations. Two scenario
entry points lead to the incident profile. MCP + Copilot correlates a fictional
Lens trace, a 5000→300 ms timeout configuration diff, a repeated-retry prompt and
1200 ms dependency p95 to explain the predefined failure. Evidence references
remain visible; the diagnosis is fixture-specific, not an arbitrary live RCA.

Diagnosis enables a recommended RB-017 rollback runbook. The operator reviews
and approves the exact revision before remediation can execute. Verification is
separate and offers successful or failed service-probe outcomes alongside a fresh
simulated Lens run and same-run Evals gate. Only all-passing recovery evidence
resolves the incident; historical failures stay in the evidence view.

Emergency containment separately exposes runtime stop, new tool-call blocking
and optional scoped credential revocation. The call-gate probe never executes a
tool. Resume does not restore revoked credentials; explicit access restoration
does not clear a runtime hold or approve a change. Revoking access invalidates
unexecuted approvals. Emergency scope affects only the selected agent, and the
UI states that in-flight remote calls are not guaranteed cancelled. Duplicate
execution of an approved revision is blocked. All adapters, telemetry, AI and
credential effects remain browser-local simulations.
