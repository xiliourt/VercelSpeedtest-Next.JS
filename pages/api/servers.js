export const runtime = 'edge'
export default function handler(req) {
  let servers = [];

  // 1. Try to load from the primary environment variable.
  const serversJson = process.env.SERVERS_JSON;
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

  const CFPagesURL = process.env.CF_PAGES_URL
  if (servers.length === 0 && CFPagesURL) {
    console.warn("NEXT_PUBLIC_SERVERS_JSON not set or an error occured reading JSON. Falling back to local server.")
    console.log("Detected Cloudflare, using >25MB as maxUpload.");
    servers = [ { name: 'Cloudflare (this deployment)', serverUrl: '', maxUpload: '27525120' } ];
  }

  /* Fallback - Uses the URL connected to and maxUpload 4MB, typical max upload size */
  if (servers.length === 0) {
    console.warn("NEXT_PUBLIC_SERVERS_JSON not set or an error occured reading JSON. Falling back to local server.");
    console.warn("Didn't detect host as Cloudflare, setting upload limit to 4MB assuming Vercel, Render or Netlify")
    servers = [ { name: 'This Deployment', serverUrl: '', maxUpload: '4194304'}] ;
  }
  return new Response(JSON.stringify(servers), { status: 200, headers: {'Content-Type': 'application/json',},});
}
