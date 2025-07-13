export const runtime = 'edge'; 
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method === 'POST') {
    if (!req.body) {
      return new Response('Request body is missing.', { status: 400 });
    }
    try {
      const reader = req.body.getReader();
      while (true) {
        const { done } = await reader.read();
        if (done) {
          break;
        }
      }

      return new Response(JSON.stringify({ message: 'Upload received' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
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
