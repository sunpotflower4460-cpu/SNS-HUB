import {products} from "../lib/hub";
import {inspectPublicUrl} from "../lib/url-safety";
const errors:string[]=[];let routes=0;
for(const p of products()){
  for(const issue of inspectPublicUrl(p.officialUrl))errors.push(`${p.productId}: officialUrl ${issue}`);
  for(const route of p.routes){routes++;for(const issue of inspectPublicUrl(route.url))errors.push(`${p.productId}:${route.routeId}: ${issue}`)}
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log(`safe-link integrity passed for ${products().length} products / ${routes} routes; externalRequests=0`);
