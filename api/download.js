// File: pages/api/download.js
import { Readable } from 'stream';

// Configuration for the API route
export const config = {
  api: {
    responseLimit: false, // Disable Next.js default response limit (4MB) for larger files
  },
};

export default function handler(req, res) {
  // --- Configuration ---
  // This size MUST match or be consistent with DOWNLOAD_FILE_SIZE_BYTES in the frontend.
  const fileSizeMB = 10; 
  const fileSize = fileSizeMB * 1024 * 1024; // 10 MB in bytes

  // --- Headers ---
  // Disable caching to ensure fresh download for speed testing.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  
  // Set content type to binary stream for download.
  res.setHeader('Content-Type', 'application/octet-stream');
  // Set the content length header, crucial for the client to know the total size and calculate progress.
  res.setHeader('Content-Length', fileSize);
  // Suggest a filename (optional).
  // res.setHeader('Content-Disposition', `attachment; filename="random_data_${fileSize}.dat"`);

  // --- Data Generation & Streaming ---
  let bytesSent = 0;
  const chunkSize = 64 * 1024; // 64KB chunks

  // Create a readable stream that generates data on demand.
  const readable = new Readable({
    read() {
      if (bytesSent >= fileSize) {
        this.push(null); // Signal the end of the stream.
        return;
      }
      
      // Determine how many bytes to send in the current chunk.
      const bytesToSend = Math.min(chunkSize, fileSize - bytesSent);
      // Generate a buffer of dummy data.
      // Using a simple character 'a'. For more "randomness", you could use Math.random() or crypto.
      this.push(Buffer.alloc(bytesToSend, 'a')); 
      bytesSent += bytesToSend;
    }
  });

  // Pipe the readable stream to the response object.
  // This efficiently streams data to the client without buffering the entire file in memory.
  readable.pipe(res);

  // Handle errors on the readable stream (e.g., if something goes wrong during generation)
  readable.on('error', (err) => {
    console.error('Stream error during download generation:', err);
    // Try to end the response if it hasn't been ended already
    if (!res.writableEnded) {
      res.status(500).end('Internal server error during stream generation.');
    }
  });

  // Handle client closing connection prematurely
  req.on('close', () => {
    // console.log('Client closed connection during download.');
    readable.destroy(); // Clean up the readable stream
  });
}
