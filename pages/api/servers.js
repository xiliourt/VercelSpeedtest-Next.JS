import { loadEnvConfig } from '@next/env'
export default function handler(req, res) {
  let SERVERS = [];
  SERVERS = process.env.SERVERS_JSON;
  loadEnvConfig(SERVERS);
  if (SERVERS.SERVERS) {
    res.status(200).json({ SERVERS });
  }

  const serverUrlVercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  loadEnvConfig(serverUrlVercel);
  if (serverUrlVercel) {
        console.warn("Using fallback vercel, no servers in environment variables but Vercel URL found")
        const SERVERS = [{ name: 'Vercel', pingUrl: 'https://{NEXT_PUBLIC_VERCEL_URL}/api/ping', downloadUrl: 'http:/{NEXT_PUBLIC_VERCEL_URL}/api/download', uploadUrl: 'https://{NEXT_PUBLIC_VERCEL_URL}/api/upload', maxUpload: '27262976' } ];
  } else {
        console.error("No servers and not running on Vercel, using local host")
        const SERVERS = [{ name: 'Localhost', pingUrl: 'https://127.0.0.1/api:3000/ping', downloadUrl: 'http:/127.0.0.1:3000/api/download', uploadUrl: 'https://127.0.0.1:3000/api/upload', maxUpload: '27262976' } ];
  }
  res.status(200).json({ SERVERS });
}
