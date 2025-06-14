import '@vercel/edge'
export const runtime = 'edge'; 

export const config = { runtime: 'edge', };

export default function handler(req) {
  // Add headers to prevent caching by browser or intermediaries
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
  };
  
  return new Response('OK', {
    status: 200,
    headers: headers,
  });
}
