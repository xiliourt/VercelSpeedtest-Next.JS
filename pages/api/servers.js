import { loadEnvConfig } from '@next/env'
export const runtime = 'edge'
export default function handler(req) {
  let servers = [];

  // 1. Try to load from the primary environment variable.
  const serversJson = process.env.NEXT_PUBLIC_SERVERS_JSON;
  loadEnvConfig(serversJson)
  if (serversJson) {
    try {
      const parsedServers = JSON.parse(serversJson);
      if (Array.isArray(parsedServers) && parsedServers.length > 0) {
        servers = parsedServers;
      } else {
        console.warn("SERVERS_JSON was found but is not a valid, non-empty JSON array. Falling back.");
      }
    } catch (error) {
      console.error("Error parsing SERVERS_JSON environment variable:", error);
    }
  }

  /*** If SERVERS_JSON fails...
  ** Try using Vercel URL 
  ** Try using Render URL
  ** Try using Netlify URL
  ** Try using Cloudflare Pages URL
  ** Give up and use localhost:3000 */
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  loadEnvConfig(vercelUrl)
  if (servers.length === 0 && vercelUrl) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Vercel (This Deployment)', serverUrl: `https://${vercelUrl}`, maxUpload: '4194304' } ];
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL
  loadEnvConfig(renderUrl)
  if (servers.length === 0 && renderUrl) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Render (this deployment)', serverUrl: `https://${renderUrl}`, maxUpload: '4194304' } ];
  }

  const netlifyUrl = process.env.DEPLOY_PRIME_URL
  loadEnvConfig(netlifyUrl)
  if (servers.length === 0 && netlifyUrl) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Netlifgy (this deployment)', serverUrl: `https://${netlifyUrl}`, maxUpload: '4194304' } ];
  }

  const CFPagesURL = process.env.CF_PAGES_URL
  loadEnvConfig(CFPagesURL)
  if (servers.length === 0 && CFPagesURL) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Netlifgy (this deployment)', serverUrl: `https://${CFPagesURL}`, maxUpload: '4194304' } ];
  }
  
  /* Fuck it, using local host as the URL */
  if (servers.length === 0) {
    console.error("Using localhost as the final fallback server configuration. You didn't set SERVERS_JSON as an environment variable");
    servers = [ { name: 'Localhost', serverUrl: 'http://127.0.0.1:3000', maxUpload: '27262976'}] ;
  }
  return new Response(JSON.stringify(servers), { status: 200, headers: {'Content-Type': 'application/json',},});
}
