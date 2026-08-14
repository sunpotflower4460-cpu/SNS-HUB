import assert from "node:assert/strict";
import test from "node:test";
import {manifest} from "../lib/hub";

test("content manifest has stable machine-readable contract",()=>{
  const m=manifest();
  assert.equal(m.schemaVersion,1);
  assert.match(m.contentVersion,/^[a-f0-9]{20}$/);
  assert.ok(Number.isInteger(m.productCount)&&m.productCount>=0);
  assert.ok(Number.isFinite(new Date(m.generatedAt).valueOf()));
});
