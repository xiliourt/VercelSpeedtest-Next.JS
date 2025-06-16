import { NextResponse } from 'next/server';
import { get } from '@vercel/edge-config';

export const config = { matcher: '/ping' };

export async function middleware() {
  return NextResponse.json("ping");
}
