import { default as handlerPing } from './pages/api/ping.js';
import { default as handlerDownload } from './pages/api/download.js';
import { default as handlerUpload } from './pages/api/upload.js';
        
export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        // --- Custom API/Worker Routes based on /pages/api structure ---

        if (url.pathname.startsWith('/api/ping')) {
            // Delegate to the users handler
            return handlerPing(request);
        }

        if (url.pathname.startsWith('/api/download')) {
            // Delegate to the products handler
            return handlerDownload(request);
        }

        if (url.pathname.startsWith('/api/upload')) {
            // Delegate to the products handler
            return handlerUpload(request);
        }
        
        // --- Serve Static Assets ---
        // If none of the custom routes match, try to serve a static asset.
        // This is crucial for your Pages project to display its HTML, CSS, etc.
        try {
            return await env.ASSETS.fetch(request);
        } catch (e) {
            // Fallback for missing static assets
            return new Response('This serves as a backend only.', { status: 404 });
        }
    },
};
