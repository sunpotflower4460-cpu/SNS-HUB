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
- dedicated `/disclosure` affiliate/editorial disclosure page
- discontinued-product history behavior and verified alternatives
- `ready` products are directly reachable for Hub readiness checks but remain unfeatured until a social publish succeeds
- first successful X / Instagram backlink transitions `ready → published`; failed social publication therefore leaves the prepared Hub item unfeatured
- multiple route model with stale/inactive/non-Hub route suppression
- canonical route snapshots are authoritative so removed purchase routes do not survive accidentally
- exact-price freshness guard and future-verification protection
- JSON Schema + taxonomy/cross-reference/duplicate validation
- stable `productId` + stable public `slug` enforcement
- deterministic canonical `contentVersion` covering products and taxonomies
- `/_health/content-version` and `/_health/product/<productId>` readiness probes
- idempotent product upsert and true no-op social-backlink replay
- historical social backlinks preserved across canonical editorial refreshes
- privacy-conscious route-click logging with HEAD-safe redirect endpoints and crawler exclusions
- source secret scan plus post-build `.next` secret scan
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
npm test
npm run report:freshness
npm run security:scan
```

## SNS-AI staging flow

```text
SNS-AI selects + verifies product
→ writes canonical product JSON as publication.status=ready
→ Hub validates/builds/deploys
→ SNS-AI checks /_health/content-version + product publishReady
→ expected version matches = HUB_READY
→ item is directly reachable but not featured yet
→ X / Instagram publish
→ first successful social backlink changes ready → published
→ item becomes visible in Home / New / Search / category / problem discovery
→ failed social legs can be retried independently without duplicating successful ones
```

See `docs/SNS_AI_WRITE_CONTRACT.md` and `docs/OPERATIONS.md`.

## Safety rules

- commission is not part of editorial ranking or route ordering
- inactive, stale, mismatched, or non-Hub routes are not presented as healthy
- exact price is hidden unless recently verified
- discontinued products keep their stable historical page
- a different product is never silently substituted
- health checks never auto-click affiliate tracking destinations
- purchase-route redirects are not used for automated readiness probes
- secrets belong in external secret managers, never repository content

## Validation status

The included 10 fixtures were checked against the product schema and taxonomy references before the initial implementation commit. Subsequent hardening was also checked with dependency-free logic tests, TypeScript syntax/type-oriented checks in the available local toolchain, and the source secret scanner.

The current agent execution environment cannot reach the npm registry, so dependency installation and the **real-dependency** `npm run ci` / production `next build` still must run in a network-enabled local or deployment environment before this PR is merged. `scripts/local-ci.sh` is the release gate and finishes by scanning generated `.next` output for high-confidence secret patterns.
