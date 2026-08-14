import {analyticsLogLine,parseAnalyticsEvent} from "@/lib/analytics";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store, private","X-Robots-Tag":"noindex, nofollow"};
export async function POST(request:Request){
  const contentType=request.headers.get("content-type")??"",declaredLength=Number(request.headers.get("content-length")??"0"),origin=request.headers.get("origin"),site=request.headers.get("sec-fetch-site"),requestOrigin=new URL(request.url).origin;
  if(!contentType.toLowerCase().startsWith("application/json"))return new Response(null,{status:415,headers});
  if(Number.isFinite(declaredLength)&&declaredLength>4096)return new Response(null,{status:413,headers});
  if(origin&&origin!==requestOrigin)return new Response(null,{status:403,headers});
  if(site&&site!=="same-origin")return new Response(null,{status:403,headers});
  let text:string;try{text=await request.text()}catch{return new Response(null,{status:400,headers})}
  if(text.length>4096)return new Response(null,{status:413,headers});
  let body:unknown;try{body=JSON.parse(text)}catch{return new Response(null,{status:400,headers})}
  const event=parseAnalyticsEvent(body);if(!event)return new Response(null,{status:400,headers});
  console.info(analyticsLogLine(event));return new Response(null,{status:204,headers});
}
