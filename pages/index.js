import { useState, useEffect } from 'react';

// --- ICONS (as SVG components for better control) ---
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400">
        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
    </svg>
);

const ExclamationTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-red-400">
        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
);


// --- SERVER CONFIGURATION ---
const SERVERS = [
    { name: 'Vercel', pingUrl: 'https://speedtestjs.vercel.app/api/ping', downloadUrl: 'https://speedtestjs.vercel.app/api/download', uploadUrl: 'https://speedtestjs.vercel.app/api/upload' },
    { name: 'Render', pingUrl: 'https://js.render.dyl.ovh/api/ping', downloadUrl: 'https://js.render.dyl.ovh/api/download', uploadUrl: 'https://js.render.dyl.ovh/api/upload' },
    { name: 'Netlify', pingUrl: 'https://js.netlify.dyl.ovh/api/ping', downloadUrl: 'https://js.netlify.dyl.ovh/api/download', uploadUrl: 'https://js.netlify.dyl.ovh/api/upload' },
    { name: 'Cloudflare', pingUrl: 'https://js.cf.dyl.ovh/api/ping', downloadUrl: 'https://js.cf.dyl.ovh/api/download', uploadUrl: 'https://js.cf.dyl.ovh/api/upload' },
    { name: 'Sydney, AU', pingUrl: 'https://js.s.dyl.ovh/api/ping', downloadUrl: 'https://js.s.dyl.ovh/api/download', uploadUrl: 'https://js.s.dyl.ovh/api/upload' }
];

// --- TEST CONFIGURATION ---
const PING_COUNT = 4;0
const PING_TIMEOUT_MS = 2000; // 2-second timeout for each ping
const DOWNLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const UPLOAD_DATA_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export default function InternetSpeedTest() {
    const [testResults, setTestResults] = useState([]);
    const [isTesting, setIsTesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Click "Start All Tests" to begin.');
    const [currentTestProgress, setCurrentTestProgress] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);

    // Initialize results on component mount
    useEffect(() => {
        setTestResults(SERVERS.map(s => ({
            name: s.name,
            ping: '--',
            download: '--',
            upload: '--',
            status: 'pending' // pending, testing, complete, error
        })));
    }, []);

    // --- Core Measurement Functions (Refactored to be pure and accept progress callbacks) ---

    const measurePing = async (pingUrl, onProgress) => {
        let pings = [];
        const pingProgressIncrement = 100 / PING_COUNT;

        for (let i = 0; i < PING_COUNT; i++) {
            // Use AbortController for fetch timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
            
            const startTime = performance.now();
            try {
                // Unique URL to prevent caching
                await fetch(`${pingUrl}?r=${Math.random()}&t=${Date.now()}`, { 
                    method: 'GET', 
                    cache: 'no-store',
                    signal: controller.signal // Pass the abort signal to fetch
                });
                const endTime = performance.now();
                pings.push(endTime - startTime);
            } catch (error) {
                if (error.name === 'AbortError') {
                    console.error('Ping request timed out.');
                } else {
                    console.error('Ping request failed:', error);
                }
                pings.push(null); // Mark failed or timed-out ping
            } finally {
                // Important: clear the timeout to prevent it from firing after the fetch has completed
                clearTimeout(timeoutId);
            }
            
            onProgress( (i + 1) * pingProgressIncrement );
            // Add a small delay between pings
            if (i < PING_COUNT - 1) await new Promise(resolve => setTimeout(resolve, 200));
        }

        const validPings = pings.filter(p => p !== null);
        if (validPings.length > 0) {
            const avgPing = validPings.reduce((a, b) => a + b, 0) / validPings.length;
            return Math.round(avgPing);
        } else {
            throw new Error('Ping test failed for all attempts.');
        }
    };

    const measureDownload = async (downloadUrl, onProgress) => {
        const startTime = performance.now();
        try {
            const response = await fetch(`${downloadUrl}?size=${DOWNLOAD_SIZE_BYTES}&r=${Math.random()}&t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok || !response.body) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            let receivedLength = 0;
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedLength += value.length;
                onProgress((receivedLength / DOWNLOAD_SIZE_BYTES) * 100);
            }
            onProgress(100);

            const endTime = performance.now();
            const durationSeconds = (endTime - startTime) / 1000;
            if (durationSeconds <= 0 || receivedLength === 0) throw new Error('Download failed (zero duration or size)');

            const speedBps = (receivedLength * 8) / durationSeconds;
            return (speedBps / (1000 * 1000)).toFixed(2);
        } catch (error) {
            console.error(`Download failed:`, error);
            onProgress(0);
            throw error;
        }
    };

    const measureUpload = async (uploadUrl, onProgress) => {
        try {
            // Generate a client-side payload
            const payload = new Blob([new Uint8Array(UPLOAD_DATA_SIZE_BYTES)], { type: 'application/octet-stream' });
            onProgress(10); // Initial progress

            const startTime = performance.now();
            const response = await fetch(uploadUrl, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/octet-stream' }});
            onProgress(90); // Most of the time is the transfer

            const durationSeconds = (performance.now() - startTime) / 1000;
            if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
            if (durationSeconds <= 0) throw new Error('Upload test failed (zero duration)');

            const speedBps = (UPLOAD_DATA_SIZE_BYTES * 8) / durationSeconds;
            onProgress(100);
            return (speedBps / (1000 * 1000)).toFixed(2);
        } catch (error) {
            console.error('Upload test failed:', error);
            onProgress(0);
            throw error;
        }
    };


    // --- Main Test Orchestration ---
    const startAllTests = async () => {
        if (isTesting) return;
        setIsTesting(true);

        // Reset all results to pending state before starting
        const initialResults = SERVERS.map(s => ({ name: s.name, ping: '--', download: '--', upload: '--', status: 'pending' }));
        setTestResults(initialResults);
        setOverallProgress(0);

        // Loop through each server and test it sequentially
        for (let i = 0; i < SERVERS.length; i++) {
            const server = SERVERS[i];

            // Update status for the current server to 'testing'
            setTestResults(prev => prev.map((r, index) => index === i ? { ...r, status: 'testing' } : r));

            let finalPing = 'ERR', finalDownload = 'ERR', finalUpload = 'ERR';

            try {
                // PING
                setStatusMessage(`Pinging ${server.name}...`);
                finalPing = await measurePing(server.pingUrl, (p) => setCurrentTestProgress(p));
                setTestResults(prev => prev.map((r, idx) => idx === i ? { ...r, ping: finalPing } : r));
                await new Promise(res => setTimeout(res, 200));

                // DOWNLOAD
                setStatusMessage(`Downloading from ${server.name}...`);
                finalDownload = await measureDownload(server.downloadUrl, (p) => setCurrentTestProgress(p));
                setTestResults(prev => prev.map((r, idx) => idx === i ? { ...r, download: finalDownload } : r));
                await new Promise(res => setTimeout(res, 200));


                // UPLOAD
                setStatusMessage(`Uploading to ${server.name}...`);
                finalUpload = await measureUpload(server.uploadUrl, (p) => setCurrentTestProgress(p));
                setTestResults(prev => prev.map((r, idx) => idx === i ? { ...r, upload: finalUpload } : r));

                // Mark as complete
                setTestResults(prev => prev.map((r, index) => index === i ? { ...r, status: 'complete' } : r));

            } catch (error) {
                console.error(`Test failed for ${server.name}:`, error);
                setTestResults(prev => prev.map((r, index) => index === i ? { ...r, status: 'error' } : r));
            } finally {
                // Update overall progress after each server test completes or fails
                setOverallProgress(((i + 1) / SERVERS.length) * 100);
                setCurrentTestProgress(0);
            }
        }

        setIsTesting(false);
        setStatusMessage('All tests complete!');
    };
    
    // -- Render Helper for result rows
    const ResultRow = ({ result }) => {
        const isTestingThis = result.status === 'testing';
        const isComplete = result.status === 'complete';
        const isError = result.status === 'error';
        const isPending = result.status === 'pending';

        return (
             <div className={`grid grid-cols-4 items-center gap-4 p-4 rounded-lg transition-all duration-300 ${isTestingThis ? 'bg-sky-900/50' : 'bg-slate-800'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                        {isTestingThis && <SpinnerIcon />}
                        {isComplete && <CheckCircleIcon />}
                        {isError && <ExclamationTriangleIcon />}
                        {isPending && <div className="w-2 h-2 rounded-full bg-slate-600"></div>}
                    </div>
                    <span className="font-medium text-slate-300">{result.name}</span>
                </div>
                <div className="text-center">
                    <span className={`font-mono text-lg ${result.ping === 'ERR' ? 'text-red-400' : 'text-slate-200'}`}>{result.ping}</span>
                    <span className="text-xs text-slate-400 ml-1">ms</span>
                </div>
                <div className="text-center">
                    <span className={`font-mono text-lg ${result.download === 'ERR' ? 'text-red-400' : 'text-slate-200'}`}>{result.download}</span>
                    <span className="text-xs text-slate-400 ml-1">Mbps</span>
                </div>
                <div className="text-center">
                    <span className={`font-mono text-lg ${result.upload === 'ERR' ? 'text-red-400' : 'text-slate-200'}`}>{result.upload}</span>
                    <span className="text-xs text-slate-400 ml-1">Mbps</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-900 text-white flex items-center justify-center min-h-screen p-4" style={{fontFamily: "'Inter', sans-serif"}}>
            <div className="w-full max-w-2xl mx-auto">

                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-sky-400">Multi-Server Speed Test</h1>
                    <p className="text-slate-400 mt-2">Sequentially testing all available servers for a comprehensive overview.</p>
                </header>
                
                <div className="bg-slate-800/50 p-6 rounded-xl shadow-2xl w-full border border-slate-700/50">
                    {/* Results Header */}
                    <div className="grid grid-cols-4 gap-4 px-4 pb-2 border-b border-slate-700">
                        <h3 className="font-semibold text-slate-400 text-sm">Server</h3>
                        <h3 className="font-semibold text-slate-400 text-sm text-center">Ping</h3>
                        <h3 className="font-semibold text-slate-400 text-sm text-center">Download</h3>
                        <h3 className="font-semibold text-slate-400 text-sm text-center">Upload</h3>
                    </div>

                    {/* Results List */}
                    <div className="space-y-2 mt-4">
                        {testResults.map((result, index) => (
                            <ResultRow key={index} result={result} />
                        ))}
                    </div>
                </div>
                
                 {/* Controls and Progress Footer */}
                <div className="mt-8 bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
                     <div className="mb-4">
                         <p className={`text-center text-sky-300 h-5 transition-opacity duration-300 ${isTesting ? 'opacity-100' : 'opacity-0'}`}>{statusMessage}</p>
                         <div className={`w-full bg-slate-700 rounded-full h-2 mt-2 overflow-hidden ${isTesting ? 'opacity-100' : 'opacity-0'}`}>
                             <div className="bg-sky-500 h-2 rounded-full transition-all duration-300 ease-out" style={{ width: `${currentTestProgress}%` }}></div>
                         </div>
                     </div>

                     <div className="mb-4">
                         <div className="flex justify-between items-center mb-1">
                             <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                             <span className="text-sm font-medium text-slate-300">{Math.round(overallProgress)}%</span>
                         </div>
                          <div className="w-full bg-slate-700 rounded-full h-2.5">
                             <div className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${overallProgress}%` }}></div>
                         </div>
                     </div>

                    <button
                        onClick={startAllTests}
                        disabled={isTesting}
                        className="w-full mt-6 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-400/50 flex items-center justify-center transform active:scale-98"
                    >
                        {isTesting ? (
                            <>
                                <SpinnerIcon />
                                <span className="ml-3">Testing in Progress...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon />
                                <span>Start All Tests</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
