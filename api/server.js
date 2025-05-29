// api/server.js
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// --- Configuration ---
const DOWNLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB for download

// This is the client-side setting, ensure your client matches this if you change it.
// For Hobby plan on Vercel, client should send < 4MB.
const EXPECTED_UPLOAD_CLIENT_SIZE_BYTES = 10 * 1024 * 1024; // e.g., 10MB

// Server's own limit for processing raw body, should be slightly larger than expected client upload.
// Vercel's platform limit (e.g., 4.5MB on Hobby) applies *before* this.
const UPLOAD_MAX_SIZE_SERVER_CONFIG = `${Math.ceil(EXPECTED_UPLOAD_CLIENT_SIZE_BYTES / (1024 * 1024)) + 5}mb`; // e.g., "15mb"

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes

// Middleware to parse raw body for uploads.
// Note: Vercel's own request body size limits (e.g., 4.5MB on Hobby) take precedence.
app.use('/upload', express.raw({
    type: '*/*', // Process any content type as raw
    limit: UPLOAD_MAX_SIZE_SERVER_CONFIG
}));

// --- Helper Functions ---
function generateRandomBuffer(size) {
    // console.log(`Generating a random buffer of size: ${(size / (1024 * 1024)).toFixed(2)} MB for request...`);
    try {
        // For Vercel, ensure your function has enough memory allocated if this is large.
        return crypto.randomBytes(size);
    } catch (err) {
        console.error("Error generating random buffer (check memory limits/size):", err.message);
        // Fallback for safety or if crypto.randomBytes has issues with very large allocations in limited env
        const buffer = Buffer.alloc(size);
        for (let i = 0; i < size; i++) { buffer[i] = i % 256; } // Simple predictable pattern
        return buffer;
    }
}

function setNoCacheHeaders(res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
}

// --- Routes ---
app.get('/ping', (req, res) => {
    setNoCacheHeaders(res);
    res.status(200).send('OK');
});

app.get('/download', (req, res) => {
    // Generate buffer on demand for serverless environment
    const downloadBuffer = generateRandomBuffer(DOWNLOAD_FILE_SIZE_BYTES);

    if (!downloadBuffer || downloadBuffer.length !== DOWNLOAD_FILE_SIZE_BYTES) {
        setNoCacheHeaders(res);
        console.error(`Failed to generate adequate download buffer. Expected ${DOWNLOAD_FILE_SIZE_BYTES}, got ${downloadBuffer ? downloadBuffer.length : 0}`);
        return res.status(500).send("Error generating download data on server.");
    }

    setNoCacheHeaders(res);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', downloadBuffer.length);
    res.send(downloadBuffer);
});

app.post('/upload', (req, res) => {
    // The 'express.raw' middleware has already processed the body.
    // We just need to acknowledge. Vercel's body size limits apply.
    // req.body will be a Buffer. You can check req.body.length if needed.
    // console.log(`Upload endpoint: Received ${req.body ? req.body.length : 0} bytes.`);
    setNoCacheHeaders(res);
    res.status(200).send('OK: Upload data processed by Vercel function.');
});

// Export the Express API for Vercel
module.exports = app;
