import type { NextConfig } from 'next';
const nextConfig:NextConfig={output:'standalone',images:{unoptimized:true},webpack(config){config.externals.push({'cloudflare:workers':'commonjs cloudflare:workers'});return config;}};
export default nextConfig;
