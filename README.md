# SNS-HUB — Convenience Discovery Hub

**「こんな便利なものがあるんだ」を見つける。**

SNS-HUB is the durable public discovery layer paired with `sunpotflower4460-cpu/SNS-AI`.

- **SNS-AI owns:** discovery, verification, editorial scoring/selection, affiliate-provider integration, social publishing.
- **SNS-HUB owns:** stable public pages, problem-first navigation, search, safe route presentation, freshness, content readiness, analytics, and social backlinks.
- **Invariant:** a Hub-dependent social CTA must not publish until the expected Hub `contentVersion` is publicly visible.

## Repository-side MVP

This repository intentionally starts with **sample data only** and contains no live affiliate credentials.

Implemented:

- Next.js 16 + TypeScript mobile-first UI
- 10 representative sample products under `data/products/<productId>.json`
- stable `/p/[slug]` pages plus `/problem/[slug]`, `/category/[slug]`, `/new`, `/search`
- dedicated `/disclosure` affiliate/editorial disclosure page
- discontinued-product history behavior and verified alternatives
- `ready` products are directly reachable for Hub readiness checks but remain unfeatured and `noindex` until a social publish succeeds
- first successful X / Instagram backlink transitions `ready → published`, records `firstPublishedAt`, and prevents later accidental status downgrade
- X / Instagram publish states remain separate so a failed leg can retry without recreating the Hub item
- multiple route model with stale/inactive/non-Hub route suppression
- canonical route snapshots are authoritative so removed purchase routes do not survive accidentally
- exact-price freshness guard and future-verification protection
- product JSON Schema + taxonomy/cross-reference/duplicate/publication-lifecycle validation
- stable `productId` + stable public `slug` enforcement
- deterministic canonical `contentVersion` covering products and taxonomies
- versioned content-manifest JSON Schema
- `/_health/content-version` and `/_health/product/<productId>` readiness probes
- idempotent product upsert and true no-op social-backlink replay
- historical social backlinks preserved across canonical editorial refreshes
- privacy-conscious page/navigation/route/return/alternative analytics without a persistent visitor ID or revenue-ranking field
- DNT/GPC-aware analytics and query-string exclusion from analytics payloads
- offline public-link integrity checks that make **zero external affiliate requests**
- route-click logging with HEAD-safe redirect endpoints and crawler exclusions
- source secret scan plus streaming post-build `.next` scan, including large bundles/source maps
- explicit output-file tracing for `data/**/*.json` and `schemas/**/*.json`
- local CI gate that does not depend on GitHub Actions

## Quick start

```bash
npm install
npm run ci
npm run dev
```

Individual safety checks:

```bash
npm run validate:data
npm run links:check-safe
npm test
npm run report:freshness
npm run security:scan
```

Analytics log exports can be summarized with:

```bash
npm run analytics:report -- ./hub-events.log
```

## SNS-AI staging flow

```text
SNS-AI selects + verifies product
→ writes canonical product JSON as publication.status=ready
→ Hub validates/builds/deploys
→ SNS-AI checks /_health/content-version + product publishReady
→ expected version matches = HUB_READY
→ item is directly reachable but not featured/indexed yet
→ X / Instagram publish
→ first successful social backlink changes ready → published
→ item becomes visible in Home / New / Search / category / problem discovery
→ failed social legs can be retried independently without duplicating successful ones
```

Key docs:

- `docs/SNS_AI_WRITE_CONTRACT.md` — integration contract
- `docs/OPERATIONS.md` — freshness, links, rollback, per-platform state
- `docs/ANALYTICS.md` — privacy-conscious event model
- `docs/ACCEPTANCE_MATRIX.md` — handoff requirement coverage
- `docs/RELEASE_CHECKLIST.md` — final real-build/mobile gates before merge

## Safety rules

- commission is not part of editorial ranking, route ordering, or Hub analytics summaries
- inactive, stale, mismatched, or non-Hub routes are not presented as healthy
- exact price is hidden unless recently verified
- discontinued products keep their stable historical page but do not keep current purchase CTAs
- a different product is never silently substituted
- health checks never auto-click affiliate tracking destinations
- purchase-route redirects are not used for automated readiness probes
- high-confidence secret query parameters, private/local hosts, and embedded URL credentials fail offline link validation
- secrets belong in external secret managers, never repository content

## Validation status

The included 10 fixtures were checked against the product schema, taxonomy/alternative references, publication lifecycle invariants, and offline URL safety rules. Additional hardening has been exercised with dependency-free lifecycle/analytics/link tests and the source secret scanner; the large-file scanner was also tested against a generated file larger than 5 MB with a secret pattern placed near its end.

The current agent execution environment cannot reach the npm registry, so dependency installation and the **real-dependency** `npm run ci` / production `next build` still must run in a network-enabled local or deployment environment before this PR is merged. `scripts/local-ci.sh` is the release gate and finishes by scanning generated `.next` output for high-confidence secret patterns.
