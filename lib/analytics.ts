export const ANALYTICS_SCHEMA_VERSION=1 as const;
export const ANALYTICS_EVENT_TYPES=["page_view","navigation","route_click","alternative_click"] as const;
export type AnalyticsEventType=typeof ANALYTICS_EVENT_TYPES[number];
export type VisitKind="first"|"returning"|"same-session"|"unknown";
export type NavigationKind="problem"|"category";
export type AnalyticsEvent={
  schemaVersion:typeof ANALYTICS_SCHEMA_VERSION;
  type:AnalyticsEventType;
  path:string;
  occurredAt:string;
  visitKind?:VisitKind;
  targetKind?:NavigationKind;
  targetId?:string;
  productId?:string;
  routeId?:string;
  productSlug?:string;
  targetProductSlug?:string;
};
export type StoredAnalyticsEvent=AnalyticsEvent&{receivedAt:string};
export type AnalyticsSummary={schemaVersion:1;events:number;pageViews:number;firstVisits:number;returningVisits:number;navigation:Record<string,number>;routeClicks:Record<string,number>;alternativeClicks:Record<string,number>};

const idPattern=/^[a-z0-9][a-z0-9-]{0,127}$/;
const pathPattern=/^\/[\u0021-\u007e\u3040-\u30ff\u3400-\u9fff\uff00-\uffef]{0,399}$/u;
const visitKinds=new Set<VisitKind>(["first","returning","same-session","unknown"]);
const navigationKinds=new Set<NavigationKind>(["problem","category"]);
function asRecord(value:unknown):Record<string,unknown>|null{return value!==null&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:null}
function validIso(value:unknown,now:Date){if(typeof value!=="string")return false;const t=new Date(value).valueOf();return Number.isFinite(t)&&Math.abs(now.valueOf()-t)<=24*60*60*1000}
function safeId(value:unknown){return typeof value==="string"&&idPattern.test(value)?value:undefined}
export function parseAnalyticsEvent(value:unknown,now=new Date()):AnalyticsEvent|null{
  const v=asRecord(value);if(!v||v.schemaVersion!==1||!ANALYTICS_EVENT_TYPES.includes(v.type as AnalyticsEventType)||typeof v.path!=="string"||!pathPattern.test(v.path)||v.path.includes("?")||v.path.includes("#")||!validIso(v.occurredAt,now))return null;
  const type=v.type as AnalyticsEventType,event:AnalyticsEvent={schemaVersion:1,type,path:v.path,occurredAt:v.occurredAt as string};
  if(type==="page_view"){
    if(v.visitKind!==undefined&&!visitKinds.has(v.visitKind as VisitKind))return null;event.visitKind=(v.visitKind as VisitKind|undefined)??"unknown";
  }else if(type==="navigation"){
    if(!navigationKinds.has(v.targetKind as NavigationKind))return null;const targetId=safeId(v.targetId);if(!targetId)return null;event.targetKind=v.targetKind as NavigationKind;event.targetId=targetId;
  }else if(type==="route_click"){
    const productId=safeId(v.productId),routeId=safeId(v.routeId);if(!productId||!routeId)return null;event.productId=productId;event.routeId=routeId;
  }else if(type==="alternative_click"){
    const productSlug=safeId(v.productSlug),targetProductSlug=safeId(v.targetProductSlug);if(!productSlug||!targetProductSlug||productSlug===targetProductSlug)return null;event.productSlug=productSlug;event.targetProductSlug=targetProductSlug;
  }
  return event;
}
export function storedEvent(event:AnalyticsEvent,receivedAt=new Date().toISOString()):StoredAnalyticsEvent{return {...event,receivedAt}}
export function analyticsLogLine(event:AnalyticsEvent,receivedAt=new Date().toISOString()){return `hub_analytics ${JSON.stringify(storedEvent(event,receivedAt))}`}
export function summarizeAnalytics(events:AnalyticsEvent[]):AnalyticsSummary{
  const summary:AnalyticsSummary={schemaVersion:1,events:events.length,pageViews:0,firstVisits:0,returningVisits:0,navigation:{},routeClicks:{},alternativeClicks:{}};
  for(const event of events){
    if(event.type==="page_view"){summary.pageViews++;if(event.visitKind==="first")summary.firstVisits++;if(event.visitKind==="returning")summary.returningVisits++}
    if(event.type==="navigation"&&event.targetKind&&event.targetId){const k=`${event.targetKind}:${event.targetId}`;summary.navigation[k]=(summary.navigation[k]??0)+1}
    if(event.type==="route_click"&&event.productId&&event.routeId){const k=`${event.productId}:${event.routeId}`;summary.routeClicks[k]=(summary.routeClicks[k]??0)+1}
    if(event.type==="alternative_click"&&event.productSlug&&event.targetProductSlug){const k=`${event.productSlug}->${event.targetProductSlug}`;summary.alternativeClicks[k]=(summary.alternativeClicks[k]??0)+1}
  }
  return summary;
}
