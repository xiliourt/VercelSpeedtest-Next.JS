// File: pages/api/upload.js

// Configuration for the API route
export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser to handle raw stream
  },
};

export default async function handler(req, res) {
  // Note for Vercel deployment:
  // Vercel Serverless Functions have execution timeouts (e.g., Hobby: 10s, Pro: up to 60s by default for HTTP, Enterprise: up to 900s)
  // and request payload size limits (e.g., typically around 4.5MB when bodyParser is false).
  // For uploads exceeding these limits, especially larger files, consider using Vercel Blob
  // or a similar direct-to-cloud-storage solution (e.g., presigned URLs for S3).
  // This handler is suitable for uploads that fit within these platform constraints.

  // Set headers to prevent caching.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');

  if (req.method === 'POST') {
    let byteCount = 0;
    
    // Listen for data chunks from the request stream.
    req.on('data', (chunk) => {
      byteCount += chunk.length;
      // You could add logic here if you need to process chunks, but for a speed test,
      // just counting bytes is usually sufficient.
    });

    // When the entire request body has been received.
    req.on('end', () => {
      // console.log(`Upload API: Received ${byteCount} bytes.`);
      // Send a success response to the client.
      res.status(200).json({ message: 'Upload received successfully', bytesReceived: byteCount });
    });

    // Handle any errors that occur during the stream.
    req.on('error', (err) => {
      console.error('Upload stream error:', err);
      // Ensure response is sent only once
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error receiving upload stream.' });
      }
    });

  } else {
    // If the request method is not POST, return a 405 Method Not Allowed error.
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
