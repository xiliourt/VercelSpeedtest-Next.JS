import { loadEnvConfig } from '@next/env'
export default function handler(req, res) {
  let servers = [];

  // 1. Try to load from the primary environment variable.
  const serversJson = process.env.SERVERS_JSON;
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

  // 2. If the primary source fails or is empty, try Vercel fallback.
  // The Vercel URL is automatically set by the Vercel platform.
  const vercelUrl = process.env.NEXT_PUBLIC_VERCEL_URL;
  loadEnvConfig(vercelUrl)
  if (servers.length === 0 && vercelUrl) {
    console.warn("Using Vercel URL as a fallback server configuration.");
    servers = [ { name: 'Vercel (This Deployment)', pingUrl: `https://${vercelUrl}/api/ping`, downloadUrl: `https://${vercelUrl}/api/download`, uploadUrl: `https://${vercelUrl}/api/upload`, maxUpload: '4194304' } ];
  }
  
  if (servers.length === 0) {
    console.warn("Using localhost as the final fallback server configuration.");
    servers = [ { name: 'Localhost', pingUrl: 'http://127.0.0.1:3000/api/ping', downloadUrl: 'http://127.0.0.1:3000/api/download', uploadUrl: 'http://127.0.0.1:3000/api/upload', maxUpload: '27262976' } ];
  }

  res.status(200).json(servers);
}
