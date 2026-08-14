# Privacy-conscious analytics

Phase 6 analytics measures whether the Hub helps people discover useful solutions. It is deliberately separate from editorial scoring and affiliate commission.

## Events

- `page_view` — pathname only; query strings are rejected
- `navigation` — problem/category ID
- `route_click` — canonical product ID + route ID, recorded by the redirect handler
- `alternative_click` — stable source product slug + target product slug

## Return visits without a visitor ID

The browser stores only two booleans: whether this browser has visited before and whether the current browser session has already been seen. No random/stable visitor identifier is created or transmitted. The event contains only `first`, `returning`, `same-session`, or `unknown`.

If Do Not Track (`DNT=1`) or Global Privacy Control is enabled, client analytics does not run and the return-visit booleans are not written. The `/go/...` route also suppresses route-click analytics when the corresponding DNT or Sec-GPC request header is present.

## Data minimization

The event endpoint sanitizes to the fixed event schema. It does not intentionally record IP address, User-Agent, external referrer, email, account ID, search query, affiliate commission, or provider credentials in the event JSON. Runtime infrastructure may produce its own access logs; configure hosting retention separately.

`/_events` accepts small same-origin JSON events and writes one `hub_analytics {...}` line to runtime stdout. These events are operational signals, not a trusted security/audit channel.

## Reporting

Export runtime log lines and run:

```bash
npm run analytics:report -- ./hub-events.log
```

The report counts page views, first/return visits, problem/category navigation, route clicks, and alternative clicks. It intentionally has no revenue-ranking output. Commercial reporting may join route-click data elsewhere, but must not feed affiliate commission back into editorial product ranking.
