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
export type SocialBacklink=Product["social"][number];

const ROOT=process.cwd();
const DATA=path.join(ROOT,"data");
const PRODUCT_DIR=path.join(DATA,"products");
export const PRICE_FRESH_DAYS=7, ROUTE_FRESH_DAYS=30, PRODUCT_STALE_DAYS=45;

function readJson<T>(file:string):T{return JSON.parse(fs.readFileSync(file,"utf8")) as T}
function compareStable(a:string,b:string){return a<b?-1:a>b?1:0}
export function products():Product[]{return fs.readdirSync(PRODUCT_DIR).filter(x=>x.endsWith(".json")).sort(compareStable).map(x=>readJson<Product>(path.join(PRODUCT_DIR,x)))}
export function isPublicProduct(p:Product){return ["ready","published","archived"].includes(p.publication.status)}
export function isDiscoverableProduct(p:Product){return ["ready","published"].includes(p.publication.status)&&!["unavailable","discontinued"].includes(p.availability)}
export function publicProducts(){return products().filter(isPublicProduct)}
export function discoverableProducts(){return products().filter(isDiscoverableProduct)}
export function categories(){return readJson<Taxonomy[]>(path.join(DATA,"categories.json"))}
export function problemTags(){return readJson<Taxonomy[]>(path.join(DATA,"problem-tags.json"))}
export function bySlug(slug:string){return publicProducts().find(p=>p.slug===slug)}
export function byId(id:string){return products().find(p=>p.productId===id)}
export function categoryBySlug(slug:string){return categories().find(x=>x.slug===slug)}
export function problemBySlug(slug:string){return problemTags().find(x=>x.slug===slug)}

export function ageDays(value:string|null,now=new Date()){if(!value)return null;const d=new Date(value);if(Number.isNaN(d.valueOf()))return null;return Math.floor((now.valueOf()-d.valueOf())/86_400_000)}
export function isFresh(value:string|null,days:number,now=new Date()){const age=ageDays(value,now);return age!==null&&age>=0&&age<=days}
export function isHttpsUrl(value:string){if(value!==value.trim())return false;try{return new URL(value).protocol==="https:"}catch{return false}}
export function visiblePrice(p:Product,now=new Date()){if(p.publication.status==="archived"||["unavailable","discontinued"].includes(p.availability))return null;return p.pricing.display&&isFresh(p.pricing.verifiedAt??p.freshness.lastPriceVerifiedAt,PRICE_FRESH_DAYS,now)?p.pricing.display:null}
export function healthyRoutes(p:Product,now=new Date()){if(p.publication.status==="archived"||["unavailable","discontinued"].includes(p.availability))return [];return p.routes.filter(r=>r.status==="ACTIVE"&&r.destinationProductMatch&&r.platforms.includes("hub")&&isHttpsUrl(r.url)&&isFresh(r.verifiedAt,ROUTE_FRESH_DAYS,now))}
export function requiresAffiliateDisclosure(p:Product,now=new Date()){return healthyRoutes(p,now).some(r=>r.routeType==="affiliate"&&r.disclosureRequired)}
export function freshnessState(p:Product,now=new Date()):"fresh"|"stale"|"unknown"{const age=ageDays(p.freshness.lastProductVerifiedAt,now);return age===null||age<0?"unknown":age<=PRODUCT_STALE_DAYS?"fresh":"stale"}
export function search(q:string){const n=q.normalize("NFKC").toLocaleLowerCase("ja-JP").trim();if(!n)return discoverableProducts();const cats=new Map(categories().map(x=>[x.id,x.label])),probs=new Map(problemTags().map(x=>[x.id,x.label]));return discoverableProducts().filter(p=>[p.name,p.brand,p.problemSolved,p.convenienceInOneSentence,p.whyInteresting,...p.whoFor,...p.whoCanSkip,...p.tradeoffs,...p.categoryIds.map(x=>cats.get(x)??x),...p.problemTagIds.map(x=>probs.get(x)??x)].join(" ").normalize("NFKC").toLocaleLowerCase("ja-JP").includes(n))}
function canonicalize(value:unknown):unknown{if(Array.isArray(value))return value.map(canonicalize);if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value as Record<string,unknown>).sort(([a],[b])=>compareStable(a,b)).map(([k,v])=>[k,canonicalize(v)]));return value}
export function stableStringify(value:unknown){return JSON.stringify(canonicalize(value))}
export function contentVersion(){const snapshot={categories:categories().slice().sort((a,b)=>compareStable(a.id,b.id)),problemTags:problemTags().slice().sort((a,b)=>compareStable(a.id,b.id)),products:products().slice().sort((a,b)=>compareStable(a.productId,b.productId))};return crypto.createHash("sha256").update(stableStringify(snapshot)).digest("hex").slice(0,20)}
export function manifest(){const ps=products(),generatedAt=ps.flatMap(p=>[p.publication.updatedAt,p.freshness.lastProductVerifiedAt]).filter((x):x is string=>Boolean(x)).sort(compareStable).at(-1)||new Date(0).toISOString();return {schemaVersion:1,contentVersion:contentVersion(),generatedAt,productCount:ps.length}}
export function formatDateJa(v:string|null){if(!v)return"未確認";const d=new Date(v);return Number.isNaN(d.valueOf())?"未確認":new Intl.DateTimeFormat("ja-JP",{year:"numeric",month:"short",day:"numeric"}).format(d)}
export function mergeByKey<T>(a:T[],b:T[],key:(x:T)=>string){const m=new Map(a.map(x=>[key(x),x]));for(const x of b)m.set(key(x),x);return [...m.values()]}
export function mergeCanonical(existing:Product|null,incoming:Product):Product{if(!existing)return incoming;if(existing.productId!==incoming.productId)throw new Error("productId mismatch");if(existing.slug!==incoming.slug)throw new Error(`stable slug mismatch: ${existing.slug} -> ${incoming.slug}`);return {...incoming,publication:{...incoming.publication,firstPublishedAt:existing.publication.firstPublishedAt??incoming.publication.firstPublishedAt},routes:incoming.routes,social:mergeByKey(existing.social,incoming.social,x=>`${x.platform}:${x.postId}`)}}
export function attachSocialBacklink(p:Product,backlink:SocialBacklink,updatedAt=new Date().toISOString()):{product:Product;changed:boolean}{const key=`${backlink.platform}:${backlink.postId}`,current=p.social.find(x=>`${x.platform}:${x.postId}`===key);if(current&&stableStringify(current)===stableStringify(backlink))return {product:p,changed:false};return {product:{...p,social:mergeByKey(p.social,[backlink],x=>`${x.platform}:${x.postId}`),publication:{...p.publication,updatedAt}},changed:true}}
