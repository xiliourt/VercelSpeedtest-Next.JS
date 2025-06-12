import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';

// --- SERVER CONFIGURATION ---
const SERVERS = [
    {
        name: 'AWS',
        pingUrl: 'https://js.aws.dyl.ovh/api/ping',
        downloadUrl: 'https://js.aws.dyl.ovh/api/download',
        uploadUrl: 'https://vha7zsy647pevemjz7qise7t3m0zvzvm.lambda-url.us-east-1.on.aws/'
    },
    {
        name: 'Vercel',
        pingUrl: 'https://speedtestjs.vercel.app/api/ping',
        downloadUrl: 'https://speedtestjs.vercel.app/api/download',
        uploadUrl: 'https://speedtestjs.vercel.app/api/upload'
    },
    {
        name: 'Render',
        pingUrl: 'https://js.render.dyl.ovh/api/ping',
        downloadUrl: 'https://js.render.dyl.ovh/api/download',
        uploadUrl: 'https://js.render.dyl.ovh/api/upload'
    },
    {
        name: 'Netlify',
        pingUrl: 'https://js.netlify.dyl.ovh/api/ping',
        downloadUrl: 'https://js.netlify.dyl.ovh/api/download',
        uploadUrl: 'https://js.netlify.dyl.ovh/api/upload'
    },
    {
        name: 'Cloudflare Pages',
        pingUrl: 'https://js.cf.dyl.ovh/api/ping',
        downloadUrl: 'https://js.cf.dyl.ovh/api/download',
        uploadUrl: 'https://js.cf.dyl.ovh/api/upload'
    },
    {
        name: 'Sydney Server',
        pingUrl: 'https://js.syd.dyl.ovh/api/ping',
        downloadUrl: 'https://js.syd.dyl.ovh/api/download',
        uploadUrl: 'https://js.syd.dyl.ovh/api/upload'
    }
];

// --- TEST CONFIGURATION ---
const PING_COUNT = 5;
const INITIAL_DOWNLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const EXTENDED_DOWNLOAD_SIZE_MEDIUM_BYTES = 50 * 1024 * 1024; // 50MB
const EXTENDED_DOWNLOAD_SIZE_LARGE_BYTES = 100 * 1024 * 1024; // 100MB
const SPEED_THRESHOLD_FOR_MEDIUM_EXTENDED_MBPS = 50;
const SPEED_THRESHOLD_FOR_LARGE_EXTENDED_MBPS = 125;
const UPLOAD_DATA_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export default function InternetSpeedTest() {
    const [ping, setPing] = useState('--');
    const [downloadSpeed, setDownloadSpeed] = useState('--');
    const [uploadSpeed, setUploadSpeed] = useState('--');
    const [status, setStatus] = useState('Select a server and click "Start Test".');
    const [progress, setProgress] = useState(0);
    const [isTesting, setIsTesting] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [currentTest, setCurrentTest] = useState('');
    const [selectedServerIndex, setSelectedServerIndex] = useState(0);

    const serverSelectEl = useRef(null);

    const resetMetrics = () => {
        setPing('--');
        setDownloadSpeed('--');
        setUploadSpeed('--');
        setStatus('Click "Start Test" to begin.');
        setProgress(0);
        setShowProgress(false);
        setCurrentTest('');
    };

    const measurePing = async (pingUrl) => {
        setCurrentTest('Ping');
        setStatus('Testing Ping...');
        setPing('...');
        setShowProgress(true);
        setProgress(0);

        let pings = [];
        const pingProgressIncrement = 100 / PING_COUNT;

        for (let i = 0; i < PING_COUNT; i++) {
            const startTime = performance.now();
            try {
                await fetch(`${pingUrl}?r=${Math.random()}&t=${Date.now()}`, { method: 'GET', cache: 'no-store' });
                const endTime = performance.now();
                pings.push(endTime - startTime);
            } catch (error) {
                console.error('Ping request failed:', error);
                pings.push(null);
            }
            setProgress(prev => Math.min(100, prev + pingProgressIncrement));
            if (i < PING_COUNT - 1) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        const validPings = pings.filter(p => p !== null);
        if (validPings.length > 0) {
            const avgPing = validPings.reduce((a, b) => a + b, 0) / validPings.length;
            setPing(Math.round(avgPing));
        } else {
            setPing('ERR');
            setStatus('Error: Ping test failed.');
            throw new Error('Ping test failed');
        }
        setProgress(100);
    };

    const performDownloadTest = async (downloadUrl, downloadSizeBytes, testLabel) => {
        setCurrentTest(testLabel);
        setStatus(`Testing ${testLabel}...`);
        setShowProgress(true);
        setProgress(0);

        const startTime = performance.now();
        let measuredSpeed = '--';

        try {
            const response = await fetch(`${downloadUrl}?size=${downloadSizeBytes}&r=${Math.random()}&t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok || !response.body) {
                throw new Error(`Server error for ${testLabel}: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedLength += value.length;
                setProgress(Math.min(100, (receivedLength / downloadSizeBytes) * 100));
            }

            const endTime = performance.now();
            const durationSeconds = (endTime - startTime) / 1000;

            if (durationSeconds <= 0 || receivedLength === 0) {
                measuredSpeed = 'ERR';
                throw new Error(`${testLabel} failed (zero duration or size)`);
            }

            const speedBps = (receivedLength * 8) / durationSeconds;
            measuredSpeed = (speedBps / (1000 * 1000)).toFixed(2);
            setProgress(100);
            return measuredSpeed;

        } catch (error) {
            console.error(`${testLabel} failed:`, error);
            setDownloadSpeed('ERR');
            setProgress(0);
            setStatus(`Error: ${error.message}`);
            throw error;
        }
    };

    const measureUpload = async (uploadUrl) => {
        setCurrentTest('Upload');
        setStatus('Testing Upload...');
        setUploadSpeed('...');
        setShowProgress(true);
        setProgress(0);

        try {
            const randomData = new Uint8Array(UPLOAD_DATA_SIZE_BYTES);
            for (let i = 0; i < UPLOAD_DATA_SIZE_BYTES; i++) {
                randomData[i] = Math.floor(Math.random() * 256);
            }
            const payload = new Blob([randomData], { type: 'application/octet-stream' });

            const startTime = Date.now();
            const response = await fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/octet-stream'
                },
                body: payload,
            });

            const duration = (Date.now() - startTime) / 1000;

            if (!response.ok) {
                throw new Error(`Server responded with status: ${response.status}`);
            }

            if (duration <= 0) {
                throw new Error('Upload test failed (zero duration).');
            }

            const speedBps = (UPLOAD_DATA_SIZE_BYTES * 8) / duration;
            const speedMbps = (speedBps / (1000 * 1000)).toFixed(2);

            setUploadSpeed(speedMbps);
            setProgress(100);

        } catch (error) {
            console.error('Upload test failed:', error);
            setUploadSpeed('ERR');
            setStatus(`Error: ${error.message}`);
            setProgress(0);
            throw error;
        }
    };

    const startTest = async () => {
        if (isTesting) return;

        const selectedServer = SERVERS[selectedServerIndex];
        if (!selectedServer) {
            setStatus('Error: Please select a valid server.');
            return;
        }

        setIsTesting(true);
        resetMetrics();
        setStatus(`Initializing test with ${selectedServer.name}...`);

        let finalDownloadSpeed = '--';

        try {
            await measurePing(selectedServer.pingUrl);
            await new Promise(resolve => setTimeout(resolve, 300));

            const initialSpeed = await performDownloadTest(selectedServer.downloadUrl, INITIAL_DOWNLOAD_SIZE_BYTES, 'Download (10MB)');
            setDownloadSpeed(initialSpeed);
            finalDownloadSpeed = initialSpeed;


            let targetExtendedSize = 0;
            if (initialSpeed !== 'ERR') {
                const initialSpeedNum = parseFloat(initialSpeed);
                if (initialSpeedNum > SPEED_THRESHOLD_FOR_LARGE_EXTENDED_MBPS) {
                    targetExtendedSize = EXTENDED_DOWNLOAD_SIZE_LARGE_BYTES;
                } else if (initialSpeedNum > SPEED_THRESHOLD_FOR_MEDIUM_EXTENDED_MBPS) {
                    targetExtendedSize = EXTENDED_DOWNLOAD_SIZE_MEDIUM_BYTES;
                }
            }

            if (targetExtendedSize > 0) {
                await new Promise(resolve => setTimeout(resolve, 300));
                const extendedTestLabel = `Download (${targetExtendedSize / (1024 * 1024)}MB)`;
                const extendedSpeed = await performDownloadTest(selectedServer.downloadUrl, targetExtendedSize, extendedTestLabel);
                setDownloadSpeed(extendedSpeed);
                finalDownloadSpeed = extendedSpeed;
            }

            if (finalDownloadSpeed !== 'ERR') {
                setStatus('Download test complete.');
            }

            await new Promise(resolve => setTimeout(resolve, 300));
            await measureUpload(selectedServer.uploadUrl);

            setStatus('Test Complete!');
            setCurrentTest('Complete');
        } catch (error) {
            console.error("Speed test sequence failed: ", error);
            if (!status.startsWith('Error:')) {
                setStatus(`Error: ${error.message}. Please try again.`);
            }
            setCurrentTest('Error');
        } finally {
            setIsTesting(false);
        }
    };

    return (
        <>
            <Head>
                <title>Internet Speed Test</title>
                <meta name="description" content="Measure your internet speed with Next.js and Tailwind CSS" />
            </Head>
            <div className="text-white flex items-center justify-center min-h-screen p-4">
                <div className="bg-slate-800 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
                    <header className="text-center mb-6">
                        <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Internet Speed Test</h1>
                        <p className="text-slate-400 mt-2 text-sm sm:text-base">Measure your connection speed.</p>
                    </header>

                    <div className="mb-8">
                        <label htmlFor="server-select" className="block mb-2 text-sm font-medium text-slate-400">Select Server</label>
                        <select
                            id="server-select"
                            ref={serverSelectEl}
                            onChange={(e) => setSelectedServerIndex(e.target.value)}
                            disabled={isTesting}
                            className="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5 transition duration-150 ease-in-out disabled:opacity-50"
                        >
                            {SERVERS.map((server, index) => (
                                <option key={index} value={index}>{server.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10 text-center">
                        <div>
                            <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider">Ping</p>
                            <p className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${ping === 'ERR' ? 'text-red-500' : 'text-sky-400'}`}>{ping}</p>
                            <p className="text-xs text-slate-500">ms</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider">Download</p>
                            <p className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${downloadSpeed === 'ERR' ? 'text-red-500' : 'text-sky-400'}`}>{downloadSpeed}</p>
                            <p className="text-xs text-slate-500">Mbps</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-slate-400 uppercase tracking-wider">Upload</p>
                            <p className={`text-2xl sm:text-3xl font-bold transition-colors duration-300 ${uploadSpeed === 'ERR' ? 'text-red-500' : 'text-sky-400'}`}>{uploadSpeed}</p>
                            <p className="text-xs text-slate-500">Mbps</p>
                        </div>
                    </div>

                    <div className="mb-8 sm:mb-10 h-10 sm:h-12 flex flex-col justify-end">
                        <div className={`w-full bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden ${showProgress ? 'block' : 'hidden'}`}>
                            <div
                                className={`h-2.5 rounded-full transition-all duration-300 ease-out ${currentTest === 'Error' ? 'bg-red-500' : currentTest === 'Complete' ? 'bg-green-500' : 'bg-sky-500'}`}
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <p className={`text-center text-sm h-5 transition-colors duration-300 ${status.startsWith('Error:') ? 'text-red-400' : 'text-sky-400'}`}>{status}</p>
                    </div>

                    <button
                        onClick={startTest}
                        disabled={isTesting}
                        className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 flex items-center justify-center transform hover:scale-102 active:scale-98"
                    >
                        {isTesting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {currentTest ? `Testing ${currentTest}...` : 'Testing...'}
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                                    <path fillRule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clipRule="evenodd" />
                                </svg>
                                Start Test
                            </>
                        )}
                    </button>

                    <footer className="text-center mt-8 sm:mt-10">
                        <p className="text-xs text-slate-500">Powered by Next.js & Tailwind CSS</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
