import Head from 'next/head';
import { useState, useEffect } from 'react';

export default function Ping() {
  return (<head>
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store',
      'Content-Type': 'text/plain',
    </head>
    OK)
}
