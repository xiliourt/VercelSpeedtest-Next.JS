// File: pages/api/ping.js

export default function handler(req, res) {
  // Set headers to prevent caching for accurate ping measurement.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  
  // Send a minimal response. The client measures the time to receive this.
  res.status(200).send('pong');
}
