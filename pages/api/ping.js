export const runtime = 'edge'; 
export const config = { runtime: 'edge', };
export default function handler(req) {
  const headers = {'Content-Type': 'text/plain',};
  
  return new Response('OK', {
    status: 200,
    headers: headers,
  });
}
