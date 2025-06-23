import '@vercel/edge'
import '@vercel/edge-config'
export const runtime = 'edge'
export const config = { runtime: 'edge', };
export function GET(request) {
  return new Response('OK', {
    status: 200,
    headers: headers,
  });
}
