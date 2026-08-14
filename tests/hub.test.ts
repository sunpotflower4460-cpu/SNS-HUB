import assert from "node:assert/strict";import test from "node:test";import {contentVersion,healthyRoutes,mergeCanonical,products,search,visiblePrice} from "../lib/hub";
test("10 representative fixtures exist",()=>assert.equal(products().length,10));
test("Japanese problem search works",()=>assert.ok(search("ケーブル").some(p=>p.productId==="sample-magnetic-cable-dock")));
test("contentVersion is deterministic",()=>assert.equal(contentVersion(),contentVersion()));
test("route replay is idempotent",()=>{const p=products()[0],m=mergeCanonical(p,{...p});assert.equal(m.routes.length,p.routes.length)});
test("inactive route is hidden",()=>{const p=structuredClone(products().find(x=>x.routes.length)!);p.routes[0].status="REVERIFY_DUE";assert.equal(healthyRoutes(p,new Date("2026-08-14T12:00:00Z")).length,0)});
test("stale exact price is hidden",()=>{const p=structuredClone(products()[0]);p.pricing={display:"¥1,000",currency:"JPY",verifiedAt:"2026-07-01T00:00:00Z"};assert.equal(visiblePrice(p,new Date("2026-08-14T12:00:00Z")),null)});
