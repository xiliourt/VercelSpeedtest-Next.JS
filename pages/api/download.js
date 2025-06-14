// pages/api/ping.js
export const runtime = 'edge'; 
export const config = { runtime: 'edge', };

// Function to generate a chunk of random data as Uint8Array
function generateRandomChunk(size) {
  // Create a buffer of the specified size.
  const buffer = new Uint8Array(size);
  crypto.getRandomValues(buffer);
  return buffer;
}

export default async function handler(req) {
  // In the Edge Runtime, req is a standard Request object.
  // We need to parse query parameters from the URL.
  const url = new URL(req.url);
  const requestedSize = parseInt(url.searchParams.get('size')) || (10 * 1024 * 1024); // Default to 10MB
  const chunkSize = 64 * 1024; // 64KB chunks

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="download.dat"',
    'Content-Length': requestedSize.toString(),
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Access-Control-Allow-Headers': 'X-Requested-With, Content-Type, Authorization'
  };

  let bytesSent = 0;

  const stream = new ReadableStream({
    async pull(controller) {
      if (bytesSent >= requestedSize) {
        controller.close();
        return;
      }

      const bytesRemaining = requestedSize - bytesSent;
      const currentChunkSize = Math.min(chunkSize, bytesRemaining);
      
      try {
        const chunk = generateRandomChunk(currentChunkSize);
        controller.enqueue(chunk);
        bytesSent += currentChunkSize;
      } catch (error) {
        console.error("Error generating or enqueuing chunk:", error);
        controller.error(error); // Signal an error to the stream
      }
    },
    cancel(reason) {
      console.log('Download stream cancelled by client.', reason);
      // Perform any cleanup here if necessary
    }
  });

  return new Response(stream, { headers });
}
