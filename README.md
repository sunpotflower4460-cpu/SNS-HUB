# SNS-HUB — Convenience Discovery Hub

**「こんな便利なものがあるんだ」を見つける。**

SNS-HUB is the durable public discovery layer paired with `sunpotflower4460-cpu/SNS-AI`.

- **SNS-AI owns:** discovery, verification, editorial scoring/selection, affiliate-provider integration, social publishing.
- **SNS-HUB owns:** stable public pages, problem-first navigation, search, safe route presentation, freshness, content readiness, and social backlinks.
- **Invariant:** a Hub-dependent social CTA must not publish until the expected Hub `contentVersion` is publicly visible.

## Repository-side MVP

This repository intentionally starts with **sample data only** and contains no live affiliate credentials.

Implemented:

- Next.js 16 + TypeScript mobile-first UI
- 10 representative sample products under `data/products/<productId>.json`
- stable `/p/[slug]` pages plus `/problem/[slug]`, `/category/[slug]`, `/new`, `/search`
- discontinued-product history behavior and verified alternatives
- multiple route model with stale/inactive route suppression
- exact-price freshness guard
- JSON Schema + cross-reference validation
- deterministic canonical `contentVersion`
- `/_health/content-version` and `/_health/product/<productId>` readiness probes
- idempotent product upsert and social-backlink attachment
- privacy-conscious route-click server logging
- local CI gate that does not depend on GitHub Actions

## Quick start

```bash
npm install
npm run ci
npm run dev
```

## SNS-AI staging flow

```text
SNS-AI selects + verifies product
→ writes canonical product JSON
→ Hub validates/builds/deploys
→ SNS-AI checks /_health/content-version
→ expected version matches = HUB_READY
→ X / Instagram publish
→ social backlinks attached idempotently
```

See `docs/SNS_AI_WRITE_CONTRACT.md` and `docs/OPERATIONS.md`.

## Safety rules

- commission is not part of editorial ranking or route ordering
- inactive or stale routes are not presented as healthy
- exact price is hidden unless recently verified
- discontinued products keep their stable historical page
- a different product is never silently substituted
- health checks never auto-click affiliate tracking destinations
- secrets belong in external secret managers, never repository content

## Validation status

The included 10 fixtures were checked against the product schema and taxonomy references before the initial implementation commit. The current agent environment cannot reach the npm registry, so dependency installation / full `next build` must be run in a network-enabled local or deployment environment before merge to production.
