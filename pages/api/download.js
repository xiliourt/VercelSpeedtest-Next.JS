export const config = {
  runtime: 'edge',
};

// This is the main handler for the API route.
// It handles requests to /api/junk
export default function handler(req) {
  
  // Get the target download size in megabytes from the URL query parameters.
  // Example: /api/junk?size=100 for a 100MB file.
  // It defaults to 10MB if no size is specified.
  const { searchParams } = new URL(req.url);
  const totalSizeInBytes = parseInt(searchParams.get('size'), (10 * 1024 * 1024)) || (10 * 1024 * 1024);

  // We will generate the data in chunks. This is the size of each chunk in bytes.
  // 64KB is a reasonable size that balances memory usage and performance.
  const chunkSize = 64 * 1024; // 64KB

  let bytesSent = 0;

  // A ReadableStream is used to generate data on the fly.
  // This is highly memory-efficient as the entire file is never stored in memory.
  const stream = new ReadableStream({
    start(controller) {
      // This function is called when the stream is first read from.
      function push() {
        // If we've sent enough data, we close the stream.
        if (bytesSent >= totalSizeInBytes) {
          controller.close();
          return;
        }

        // Determine the size of the next chunk to send.
        const chunk = new Uint8Array(Math.min(chunkSize, totalSizeInBytes - bytesSent));
        
        // Fill the chunk with cryptographically secure random values.
        // This is fast and provides a good source of "junk" data.
        crypto.getRandomValues(chunk);

        // Add the chunk to the stream's queue.
        controller.enqueue(chunk);
        bytesSent += chunk.length;
        
        // Continue pushing data immediately. The stream will handle backpressure.
        push();
      }

      // Start the data generation process.
      push();
    },
  });

  // Set the response headers to trigger a file download in the browser.
  const headers = {
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': `attachment; filename="junk-${sizeMB}mb.dat"`,
    // We can't set Content-Length reliably with a dynamic stream,
    // but the browser will handle it as the data arrives.
  };

  // Return the stream as the response.
  return new Response(stream, { headers });
}
