// pages/api/download.js
import { Readable } from 'stream';

// Function to generate a chunk of random data
function generateRandomChunk(size) {
  const buffer = Buffer.alloc(size);
  for (let i = 0; i < size; i++) {
    buffer[i] = Math.floor(Math.random() * 256);
  }
  return buffer;
}

export default async function handler(req, res) {
  const requestedSize = parseInt(req.query.size) || (10 * 1024 * 1024); // Default to 10MB if not specified
  const chunkSize = 64 * 1024; // 64KB chunks

  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="download.dat"');
  res.setHeader('Content-Length', requestedSize);
  // Add headers to prevent caching
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  let bytesSent = 0;

  const stream = new Readable({
    read() {
      if (bytesSent >= requestedSize) {
        this.push(null); // End of stream
        return;
      }
      const bytesRemaining = requestedSize - bytesSent;
      const currentChunkSize = Math.min(chunkSize, bytesRemaining);
      this.push(generateRandomChunk(currentChunkSize));
      bytesSent += currentChunkSize;
    }
  });

  stream.pipe(res);

  // Handle client disconnect
  req.on('close', () => {
    stream.destroy();
    // console.log('Client disconnected, download stream destroyed.');
  });
}

// Vercel Edge runtime is not suitable for streaming large files like this from a serverless function.
// Use the default Node.js runtime.
// export const config = {
//   runtime: 'edge', // DO NOT USE EDGE for this kind of streaming
// };
