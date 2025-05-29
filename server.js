const express = require('express');
const cors = require('cors');
const crypto = require('crypto'); // For generating random data

const app = express();
const port = 443;

// --- Configuration ---
const DOWNLOAD_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const UPLOAD_MAX_SIZE_BYTES = 15 * 1024 * 1024;    // Max ~15MB for uploads (client sends 10MB)
let downloadBuffer;

// --- Middleware ---
app.use(cors()); // Enable CORS for all routes

// Middleware to parse raw body for uploads
// This will handle 'application/octet-stream' up to UPLOAD_MAX_SIZE_BYTES
app.use('/upload', express.raw({
    type: '*/*', // Accept any content type for the upload endpoint for simplicity
    limit: UPLOAD_MAX_SIZE_BYTES
}));


// --- Helper Functions ---
function generateRandomBuffer(size) {
    console.log(`Generating a random buffer of size: ${(size / (1024 * 1024)).toFixed(2)} MB...`);
    try {
        return crypto.randomBytes(size);
    } catch (err) {
        console.error("Error generating random buffer (possibly too large for available memory):", err);
        // Fallback for very large sizes if crypto.randomBytes fails due to memory constraints
        // This is a simplified fallback and might not be cryptographically random
        // For speed test purposes, predictable data is fine.
        console.log("Falling back to a simpler buffer generation method.");
        const buffer = Buffer.alloc(size);
        for (let i = 0; i < size; i++) {
            buffer[i] = i % 256;
        }
        return buffer;
    }
}

// Pre-generate the download buffer on server start
console.log("Initializing server...");
downloadBuffer = generateRandomBuffer(DOWNLOAD_FILE_SIZE_BYTES);
if (downloadBuffer) {
    console.log(`Download buffer of ${(downloadBuffer.length / (1024 * 1024)).toFixed(2)} MB generated successfully.`);
} else {
    console.error("Failed to generate download buffer. The server might not work as expected for downloads.");
    // Consider exiting if this is critical
    // process.exit(1);
}


// --- Routes ---
// Utility function to set no-cache headers
function setNoCacheHeaders(res) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
}

// Ping endpoint
app.get('/ping', (req, res) => {
    setNoCacheHeaders(res);
    res.status(200).send('OK');
});

// Download endpoint
app.get('/download', (req, res) => {
    if (!downloadBuffer) {
        setNoCacheHeaders(res);
        return res.status(500).send("Download data not available on server.");
    }
    setNoCacheHeaders(res);
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Length', downloadBuffer.length);
    res.send(downloadBuffer);
});

// Upload endpoint
app.post('/upload', (req, res) => {
    // req.body will contain the uploaded data (as a Buffer due to express.raw)
    // We don't need to do anything with it for a speed test,
    // simply receiving it is enough. The client measures the time to send.
    // The `express.raw` middleware handles reading the stream.
    if (req.body) {
        // console.log(`Received upload of ${req.body.length} bytes.`);
    } else {
        // console.log('Received upload request, but no body was processed.');
    }
    setNoCacheHeaders(res);
    res.status(200).send('OK');
});

// --- Start Server ---
app.listen(port, () => {
    console.log(`Speedtest backend server listening at http://localhost:${port}`);
    console.log(`Endpoints:`);
    console.log(`  GET /ping`);
    console.log(`  GET /download (serves ${(DOWNLOAD_FILE_SIZE_BYTES / (1024 * 1024)).toFixed(2)} MB)`);
    console.log(`  POST /upload (accepts up to ${(UPLOAD_MAX_SIZE_BYTES / (1024 * 1024)).toFixed(2)} MB)`);
});
