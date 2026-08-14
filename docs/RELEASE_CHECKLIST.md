# Release checklist

Use this checklist when a network-enabled machine is available. Do not mark PR #1 ready for review solely from source-level checks.

## 1. Clean dependency install

```bash
node --version
npm --version
npm install
```

Node must satisfy `package.json` engines (`>=22`). If a lockfile is introduced, prefer the matching reproducible install command for later releases.

## 2. Full local gate

```bash
npm run ci
```

This must pass secret scan → data/manifest validation → offline safe-link integrity → unit tests → typecheck → lint → production build → generated `.next` secret scan.

## 3. Runtime smoke

```bash
npm run start
```

Check at minimum:

- `/`
- `/new`
- `/search`
- one `/problem/<slug>`
- one `/category/<slug>`
- one `/p/<slug>`
- `/disclosure`
- `/_health/content-version`
- one `/_health/product/<productId>`

Do not use automated probes against `/go/...` conversion routes. HEAD is available only for internal route presence checks and does not redirect.

## 4. Mobile visual smoke

Inspect representative widths (320px, 390px, 768px). Confirm navigation does not overflow, Japanese text wraps cleanly, cards and CTAs remain tappable, and historical/empty states are understandable.

## 5. Hub-first deploy verification

After deployment, read `/_health/content-version` and compare it to the expected local `npm run content:manifest` value. For a staged item, check `/_health/product/<productId>` and require `publishReady=true` before SNS publishing. Attach X/Instagram backlinks only after each platform actually succeeds.

## 6. PR transition

Only after all above gates pass should PR #1 move from Draft to Ready for review/merge.
