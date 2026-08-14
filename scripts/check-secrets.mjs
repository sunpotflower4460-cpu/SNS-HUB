import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const buildOnly=process.argv.includes("--build-only");
const sourceSkipped=new Set([".git","node_modules",".next","out","build",".turbo","coverage"]);
const buildSkipped=new Set(["cache"]);
const textExtensions=new Set([".js",".jsx",".mjs",".cjs",".ts",".tsx",".json",".map",".md",".txt",".yml",".yaml",".toml",".ini",".env",".css",".html",".sh"]);
const explicitNames=new Set(["Dockerfile","Procfile"]);
const patterns=[
  ["private key",/-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/],
  ["OpenAI-style secret key",/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b/],
  ["GitHub token",/\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{60,})\b/],
  ["AWS access key",/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/],
  ["Slack token",/\bxox[baprs]-[A-Za-z0-9-]{20,}\b/],
  ["Google API key",/\bAIza[0-9A-Za-z_-]{35}\b/],
  ["Stripe live secret",/\bsk_live_[0-9A-Za-z]{20,}\b/],
];

function* walk(dir,skipped){
  for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
    if(skipped.has(entry.name)||entry.isSymbolicLink())continue;
    const full=path.join(dir,entry.name);
    if(entry.isDirectory())yield* walk(full,skipped);else yield full;
  }
}

const roots=buildOnly?[path.join(root,".next")]:[root];
if(buildOnly&&!fs.existsSync(roots[0])){console.error(".next build output is missing; run the production build before build secret scan");process.exit(1)}
const hits=[];
for(const scanRoot of roots){
  const skipped=buildOnly?buildSkipped:sourceSkipped;
  for(const file of walk(scanRoot,skipped)){
    const relative=path.relative(root,file),ext=path.extname(file).toLowerCase();
    if(!textExtensions.has(ext)&&!explicitNames.has(path.basename(file)))continue;
    const stat=fs.statSync(file);if(stat.size>5_000_000)continue;
    const text=fs.readFileSync(file,"utf8");
    for(const [name,re] of patterns)if(re.test(text))hits.push(`${relative}: ${name}`);
  }
}
if(hits.length){console.error(`High-confidence secret patterns detected (${buildOnly?"build":"source"}):\n${hits.join("\n")}`);process.exit(1)}
console.log(`${buildOnly?"build":"source"} secret scan passed`);
