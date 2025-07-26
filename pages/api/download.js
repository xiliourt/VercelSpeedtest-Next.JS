
export const runtime = 'edge'; 
export const config = { runtime: 'edge', };

function generateRandomChunk(size) {
const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
const charsetLength = charset.length;
return Array.from(crypto.getRandomValues(new Uint8Array(size)))
  .map(value => charset[value % charsetLength])
  .join('');
}

export default async function handler(req) {
  // In the Edge Runtime, req is a standard Request object.
  // We need to parse query parameters from the URL.
  const url = new URL(req.url);
  const requestedSize = parseInt(url.searchParams.get('size')) || (9.5 * 1024 * 1024); // Default to just under 10MB so vercel caches, it appears to cache 10 * 1000 * 1000
  const chunkSize = 64 * 1024; // 64KB chunks

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="download.dat"',
    'Content-Length': requestedSize.toString(),
  };

  let bytesSent = 0;
  const encoder = new TextEncoder()
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
        controller.enqueue(encoder.encode(chunk));
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
  }, { highWaterMark: 32 } );

  return new Response(stream, { headers });
}
