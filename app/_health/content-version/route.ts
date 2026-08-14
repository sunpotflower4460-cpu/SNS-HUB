import {manifest} from "@/lib/hub";
export const dynamic="force-dynamic";
export async function GET(){return Response.json({ok:true,...manifest()},{headers:{"Cache-Control":"no-store"}})}
