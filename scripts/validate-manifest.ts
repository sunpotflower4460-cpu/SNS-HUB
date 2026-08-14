import fs from "node:fs";
import path from "node:path";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import {manifest} from "../lib/hub";

const root=process.cwd();
const schema=JSON.parse(fs.readFileSync(path.join(root,"schemas/manifest.schema.json"),"utf8"));
const ajv=new Ajv({allErrors:true,strict:false});
addFormats(ajv);
const check=ajv.compile(schema),value=manifest();
if(!check(value)){
  console.error(`invalid content manifest: ${ajv.errorsText(check.errors)}`);
  process.exit(1);
}
console.log(`validated manifest ${value.contentVersion}; productCount=${value.productCount}`);
