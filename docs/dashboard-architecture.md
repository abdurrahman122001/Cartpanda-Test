# Dashboard architecture (Part 2)

How I’d structure a modern admin dashboard for funnels, orders, customers, subscriptions, analytics, disputes, settings—so it stays fast, stays consistent, and doesn’t turn into a big rewrite. Also keeping it accessible and something a team can work on in parallel.

**Structure**

I’d put each area (funnels, orders, customers, analytics, etc.) in its own feature folder. Each feature owns its routes, pages, components, hooks, and API layer. Nothing in “funnels” imports directly from “orders”; they go through a shared layer or events. That keeps boundaries clear. Routes and heavy screens I’d lazy-load so the initial bundle stays small.

**UI and design**

I wouldn’t build a component library from scratch. I’d use something like Radix + a shadcn-style setup so we get accessibility and theming without maintaining every primitive. Design tokens in CSS variables, Tailwind wired to those tokens, and something like CVA for component variants. Storybook to document components and catch visual regressions. ESLint to push people toward the design system instead of one-off styles.

**Data and state**

Server state (API data) I’d put in TanStack Query. Client/UI state (filters, modals, sidebar open/closed) in Zustand or React context, depending on scope. Loading: skeletons. Errors: boundaries with retry. Empty states: simple copy and a CTA. For tables with filters and pagination, I’d keep filter state in the URL where it makes sense so links are shareable and back button works.

**Performance**

Code-split by route and by feature. Heavy stuff (charts, rich editors) load on demand. Long lists: virtualize (e.g. TanStack Virtual). useMemo/useCallback only where the profiler says so. To know if the dashboard “feels slow” I’d rely on Core Web Vitals, maybe a custom “time to interactive” for key flows, and something like Sentry for real-user monitoring. React DevTools Profiler when debugging render cost.

**Getting the team on the same page**

README that explains the folder structure and where things live. Short ADRs for bigger decisions so the “why” is written down. Lint + Prettier (and Husky + lint-staged) so formatting and basic rules are automatic. PR template that nags for tests and a11y where it matters. Storybook as the place to check “does this component exist and what does it look like?” so we don’t duplicate. I’d avoid one-off UI by convention and a bit of ESLint (e.g. prefer design-system components over raw elements where they exist).

**Testing**

Unit tests for utilities and hooks. Integration tests (e.g. Testing Library + MSW) for flows that touch the API. E2E (e.g. Playwright) for a few critical paths—login, one main dashboard flow, maybe checkout. I’d rather have less coverage and focus on behaviour that actually breaks than chase a number.

**Releases and safety**

Feature flags (LaunchDarkly or similar) so we can ship behind a flag and turn it off if needed. Roll out in stages: internal, then a small canary, then ramp. Sentry (or similar) for errors and source maps. CI that runs types, lint, and tests; preview deploys per PR so we can click through before merge. The idea is: ship often, but with a clear rollback and the ability to kill a feature without reverting a whole release.

**In short**

Keep clear boundaries by domain, one design system, start simple and add structure when we need it, and use tooling to enforce quality instead of hoping everyone remembers. That way the dashboard can grow from a small team to a larger one without a rewrite, and new people can find their way around from the README and the code layout.
