export async function getStaticProps() {
  let SERVERS = [];
  
  const serversJson = process.env.SERVERS_JSON;
  const serverUrlVercel = process.env.NEXT_PUBLIC_VERCEL_URL
  if (serversJson) {
    try { SERVERS = JSON.parse(serversJson); } catch (error) { 
        console.error(error);
        const SERVERS = [{ name: 'Localhost', pingUrl: 'http://127.0.0.1:3000/api/ping', downloadUrl: 'http://127.0.0.1:3000/api/download', uploadUrl: 'http://127.0.0.1:3000/api/upload', maxUpload: '27262976' } ];
    }
  } else if (serverUrlVercel) {
        console.warn("Using fallback vercel")
        const SERVERS = [{ name: 'Vercel', pingUrl: 'https://{NEXT_PUBLIC_VERCEL_URL}/api/ping', downloadUrl: 'http:/{NEXT_PUBLIC_VERCEL_URL}/api/download', uploadUrl: 'https://{NEXT_PUBLIC_VERCEL_URL}/api/upload', maxUpload: '27262976' } ];
  } else {
        const SERVERS = [{ name: 'Localhost', pingUrl: 'https://{NEXT_PUBLIC_VERCEL_URL}/api/ping', downloadUrl: 'http:/{NEXT_PUBLIC_VERCEL_URL}/api/download', uploadUrl: 'https://{NEXT_PUBLIC_VERCEL_URL}/api/upload', maxUpload: '27262976' } ];
  }
}
