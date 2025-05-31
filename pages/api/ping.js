// pages/api/ping.js
export const runtime = 'edge'; 

// Configure this API route to run on the Edge Runtime
export const config = {
  runtime: 'edge',
};

export default function handler(req) {
  // On the Edge, the 'req' object is a standard Request object.
  // 'res' is not passed; you return a Response object.

  // This endpoint simply needs to exist and respond quickly.
  // The client measures the round-trip time.

  // Add headers to prevent caching by browser or intermediaries
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Content-Type': 'text/plain',
  };
  
  return new Response('OK', {
    status: 200,
    headers: headers,
  });
}
