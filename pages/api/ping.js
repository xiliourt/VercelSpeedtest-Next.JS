import '@vercel/edge'
import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const runtime = 'edge'; 
export const config = { matcher: '/ping' };

export default async function middleware() {
  const ping = await get('ping');
  // NextResponse.json requires at least Next v13.1 or
  // enabling experimental.allowMiddlewareResponseBody in next.config.js
  return NextResponse.json(ping);
}
