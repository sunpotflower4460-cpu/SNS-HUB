import assert from "node:assert/strict";
import test from "node:test";
import {inspectPublicUrl} from "../lib/url-safety";
test("safe-link inspection accepts public affiliate tracking parameters without requesting them",()=>assert.deepEqual(inspectPublicUrl("https://example.com/item?tag=abc&aff_id=123&utm_source=hub"),[]));
test("safe-link inspection rejects insecure/private/credential URLs",()=>{assert.ok(inspectPublicUrl("http://example.com").includes("not-https"));assert.ok(inspectPublicUrl("https://127.0.0.1/item").includes("private-host"));assert.ok(inspectPublicUrl("https://user:pass@example.com/item").includes("embedded-credentials"))});
test("safe-link inspection rejects high-confidence secret query parameters",()=>{assert.ok(inspectPublicUrl("https://example.com/item?access_token=secret").includes("secret-query-parameter"));assert.ok(inspectPublicUrl("https://example.com/item?client_secret=secret").includes("secret-query-parameter"))});
