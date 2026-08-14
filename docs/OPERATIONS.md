# Operations

## Local release gate

Run:

```bash
npm install
npm run ci
```

The build is not considered ready when secret scanning, data validation, offline public-link integrity, unit tests, typecheck, lint, production build, or post-build secret scanning fails.

## Freshness

- exact price display window: 7 days
- ACTIVE route freshness window: 30 days
- product stale indicator: 45 days

Use `npm run report:freshness`.

A stale route is not auto-clicked. Provider/API health and normal merchant destination checks should be implemented upstream in SNS-AI.

## Safe link integrity

Run `npm run links:check-safe`. This check performs **zero external HTTP requests**. It validates public URLs for HTTPS, embedded credentials, private/local hosts, and high-confidence secret query parameters. Ordinary public affiliate tracking parameters such as `tag`, `aff_id`, and UTM parameters are not rejected merely because they are tracking parameters.

Do not replace this with automated requests against affiliate conversion/tracking links. Live provider health belongs upstream through approved provider APIs or non-conversion merchant checks where terms allow it.

## Per-platform publication state

`/_health/product/<productId>` returns `socialPublished.x` and `socialPublished.instagram`. A successful platform remains recorded while the failed leg can be retried later. The first successful social backlink transitions a Hub-ready item to `published`; the missing platform remains `false` until its backlink is attached.

## Discontinued products

Keep the stable product page. Remove current purchase CTA. Show a verified `current-alternative` relation only when explicitly stored.

## Rollback

Because canonical content is Git-backed:

1. revert the bad Hub commit
2. redeploy
3. confirm the health endpoint exposes the rollback contentVersion
4. only then resume Hub-dependent social publication
