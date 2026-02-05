# Upsell Funnel Builder

Drag-and-drop visual editor for building funnel flows: sales page, checkout, upsells, downsells, thank you. No real pages—just the builder. Deploy anywhere (Vercel, Netlify, etc.) and share the URL for a public demo.

## Run it

```bash
npm install
npm run dev
```

Open the URL (e.g. http://localhost:8080). Production build: `npm run build`.

## How it’s built

**Structure** — Funnel UI lives in `src/components/funnel/` (Canvas, Step, Toolbar, Palette). One hook, `useFunnel` in `src/hooks/useFunnel.ts`, owns nodes and edges, localStorage persistence, and validation. Types and node config live in `src/types/funnel.ts`. The canvas and graph behaviour come from React Flow; styling is Tailwind and a few custom classes. No global state library.

**Adding and connecting** — You drag step types from the left palette onto the canvas. Connect by dragging from a node’s bottom handle to another, or by dropping a node on top of another. Wrong connection? Click the line and press Delete, or drag the end of the edge to another step to reconnect. Export/Import dump the funnel to JSON so you can save or share it.

**Funnel rules** — Thank You steps can’t have outgoing connections. Sales Page is expected to have exactly one outgoing connection; we show a warning if it has none or more than one. Upsell and Downsell labels auto-increment (Upsell 1, Upsell 2, …). Orphan nodes and these rule breaks show up in the toolbar validation count.

## Accessibility

Interactive elements are focusable and use visible focus styles. Nodes and key controls have `aria-label`s. The toolbar validation is exposed so screen readers can hear issue counts. Keyboard: Backspace/Delete removes selected nodes or edges; Shift for multi-select. We kept contrast and touch targets in mind so the builder is usable without a mouse where it makes sense.

## Tradeoffs and what I’d do next

No README bloat: this doc is the single place for setup, architecture, and a11y. Undo/redo and snap-to-grid weren’t built; both would be high on the list for a next pass. Node titles are auto-generated (no inline edit modal). If the project grew, I’d add a proper validation drawer and maybe node templates (pre-built funnel patterns). The code is structured so another dev can extend the funnel rules or add new node types without digging through spaghetti.
