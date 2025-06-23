// pages/api/upload.js
export const runtime = 'edge'; 
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // In the Edge Runtime, req is a standard Request object.
  if (req.method === 'POST') {
    if (!req.body) {
      return new Response('Request body is missing.', { status: 400 });
    }
    try {
      // Consume the stream to simulate receiving the upload
      // The client measures the time it takes to send this data.
      const reader = req.body.getReader();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }
      // console.log(`Upload API (Edge): Consumed ${receivedBytes} bytes.`);

      const headers = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST'
      };

      return new Response(JSON.stringify({ message: 'Upload received' }), {
        status: 200,
        headers: headers,
      });

    } catch (error) {
      console.error('Upload API (Edge) stream processing error:', error);
      return new Response(JSON.stringify({ message: 'Error processing upload data' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } else {
    // Method Not Allowed
    return new Response(`Method ${req.method} Not Allowed`, {
      status: 200,
      headers: { 'Allow': 'POST'},
    });
  }
}
