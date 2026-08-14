import assert from "node:assert/strict";
import test from "node:test";
import {products} from "../lib/hub";

test("stored published/archived fixtures have first publication timestamps",()=>{for(const p of products().filter(p=>p.publication.status==="published"||p.publication.status==="archived"))assert.ok(p.publication.firstPublishedAt,`${p.productId} missing firstPublishedAt`)});
test("stored staged/ready fixtures contain no published social backlinks",()=>{for(const p of products().filter(p=>p.publication.status==="staged"||p.publication.status==="ready"))assert.equal(p.social.length,0,`${p.productId} has premature social backlink`)});
