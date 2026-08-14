# SNS-AI → SNS-HUB Write Contract

## Boundary

SNS-AI decides **what deserves to be featured**. SNS-HUB stores, validates, renders, searches, and keeps that canonical item reachable.

## Git-backed MVP sequence

1. SNS-AI completes discovery, verification, editorial scoring and route resolution.
2. Build one canonical record matching `schemas/product.schema.json`.
3. Upsert `data/products/<productId>.json` using stable `productId` and stable `slug`.
4. Run the full `npm run ci` repository gate.
5. Commit/push the Hub change.
6. Deployment builds the same content and exposes `/_health/content-version`.
7. SNS-AI polls the **normal Hub health URL**, never affiliate tracking URLs.
8. Only when the expected `contentVersion` is visible is the item `HUB_READY`.
9. Publish X and/or Instagram.
10. Attach social post IDs with `npm run hub:attach-social -- <productId> <x|instagram> <postId> <url> [publishedAt]`; replaying the same post is a true no-op.

## Canonical upsert semantics

A product upsert is a **full current canonical product snapshot**, not a partial route patch.

- `productId` and public `slug` are permanent identity fields once a product exists.
- the incoming `routes` array is authoritative; a route omitted from a later canonical snapshot is removed from the Hub instead of being silently preserved
- routes that remain use stable `routeId` values
- historical social backlinks are retained across canonical product upserts so an editorial refresh cannot erase already-published X / Instagram history
- social backlink changes should normally use the dedicated `hub:attach-social` operation
- `firstPublishedAt` is preserved once established

This asymmetry is intentional: purchase routes represent **current actionable state**, while social backlinks represent **historical publication state**.

## Idempotency

Canonical operation key:

```text
<productId>:<contentVersion>:<operation>
```

- product identity is stable by `productId`
- public URL identity is stable by `slug`
- route identity is stable by `routeId`
- social backlink identity is `platform + postId`
- replay replaces the same identity rather than appending duplicates
- replaying an unchanged social backlink does not mutate `updatedAt` or `contentVersion`

## Do not do

- do not write provider secrets into product JSON
- do not rank routes/products by commission
- do not swap an unavailable product for a different product under the same URL
- do not change the slug of an existing product
- do not treat a missing current route as permission to preserve an old ACTIVE route
- do not publish Hub-dependent CTA before expected contentVersion is deployed
- do not probe affiliate tracking links to decide readiness

## Required external setup later

Only after repository-side tests are green:

- choose Git-connected hosting
- configure the public Hub URL at deployment time
- create a narrowly scoped credential for SNS-AI → SNS-HUB repository writes
- store credentials only in approved secret managers
