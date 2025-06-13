import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const runtime = 'edge'; 

// Configure this API route to run on the Edge Runtime
export const config = {
  runtime: 'edge',
  matcher: '/api/ping' };
  export async function middleware() {
  const greeting = await get('ok');
  // NextResponse.json requires at least Next v13.1 or
  // enabling experimental.allowMiddlewareResponseBody in next.config.js
  return NextResponse.json(greeting);
  }
}

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
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
  };
  
  return new Response('OK', {
    status: 200,
    headers: headers,
  });
}
