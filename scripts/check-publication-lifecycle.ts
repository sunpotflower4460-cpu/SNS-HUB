import {products} from "../lib/hub";

const errors:string[]=[];
for(const p of products()){
  const status=p.publication.status;
  if((status==="published"||status==="archived")&&!p.publication.firstPublishedAt)errors.push(`${p.productId}: ${status} requires firstPublishedAt`);
  if((status==="staged"||status==="ready")&&p.social.length>0)errors.push(`${p.productId}: ${status} cannot contain published social backlinks`);
  if(status==="staged"&&p.publication.firstPublishedAt)errors.push(`${p.productId}: staged cannot have firstPublishedAt`);
}
if(errors.length){console.error(errors.join("\n"));process.exit(1)}
console.log(`publication lifecycle integrity passed for ${products().length} products`);
