import type { NextConfig } from "next";
const nextConfig:NextConfig={poweredByHeader:false,reactStrictMode:true,outputFileTracingIncludes:{"/*":["./data/**/*.json","./schemas/**/*.json"]}};
export default nextConfig;
