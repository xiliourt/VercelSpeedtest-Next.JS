// pages/api/upload.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // The client sends data, we just need to acknowledge it.
    // We don't need to process or save the data for a speed test.
    
    // Consume the stream to ensure data is "received"
    let receivedBytes = 0;
    await new Promise((resolve, reject) => {
      req.on('data', (chunk) => {
        receivedBytes += chunk.length;
      });
      req.on('end', () => {
        // console.log(`Upload API: Received ${receivedBytes} bytes.`);
        resolve();
      });
      req.on('error', (err) => {
        console.error('Upload API stream error:', err);
        reject(err);
      });
    });
    
    // Add headers to prevent caching
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    res.status(200).json({ message: 'Upload received' });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// Vercel specific config to increase body size limit if needed,
// though for 5MB it might be fine with default.
// For larger uploads, you might need to adjust this.
// However, serverless functions have limits. For very large uploads,
// a different architecture (e.g., direct to S3) is better.
export const config = {
  api: {
    bodyParser: false, // We are handling the stream ourselves
  },
};
