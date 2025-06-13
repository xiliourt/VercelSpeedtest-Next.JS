import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const runtime = 'edge'; 

export const config = { runtime: 'edge', matcher: '/api/ping' };

export async function middleware() {
  const greeting = await get('ok');
  // NextResponse.json requires at least Next v13.1 or
  // enabling experimental.allowMiddlewareResponseBody in next.config.js
  return NextResponse.json(greeting);
}
