export const runtime = 'edge'; 
export const config = { runtime: 'edge', };

export default async function handler(req) {
  const url = new URL(req.url);
  const requestedSize = parseInt(url.searchParams.get('size')) || (9.5 * 1024 * 1024); 
  const CHUNKSIZE = 64 * 1024; 

  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="download.dat"',
    'Content-Length': requestedSize.toString(),
  };


  const stream = new ReadableStream({
    start(controller) {
      let bytesSent = 0;
      while (bytesSent < requestedSize) {
        const remainingBytes = requestedSize - bytesSent;
        const chunk = new Uint8Array(Math.min(CHUNKSIZE, remainingBytes));
        if (process.env.VERCEL_ENV == "production") { for (let i = 0; i < chunk.length; i++) { chunk[i] = Math.floor(Math.random() * 256); }
        } else { crypto.getRandomValues(chunk); }
        controller.enqueue(chunk);
        bytesSent += chunk.length;
      }
      controller.close();
    },
  }, { highWaterMark: 32 });

  return new Response(stream, { headers });
}
