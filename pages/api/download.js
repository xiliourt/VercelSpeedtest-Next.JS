
export const runtime = 'edge'; 
export const config = { runtime: 'edge', };

function generateRandomChunk(size) {
  const buffer = new Uint8Array(size);

  if (process.env.VERCEL_ENV == "production") {
    for (let i = 0; i < size; i++) { buffer[i] = i % 256; }
  } else {
    crypto.getRandomValues(buffer)
  }
  return buffer;
}

export default async function handler(req) {
  // In the Edge Runtime, req is a standard Request object.
  // We need to parse query parameters from the URL.
  const url = new URL(req.url);
  const requestedSize = parseInt(url.searchParams.get('size')) || (10 * 1000 * 999); // Default to just under 10MB so vercel caches
  const chunkSize = 64 * 1024; // 64KB chunks

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="download.dat"',
    'Content-Length': requestedSize.toString(),
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
  }, { highWaterMark: 32 } );

  return new Response(stream, { headers });
}
