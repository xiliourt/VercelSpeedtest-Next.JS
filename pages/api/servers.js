export const runtime = 'edge'
export default function handler(req) {
  let servers = [];

  // 1. Try to load from the primary environment variable.
  const serversJson = process.env.NEXT_PUBLIC_SERVERS_JSON;
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
  if (servers.length === 0 && vercelUrl) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Vercel (This Deployment)', serverUrl: `https://${vercelUrl}`, maxUpload: '4194304' } ];
  }

  const renderUrl = process.env.RENDER_EXTERNAL_URL
  if (servers.length === 0 && renderUrl) {
    console.warn("Using Render URL as a fallback server configuration.");
    servers = [ { name: 'Render (this deployment)', serverUrl: `https://${renderUrl}`, maxUpload: '4194304' } ];
  }

  const CFPagesURL = process.env.CF_PAGES_URL
  if (servers.length === 0 && CFPagesURL) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Netlifgy (this deployment)', serverUrl: `https://${CFPagesURL}`, maxUpload: '4194304' } ];
  }
  
  const deployUrl = process.env.DEPLOY_PRIME_URL
  if (servers.length === 0 && deployUrl) {
    console.warn("Using generic deploy_prime_url URL as a fallback server configuration.");
    servers = [ { name: 'Unknown (This deployment)', serverUrl: `https://${deployUrl}`, maxUpload: '4194304' } ];
  }

  /* Fuck it, using local host as the URL */
  if (servers.length === 0) {
    console.error("Using localhost as the final fallback server configuration. You didn't set SERVERS_JSON as an environment variable and we coudln't determine the URL from any variables.");
    servers = [ { name: 'Localhost', serverUrl: 'http://127.0.0.1:3000', maxUpload: '27262976'}] ;
  }
  return new Response(JSON.stringify(servers), { status: 200, headers: {'Content-Type': 'application/json',},});
}
