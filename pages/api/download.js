
export const runtime = 'edge'; 
export const config = { runtime: 'edge', };

/*function generateRandomChunk(size) {
  if (process.env.VERCEL_ENV == "production") {
    return crypto.getRandomValues(new Uint8Array(size)
  } else {
    return crypto.getRandomValues(new Uint8Array(size))
  }
  
}*/

export default async function handler(req) {
  // In the Edge Runtime, req is a standard Request object.
  // We need to parse query parameters from the URL.
  const url = new URL(req.url);
  const requestedSize = parseInt(url.searchParams.get('size')) || (9.5 * 1024 * 1024); // Default to just under 10MB so vercel caches, it appears to cache 10 * 1000 * 1000
  const CHUNKSIZE = 64 * 1024; // 64KB chunks

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="download.dat"',
    'Content-Length': requestedSize.toString(),
  };

/*  let bytesSent = 0;
 const stream = new ReadableStream({
    async pull(controller) {
      if (bytesSent >= requestedSize) {
        controller.close();
        return;
      }

      const bytesRemaining = requestedSize - bytesSent;
      const currentChunkSize = Math.min(chunkSize, bytesRemaining);
      const encoder = new TextEncoder();
      try {
        const chunk = generateRandomChunk(currentChunkSize);
        if (process.env.VERCEL_ENV == "production") { controller.enqueue(encoder.encode(chunk)); } 
        else { controller.enqueue(chunk); }
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
  }, { highWaterMark: 32 } ); */
  const stream = new ReadableStream({
    start(controller) {
      let bytesSent = 0;
      while (bytesSent < requestedSize) {
        const remainingBytes = requestedSize - bytesSent;
        const chunkSize = Math.min(CHUNKSIZE, remainingBytes);
        const chunk = new Uint8Array(chunkSize);
        crypto.getRandomValues(chunk);
        controller.enqueue(chunk);
        bytesSent += chunk.length;
      }
      controller.close();
    },
  }, { highWaterMark: 32 });

  return new Response(stream, { headers });
}
