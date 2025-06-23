// pages/api/upload.js
export const runtime = 'edge';
export const config = { runtime: 'edge', };

export  async function POST(req) {
	try {
		const reader = req.body.getReader();
      		let receivedBytes = 0;
                const start = performance.now()
                const reader = req.body.getReader();
		while (true) {
        		const { done } = await reader.read();
        		if (done) { break; }
      		}
      		const duration = start - performance.now();
      		return new Response.json({ message: 'Upload received', duration: duration, status: 200};);
    	} catch (error) {
		console.error('Upload API (Edge) stream processing error:', error);
		return new Response.json({ message: 'Error processing upload data', error: error, status: 500});
	}
}
