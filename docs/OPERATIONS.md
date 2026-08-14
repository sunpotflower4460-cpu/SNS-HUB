# Operations

## Local release gate

Run:

```bash
npm install
npm run ci
```

The build is not considered ready when data validation, unit tests, typecheck, lint, or production build fails.

## Freshness

- exact price display window: 7 days
- ACTIVE route freshness window: 30 days
- product stale indicator: 45 days

Use `npm run report:freshness`.

A stale route is not auto-clicked. Provider/API health and normal merchant destination checks should be implemented upstream in SNS-AI.

## Discontinued products

Keep the stable product page. Remove current purchase CTA. Show a verified `current-alternative` relation only when explicitly stored.

## Rollback

Because canonical content is Git-backed:

1. revert the bad Hub commit
2. redeploy
3. confirm the health endpoint exposes the rollback contentVersion
4. only then resume Hub-dependent social publication
