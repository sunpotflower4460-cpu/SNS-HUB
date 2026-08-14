import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export type RouteStatus = "ACTIVE"|"DEGRADED"|"REVERIFY_DUE"|"PROGRAM_PAUSED"|"DISABLED";
export type Product = {
  schemaVersion: 1;
  productId: string; slug: string; name: string; brand: string;
  kind: "physical"|"service"|"app"|"subscription"|"free-tool";
  categoryIds: string[]; problemTagIds: string[];
  problemSolved: string; convenienceInOneSentence: string; whyInteresting: string;
  whoFor: string[]; whoCanSkip: string[]; tradeoffs: string[];
  officialUrl: string;
  media: {url:string;alt:string;rightsStatus:"affiliate-creative"|"explicitly-permitted"|"owned"|"unknown"}[];
  pricing: {display:string|null;currency:"JPY";verifiedAt:string|null};
  availability: "available"|"limited"|"unknown"|"unavailable"|"discontinued";
  scores: Record<"discoverySurprise"|"practicalUtility"|"clarity"|"evidenceStrength"|"audienceFit"|"valueSense"|"distinctiveness"|"shareability"|"risk", number>;
  routes: {
    routeId:string; provider:"amazon"|"rakuten"|"a8"|"valuecommerce"|"impact"|"direct"|"other";
    merchant:string;url:string;routeType:"affiliate"|"official"|"non-affiliate";
    platforms:string[];status:RouteStatus;destinationProductMatch:boolean;verifiedAt:string;
    disclosureRequired:boolean;notes:string|null;
  }[];
  alternatives:{productId:string;relation:"similar"|"cheaper"|"current-alternative"|"different-use-case";reason:string;verifiedAt:string}[];
  social:{platform:"x"|"instagram";postId:string;url:string;publishedAt:string}[];
  freshness:{lastProductVerifiedAt:string|null;lastPriceVerifiedAt:string|null;lastAffiliateRouteVerifiedAt:string|null};
  publication:{status:"staged"|"ready"|"published"|"archived";firstPublishedAt:string|null;updatedAt:string|null};
};
export type Taxonomy={id:string;slug:string;label:string;description:string};

const ROOT=process.cwd();
const DATA=path.join(ROOT,"data");
const PRODUCT_DIR=path.join(DATA,"products");
export const PRICE_FRESH_DAYS=7, ROUTE_FRESH_DAYS=30, PRODUCT_STALE_DAYS=45;

function readJson<T>(file:string):T{return JSON.parse(fs.readFileSync(file,"utf8")) as T}
export function products():Product[]{
  return fs.readdirSync(PRODUCT_DIR).filter(x=>x.endsWith(".json")).sort().map(x=>readJson<Product>(path.join(PRODUCT_DIR,x)));
}
export function publicProducts(){return products().filter(p=>["ready","published","archived"].includes(p.publication.status))}
export function categories(){return readJson<Taxonomy[]>(path.join(DATA,"categories.json"))}
export function problemTags(){return readJson<Taxonomy[]>(path.join(DATA,"problem-tags.json"))}
export function bySlug(slug:string){return publicProducts().find(p=>p.slug===slug)}
export function byId(id:string){return products().find(p=>p.productId===id)}
export function categoryBySlug(slug:string){return categories().find(x=>x.slug===slug)}
export function problemBySlug(slug:string){return problemTags().find(x=>x.slug===slug)}

export function ageDays(value:string|null, now=new Date()){
  if(!value)return null; const d=new Date(value); if(Number.isNaN(d.valueOf()))return null;
  return Math.floor((now.valueOf()-d.valueOf())/86_400_000);
}
export function isFresh(value:string|null,days:number,now=new Date()){
  const age=ageDays(value,now); return age!==null&&age>=0&&age<=days;
}
export function visiblePrice(p:Product,now=new Date()){
  return p.pricing.display&&isFresh(p.pricing.verifiedAt??p.freshness.lastPriceVerifiedAt,PRICE_FRESH_DAYS,now)?p.pricing.display:null;
}
export function healthyRoutes(p:Product,now=new Date()){
  return p.routes.filter(r=>r.status==="ACTIVE"&&r.destinationProductMatch&&r.url.startsWith("https://")&&isFresh(r.verifiedAt,ROUTE_FRESH_DAYS,now));
}
export function freshnessState(p:Product,now=new Date()):"fresh"|"stale"|"unknown"{
  const age=ageDays(p.freshness.lastProductVerifiedAt,now); return age===null?"unknown":age<=PRODUCT_STALE_DAYS?"fresh":"stale";
}
export function search(q:string){
  const n=q.normalize("NFKC").toLocaleLowerCase("ja-JP").trim(); if(!n)return publicProducts();
  const cats=new Map(categories().map(x=>[x.id,x.label])), probs=new Map(problemTags().map(x=>[x.id,x.label]));
  return publicProducts().filter(p=>[
    p.name,p.brand,p.problemSolved,p.convenienceInOneSentence,p.whyInteresting,...p.whoFor,...p.whoCanSkip,...p.tradeoffs,
    ...p.categoryIds.map(x=>cats.get(x)??x),...p.problemTagIds.map(x=>probs.get(x)??x)
  ].join(" ").normalize("NFKC").toLocaleLowerCase("ja-JP").includes(n));
}
export function contentVersion(){
  const canonical=products().slice().sort((a,b)=>a.productId.localeCompare(b.productId)).map(x=>JSON.stringify(x)).join("\n");
  return crypto.createHash("sha256").update(canonical).digest("hex").slice(0,20);
}
export function manifest(){
  const ps=products();
  const generatedAt=ps.map(p=>p.publication.updatedAt??p.freshness.lastProductVerifiedAt??"").sort().at(-1)||new Date(0).toISOString();
  return {schemaVersion:1,contentVersion:contentVersion(),generatedAt,productCount:ps.length};
}
export function formatDateJa(v:string|null){if(!v)return"未確認";const d=new Date(v);return Number.isNaN(d.valueOf())?"未確認":new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"short",day:"numeric"}).format(d)}
export function mergeByKey<T>(a:T[],b:T[],key:(x:T)=>string){const m=new Map(a.map(x=>[key(x),x]));for(const x of b)m.set(key(x),x);return [...m.values()]}
export function mergeCanonical(existing:Product|null,incoming:Product):Product{
  if(!existing)return incoming;if(existing.productId!==incoming.productId)throw new Error("productId mismatch");
  return {...incoming,routes:mergeByKey(existing.routes,incoming.routes,x=>x.routeId),social:mergeByKey(existing.social,incoming.social,x=>`${x.platform}:${x.postId}`)};
}
