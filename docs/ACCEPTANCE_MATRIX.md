# Acceptance matrix

This matrix maps the handoff acceptance requirements to repository checks and real pull-request runtime verification.

## Automated and verified

### Data contract and lifecycle

- duplicate `productId`, public slug, route identity and social backlink validation
- malformed product JSON / JSON Schema rejection
- exact price requires verification time and stale price is hidden
- category, problem and alternative cross-references are validated
- ACTIVE routes require exact-product match and a valid HTTPS destination
- future-dated verification/publication data is rejected or treated as unknown
- canonical replay is idempotent; stable public slug cannot silently change
- canonical route snapshots are authoritative, while historical social backlinks are retained
- publication state cannot silently regress from `published` back to `ready`; first social success records `firstPublishedAt`
- stored `published` / `archived` records require `firstPublishedAt`, while `staged` / `ready` records cannot contain published social backlinks
- content manifest has a versioned JSON Schema and deterministic `contentVersion`

### Public pages and discovery

- archived/discontinued records keep their stable direct page but are removed from discovery
- Hub-ready (`ready`) items are directly reachable but not featured before social publication
- Home/New/Search/category/problem discovery only uses published, currently discoverable items
- Japanese problem search has regression coverage
- empty result states are implemented
- verified alternatives resolve only to currently discoverable records
- the production Next.js build exposes `/_health/content-version` and `/_health/product/<productId>` using the escaped `%5Fhealth` App Router directory while preserving the required public underscore URL

### Affiliate safety

- multiple healthy providers may coexist
- commission is absent from editorial scoring and analytics summaries
- stale, inactive, mismatched, non-Hub and unavailable routes are suppressed
- affiliate disclosure is derived from visible affiliate routes and `/disclosure` documents policy
- offline safe-link integrity performs zero external requests and rejects private hosts, embedded credentials and high-confidence secret query parameters
- `/go/...` HEAD never redirects or logs a click; DNT/GPC suppresses GET click analytics

### Hub-first SNS integration

- health endpoints expose `contentVersion`, stable public URL and publish readiness
- `staged` products reject published social backlinks
- first successful social backlink transitions `ready` to `published`
- X and Instagram states are recorded separately; one successful leg is retained while the other retries
- replaying the same social result is a true no-op

### Privacy and security

- source secret scan is part of CI
- generated `.next` output is scanned again after production build
- analytics accepts a fixed sanitized event schema and rejects query strings so search text is not collected
- no persistent visitor identifier is generated; return visits use only local boolean state
- DNT/GPC disables client analytics

### Real dependency/build/runtime verification

Pull-request CI has successfully completed all of the following with Node 22 and the declared real npm dependencies:

- dependency installation
- complete `npm run ci`
- production `next build`
- post-build secret scan against actual `.next` output
- runtime HTTP smoke of Home, New, Search, problem, category, product, disclosure, content-version health, and product health
- headless Chrome rendering at 320px, 390px and 768px after installing Noto CJK
- manual review of the generated Home/product screenshots for Japanese wrapping, navigation/CTA visibility, card layout, and horizontal overflow

No layout-breaking overflow or clipping was observed in the reviewed screenshots.

## Remaining external activation gate

Repository/build/browser acceptance is green. Before Hub-dependent live SNS publication is enabled, the deployed production service must still satisfy:

- an HTTPS public origin for this server-rendered Next.js application
- public `/_health/content-version` equals the expected Git-backed `contentVersion`
- public `/_health/product/<productId>` reports `publishReady=true` for the staged item
- the SNS-AI deployment is configured with the same Hub origin and a narrowly scoped Hub repository credential

Keep live Hub-dependent publishing disabled until these deployment/configuration checks are green.

## Explicitly not automated here

- live probing of affiliate conversion/tracking URLs (avoids false conversions and provider-policy risk)
- affiliate commission → editorial ranking feedback (forbidden by design)
- provider secrets or live social account activation (external secret/configuration responsibility)
