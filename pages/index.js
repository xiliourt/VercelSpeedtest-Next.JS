import { useState, useEffect } from 'react';

// --- ICONS (as SVG components for better control) ---
const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
    </svg>
);

const SpinnerIcon = () => (
    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-400">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);

const ExclamationTriangleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-red-400">
        <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
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
const PING_COUNT = 4;
const PING_TIMEOUT_MS = 2000;
const DOWNLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const UPLOAD_DATA_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

// --- Main App Component ---
export default function App() {
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

    // --- Core Measurement Functions (Logically unchanged, formatting added) ---

    const measurePing = async (pingUrl, onProgress) => {
        let pings = [];
        const pingProgressIncrement = 100 / PING_COUNT;
        for (let i = 0; i < PING_COUNT; i++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
            const startTime = performance.now();
            try {
                await fetch(`${pingUrl}?r=${Math.random()}&t=${Date.now()}`, { method: 'GET', cache: 'no-store', signal: controller.signal });
                const endTime = performance.now();
                pings.push(endTime - startTime);
            } catch (error) {
                if (error.name === 'AbortError') console.error('Ping request timed out.');
                else console.error('Ping request failed:', error);
                pings.push(null);
            } finally {
                clearTimeout(timeoutId);
            }
            onProgress((i + 1) * pingProgressIncrement);
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
            if (!response.ok || !response.body) throw new Error(`Server error: ${response.status} ${response.statusText}`);
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

    const measureUpload = (uploadUrl, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const startTime = performance.now();
            xhr.open('POST', `${uploadUrl}?r=${Math.random()}&t=${Date.now()}`, true);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
            };
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const durationSeconds = (performance.now() - startTime) / 1000;
                    if (durationSeconds <= 0) return reject(new Error('Upload test failed (zero duration)'));
                    const speedBps = (UPLOAD_DATA_SIZE_BYTES * 8) / durationSeconds;
                    onProgress(100);
                    resolve((speedBps / (1000 * 1000)).toFixed(2));
                } else {
                    onProgress(0);
                    reject(new Error(`Server responded with status: ${xhr.status}`));
                }
            };
            xhr.onerror = () => { onProgress(0); reject(new Error(`Upload failed due to a network error.`)); };
            xhr.onabort = () => { onProgress(0); reject(new Error('Upload test was aborted.')); };
            const payload = new Blob([new Uint8Array(UPLOAD_DATA_SIZE_BYTES)], { type: 'application/octet-stream' });
            xhr.send(payload);
        });
    };

    // --- Main Test Orchestration ---
    const startAllTests = async () => {
        if (isTesting) return;
        setIsTesting(true);
        const initialResults = SERVERS.map(s => ({ name: s.name, ping: '--', download: '--', upload: '--', status: 'pending' }));
        setTestResults(initialResults);
        setOverallProgress(0);

        for (let i = 0; i < SERVERS.length; i++) {
            const server = SERVERS[i];
            setTestResults(prev => prev.map((r, index) => index === i ? { ...r, status: 'testing' } : r));
            let finalPing = 'ERR', finalDownload = 'ERR', finalUpload = 'ERR';

            try {
                setStatusMessage(`Pinging ${server.name}...`);
                finalPing = await measurePing(server.pingUrl, (p) => setCurrentTestProgress(p));
                setTestResults(prev => prev.map((r, idx) => idx === i ? { ...r, ping: finalPing } : r));
                await new Promise(res => setTimeout(res, 200));

                setStatusMessage(`Downloading from ${server.name}...`);
                finalDownload = await measureDownload(server.downloadUrl, (p) => setCurrentTestProgress(p));
                setTestResults(prev => prev.map((r, idx) => idx === i ? { ...r, download: finalDownload } : r));
                await new Promise(res => setTimeout(res, 200));

                setStatusMessage(`Uploading to ${server.name}...`);
                finalUpload = await measureUpload(server.uploadUrl, (p) => setCurrentTestProgress(p));
                setTestResults(prev => prev.map((r, idx) => idx === i ? { ...r, upload: finalUpload } : r));
                setTestResults(prev => prev.map((r, index) => index === i ? { ...r, status: 'complete' } : r));
            } catch (error) {
                console.error(`Test failed for ${server.name}:`, error);
                setTestResults(prev => prev.map((r, index) => index === i ? { ...r, status: 'error' } : r));
            } finally {
                setOverallProgress(((i + 1) / SERVERS.length) * 100);
                setCurrentTestProgress(0);
            }
        }
        setIsTesting(false);
        setStatusMessage('All tests complete!');
    };

    // --- Result Row Sub-component for better organization ---
    const ResultRow = ({ result }) => {
        const isTestingThis = result.status === 'testing';
        const isComplete = result.status === 'complete';
        const isError = result.status === 'error';
        const isPending = result.status === 'pending';
        
        const rowBg = isTestingThis ? 'bg-sky-900/50' : 'bg-slate-800/60';

        return (
            <div className={`rounded-xl transition-all duration-300 ${rowBg} hover:bg-slate-700/60 transform hover:scale-[1.02]`}>
                <div className="flex flex-col md:flex-row md:items-center p-3 md:p-4">
                    {/* Server Name & Status */}
                    <div className="flex items-center justify-between md:w-1/3 lg:w-2/5 md:pr-4">
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                                {isTestingThis && <SpinnerIcon />}
                                {isComplete && <CheckCircleIcon />}
                                {isError && <ExclamationTriangleIcon />}
                                {isPending && <div className="w-3 h-3 rounded-full bg-slate-600 border-2 border-slate-500"></div>}
                            </div>
                            <span className="font-semibold text-slate-200 truncate">{result.name}</span>
                        </div>
                    </div>

                    {/* Stats container (grid on mobile, flex on desktop) */}
                    <div className="mt-3 md:mt-0 grid grid-cols-3 gap-2 md:flex md:w-2/3 lg:w-3/5 md:justify-around">
                        {['ping', 'download', 'upload'].map(statType => {
                            const value = result[statType];
                            const unit = statType === 'ping' ? 'ms' : 'Mbps';
                            const label = statType.charAt(0).toUpperCase() + statType.slice(1);
                            
                            return (
                                <div key={statType} className="text-center bg-slate-900/50 md:bg-transparent p-2 rounded-lg md:p-0 md:w-1/3">
                                    <span className="text-xs font-bold tracking-wider text-slate-400 md:hidden">{label}</span>
                                    <div className="mt-1 md:mt-0">
                                        <span className={`font-mono text-lg md:text-xl font-bold ${value === 'ERR' ? 'text-red-400' : 'text-slate-100'}`}>{value}</span>
                                        <span className="text-sm text-slate-400 ml-1">{value !== '--' && value !== 'ERR' ? unit : ''}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Render Block ---
    return (
        <div className="bg-slate-900 text-white flex items-center justify-center min-h-screen p-2 sm:p-4 bg-grid-slate-800/[0.2]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="w-full max-w-3xl mx-auto">
                <header className="text-center mb-6 md:mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-cyan-300 py-2">
                        Multi-Server Speed Test
                    </h1>
                    <p className="text-slate-400 mt-1 text-base md:text-lg">Test your connection speed against multiple global servers.</p>
                </header>

                {/* Main Results Panel */}
                <div className="bg-slate-800/60 p-3 md:p-4 rounded-2xl shadow-2xl w-full border border-slate-700/80 backdrop-blur-xl">
                    {/* -- DESKTOP-ONLY Results Header -- */}
                    <div className="hidden md:flex px-4 pb-3 border-b border-slate-700">
                        <h3 className="font-bold text-slate-300 text-sm w-1/3 lg:w-2/5">Server</h3>
                        <div className="flex w-2/3 lg:w-3/5 justify-around">
                            <h3 className="font-bold text-slate-300 text-sm w-1/3 text-center">Ping</h3>
                            <h3 className="font-bold text-slate-300 text-sm w-1/3 text-center">Download</h3>
                            <h3 className="font-bold text-slate-300 text-sm w-1/3 text-center">Upload</h3>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-2 mt-2 md:mt-3">
                        {testResults.map((result, index) => (
                            <ResultRow key={index} result={result} />
                        ))}
                    </div>
                </div>

                {/* Controls and Progress Footer */}
                <div className="mt-6 md:mt-8">
                    {/* Current Test Progress */}
                    <div className={`transition-opacity duration-300 h-10 ${isTesting ? 'opacity-100' : 'opacity-0'}`}>
                         <p className="text-center text-sky-300/80 text-sm h-5">{statusMessage}</p>
                         <div className="w-full bg-slate-700/50 rounded-full h-1.5 mt-1 overflow-hidden">
                             <div className="bg-gradient-to-r from-sky-500 to-cyan-400 h-1.5 rounded-full transition-all duration-300 ease-linear" style={{ width: `${currentTestProgress}%` }}></div>
                         </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-slate-300">Overall Progress</span>
                            <span className="text-sm font-medium text-slate-300">{Math.round(overallProgress)}%</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2.5">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${overallProgress}%` }}></div>
                        </div>
                    </div>
                    
                    {/* Start Button */}
                    <button
                        onClick={startAllTests}
                        disabled={isTesting}
                        className="w-full mt-4 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-400/50 flex items-center justify-center transform active:scale-98 shadow-lg hover:shadow-sky-500/20"
                    >
                        {isTesting ? (
                            <>
                                <SpinnerIcon />
                                <span className="ml-3 text-lg">Testing in Progress...</span>
                            </>
                        ) : (
                            <>
                                <PlayIcon />
                                <span className="ml-2 text-lg">Start All Tests</span>
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}
