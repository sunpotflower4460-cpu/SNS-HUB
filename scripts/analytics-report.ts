import fs from "node:fs";
import {parseAnalyticsEvent,summarizeAnalytics,type AnalyticsEvent} from "../lib/analytics";
const file=process.argv[2];if(!file){console.error("usage: npm run analytics:report -- <exported-log-file>");process.exit(2)}
const lines=fs.readFileSync(file,"utf8").split(/\r?\n/).filter(Boolean),events:AnalyticsEvent[]=[];let rejected=0;
for(const line of lines){const marker=line.indexOf("hub_analytics "),payload=marker>=0?line.slice(marker+"hub_analytics ".length):line;try{const raw=JSON.parse(payload) as unknown,event=parseAnalyticsEvent(raw,new Date((raw as {receivedAt?:string}).receivedAt??Date.now()));if(event)events.push(event);else rejected++}catch{rejected++}}
console.log(JSON.stringify({...summarizeAnalytics(events),rejectedLines:rejected},null,2));
