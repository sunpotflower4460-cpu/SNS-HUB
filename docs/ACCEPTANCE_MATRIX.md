# Acceptance matrix

This matrix maps the handoff acceptance requirements to repository checks. A green source-level check is not a substitute for the real dependency production build gate.

## Automated in the repository

### Data contract and lifecycle

- duplicate `productId`, public slug, route identity and social backlink validation
- malformed product JSON / JSON Schema rejection
- exact price requires verification time and stale price is hidden
- category, problem and alternative cross-references are validated
- ACTIVE routes require exact-product match and a valid HTTPS destination
- future-dated verification/publication data is rejected or treated as unknown
- canonical replay is idempotent; stable public slug cannot silently change
- canonical route snapshots are authoritative, while historical social backlinks are retained
- content manifest has a versioned JSON Schema and deterministic `contentVersion`

### Public pages and discovery

- archived/discontinued records keep their stable direct page but are removed from discovery
- Hub-ready (`ready`) items are directly reachable but not featured before social publication
- Home/New/Search/category/problem discovery only uses published, currently discoverable items
- Japanese problem search has regression coverage
- empty result states are implemented
- verified alternatives resolve only to currently discoverable records

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

- source secret scan is part of local CI
- generated `.next` output is scanned again after production build
- analytics accepts a fixed sanitized event schema and rejects query strings so search text is not collected
- no persistent visitor identifier is generated; return visits use only local boolean state
- DNT/GPC disables client analytics

## Must still pass before merge

These checks require a network-enabled environment with the real npm dependency graph and/or a real browser. Keep the PR in draft until all are green.

- install the locked/declared npm dependency graph successfully
- run the complete `npm run ci` using real `next`, `react`, TypeScript, ESLint, AJV and `tsx`
- complete a production `next build`
- run the post-build secret scan against the actual `.next` bundles and source maps
- launch the production/dev app and smoke-test Home, product, problem, category, search, disclosure and health routes
- mobile visual smoke at representative widths such as 320px, 390px and 768px, including long Japanese text, navigation, CTA layout and empty states
- verify the deployed public `contentVersion` equals the expected commit content before enabling Hub-dependent SNS publication

## Explicitly not automated here

- live probing of affiliate conversion/tracking URLs (avoids false conversions and provider-policy risk)
- affiliate commission → editorial ranking feedback (forbidden by design)
- provider secrets or live social account activation (external secret/configuration responsibility)
