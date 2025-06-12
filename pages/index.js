import Head from 'next/head';
import { useState, useEffect } from 'react';

// Configuration
const PING_COUNT = 5;
const INITIAL_DOWNLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB for the initial test
const EXTENDED_DOWNLOAD_SIZE_MEDIUM_BYTES = 50 * 1024 * 1024; // 50MB
const EXTENDED_DOWNLOAD_SIZE_LARGE_BYTES = 250 * 1024 * 1024; // 100MB

// Thresholds for triggering extended tests (in Mbps)
const SPEED_THRESHOLD_FOR_MEDIUM_EXTENDED_MBPS = 50;
const SPEED_THRESHOLD_FOR_LARGE_EXTENDED_MBPS = 125;

const UPLOAD_API_URL = '/api/upload';
const UPLOAD_DATA_SIZE_BYTES = 4 * 1024 * 1024; // 5MB
const PING_API_URL = '/api/ping';
const DOWNLOAD_API_URL = '/api/download'; // Base URL, size will be a query param

export default function SpeedTestPage() {
    const [ping, setPing] = useState('--');
    const [downloadSpeed, setDownloadSpeed] = useState('--');
    const [uploadSpeed, setUploadSpeed] = useState('--');
    const [status, setStatus] = useState('Click "Start Test" to begin.');
    const [progress, setProgress] = useState(0);
    const [isTesting, setIsTesting] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [currentTest, setCurrentTest] = useState('');

    const resetMetrics = () => {
        setPing('--');
        setDownloadSpeed('--');
        setUploadSpeed('--');
        setStatus('Click "Start Test" to begin.');
        setProgress(0);
        setShowProgress(false);
        setCurrentTest('');
    };

    const measurePing = async () => {
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
                await fetch(`${PING_API_URL}?r=${Math.random()}&t=${Date.now()}`, { method: 'GET', cache: 'no-store' });
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

    // Generic download measurement function
    const performDownloadTest = async (downloadSizeBytes, testLabel) => {
        setCurrentTest(testLabel);
        setStatus(`Testing ${testLabel}...`);
        // setDownloadSpeed('...'); // Keep previous result visible during extended test setup
        setShowProgress(true);
        setProgress(0);

        const startTime = performance.now();
        let measuredSpeed = '--';

        try {
            const response = await fetch(`${DOWNLOAD_API_URL}?size=${downloadSizeBytes}&r=${Math.random()}&t=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok || !response.body) {
                throw new Error(`Server error for ${testLabel}: ${response.status} ${response.statusText}`);
            }
            
            const reader = response.body.getReader();
            let receivedLength = 0;
            
            while(true) {
                const {done, value} = await reader.read();
                if (done) break;
                receivedLength += value.length;
                const progressPercentage = Math.min(100, (receivedLength / downloadSizeBytes) * 100);
                setProgress(progressPercentage);
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
            measuredSpeed = 'ERR';
            setProgress(0);
            setStatus(`Error: ${error.message}`);
            throw error; // Re-throw to be caught by startTest
        }
    };


    const measureUpload = async () => {
        setCurrentTest('Upload');
        setStatus('Testing Upload...');
        setUploadSpeed('...');
        setShowProgress(true);
        setProgress(0);

        return new Promise((resolve, reject) => {
            const data = new Uint8Array(UPLOAD_DATA_SIZE_BYTES);
            for (let i = 0; i < UPLOAD_DATA_SIZE_BYTES; i++) {
                data[i] = Math.floor(Math.random() * 256);
            }
            const blob = new Blob([data]);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${UPLOAD_API_URL}?r=${Math.random()}&t=${Date.now()}`, true);
            
            const startTime = performance.now();

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentage = Math.min(100, (event.loaded / event.total) * 100);
                    setProgress(percentage);
                }
            };
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const endTime = performance.now();
                    const durationSeconds = (endTime - startTime) / 1000;
                    if (durationSeconds <= 0) {
                        setUploadSpeed('ERR');
                        setStatus('Error: Upload test failed.');
                        reject(new Error('Upload test failed (zero duration)'));
                        return;
                    }
                    const speedBps = (UPLOAD_DATA_SIZE_BYTES * 8) / durationSeconds;
                    const speedMbps = (speedBps / (1000 * 1000)).toFixed(2);
                    setUploadSpeed(speedMbps);
                    setProgress(100);
                    resolve();
                } else {
                    setUploadSpeed('ERR');
                    console.error('Upload failed with status:', xhr.status, xhr.statusText, xhr.responseText);
                    setStatus(`Error: Upload failed - ${xhr.statusText || 'Server error'}`);
                    reject(new Error(`Upload failed: ${xhr.statusText || 'Server error'} - ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => {
                setUploadSpeed('ERR');
                console.error('Upload network error');
                setProgress(0);
                setStatus('Error: Upload network error.');
                reject(new Error('Upload network error'));
            };
            
            xhr.send(blob);
        });
    };

    const startTest = async () => {
        if (isTesting) return;
        setIsTesting(true);
        resetMetrics();
        setStatus('Initializing test...');

        let finalDownloadSpeed = '--';

        try {
            await measurePing();
            await new Promise(resolve => setTimeout(resolve, 300));

            // Initial Download Test (10MB)
            const initialSpeed = await performDownloadTest(INITIAL_DOWNLOAD_SIZE_BYTES, 'Initial Download (10MB)');
            setDownloadSpeed(initialSpeed); // Display initial speed
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
                const extendedTestLabel = `Extended Download (${targetExtendedSize / (1024*1024)}MB)`;
                const extendedSpeed = await performDownloadTest(targetExtendedSize, extendedTestLabel);
                setDownloadSpeed(extendedSpeed); // Update with extended speed
                finalDownloadSpeed = extendedSpeed;
            }
            
            // Update status after download phase is fully complete
            if (finalDownloadSpeed !== 'ERR') {
                setStatus('Download test complete.');
            } else {
                // Error status would have been set by performDownloadTest
            }


            await new Promise(resolve => setTimeout(resolve, 300));
            await measureUpload();

            setStatus('Test Complete!');
            setCurrentTest('Complete');

        } catch (error) {
            console.error("Speed test sequence failed: ", error);
            // Error status should be set by individual test functions
            if (!status.startsWith('Error:')) {
                 setStatus(`Error: ${error.message}. Please try again.`);
            }
            setCurrentTest('Error');
        } finally {
            setIsTesting(false);
        }
    };

    const getProgressBarColor = () => {
        if (currentTest === 'Error') return 'bg-red-500';
        if (currentTest === 'Complete') return 'bg-green-500';
        return 'bg-sky-500';
    };

    return (
        <>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Internet Speed Test</title>
            <meta name="description" content="Measure your internet speed with HTML, Tailwind CSS, and plain JavaScript" />
            <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-gradient-to-br from-slate-900 to-slate-800">
        
            <div class="text-white flex items-center justify-center min-h-screen p-4">
                <div class="bg-slate-800 p-6 sm:p-10 rounded-xl shadow-2xl w-full max-w-lg border border-slate-700">
                    <header class="text-center mb-6">
                        <h1 class="text-3xl sm:text-4xl font-bold text-sky-400">Internet Speed Test</h1>
                        <p class="text-slate-400 mt-2 text-sm sm:text-base">Measure your connection speed.</p>
                    </header>
        
                    <div class="mb-8">
                        <label for="server-select" class="block mb-2 text-sm font-medium text-slate-400">Select Server</label>
                        <select id="server-select" class="bg-slate-700 border border-slate-600 text-white text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full p-2.5 transition duration-150 ease-in-out disabled:opacity-50"></select>
                    </div>
                    <div class="grid grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-10 text-center">
                        <div>
                            <p class="text-xs sm:text-sm text-slate-400 uppercase tracking-wider">Ping</p>
                            <p id="ping-value" class="text-2xl sm:text-3xl font-bold text-sky-400 transition-colors duration-300">--</p>
                            <p class="text-xs text-slate-500">ms</p>
                        </div>
                        <div>
                            <p class="text-xs sm:text-sm text-slate-400 uppercase tracking-wider">Download</p>
                            <p id="download-value" class="text-2xl sm:text-3xl font-bold text-sky-400 transition-colors duration-300">--</p>
                            <p class="text-xs text-slate-500">Mbps</p>
                        </div>
                        <div>
                            <p class="text-xs sm:text-sm text-slate-400 uppercase tracking-wider">Upload</p>
                            <p id="upload-value" class="text-2xl sm:text-3xl font-bold text-sky-400 transition-colors duration-300">--</p>
                            <p class="text-xs text-slate-500">Mbps</p>
                        </div>
                    </div>
                    <div class="mb-8 sm:mb-10 h-10 sm:h-12 flex flex-col justify-end">
                        <div id="progress-bar-container" class="w-full bg-slate-700 rounded-full h-2.5 mb-2 overflow-hidden hidden">
                            <div id="progress-bar" class="h-2.5 rounded-full transition-all duration-300 ease-out bg-sky-500" style="width: 0%"></div>
                        </div>
                        <p id="status-text" class="text-center text-sky-400 text-sm h-5 transition-colors duration-300">Select a server and click "Start Test".</p>
                    </div>
                    <button id="start-button" class="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 flex items-center justify-center transform hover:scale-102 active:scale-98">
                    </button>
        
                    <footer class="text-center mt-8 sm:mt-10">
                        <p class="text-xs text-slate-500">Powered by Vanilla JS & Tailwind CSS</p>
                    </footer>
                </div>
            </div>
        
        <script>
            // --- DOM ELEMENT SELECTION ---
            const pingValueEl = document.getElementById('ping-value');
            const downloadValueEl = document.getElementById('download-value');
            const uploadValueEl = document.getElementById('upload-value');
            const statusTextEl = document.getElementById('status-text');
            const progressBarEl = document.getElementById('progress-bar');
            const progressBarContainerEl = document.getElementById('progress-bar-container');
            const startButtonEl = document.getElementById('start-button');
            const serverSelectEl = document.getElementById('server-select');
            
            // --- SERVER CONFIGURATION ---
            // Add or remove servers from this list.
            // Note: For this demo, ping and download point to placeholder paths.
            // The upload URL is a real, public endpoint for testing.
            // In a real application, you would replace these with your own server endpoints.
            const SERVERS = [
                {
                    name: 'AWS',
                    pingUrl: '/api/ping',
                    downloadUrl: '/api/download',
                    uploadUrl: 'https://vha7zsy647pevemjz7qise7t3m0zvzvm.lambda-url.us-east-1.on.aws/'
                },
                {
                    name: 'Vercel',
                    pingUrl: 'https://speedtestjs.vercel.app/api/ping',
                    downloadUrl: 'https://speedtestjs.vercel.app/api/download',
                    uploadUrl: 'https://speedtestjs.vercel.app/api/upload'     },
                {
                    name: 'Render',
                    pingUrl: 'https://js.render.dyl.ovh/api/ping',
                    downloadUrl: 'https://js.render.dyl.ovh/api/download',
                    uploadUrl: 'https://js.render.dyl.ovh/upload'
                },
                {
                    name: 'Sydney Server',
                    pingUrl: 'https://js.syd.dyl.ovh/api/ping',
                    downloadUrl: 'https://js.syd.dyl.ovh/api/download',
                    uploadUrl: 'https://js.syd.dyl.ovh/api/upload'
                }
            ]
            
            // --- TEST CONFIGURATION ---
            const PING_COUNT = 5;
            const INITIAL_DOWNLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
            const EXTENDED_DOWNLOAD_SIZE_MEDIUM_BYTES = 50 * 1024 * 1024; // 50MB
            const EXTENDED_DOWNLOAD_SIZE_LARGE_BYTES = 100 * 1024 * 1024; // 100MB
            const SPEED_THRESHOLD_FOR_MEDIUM_EXTENDED_MBPS = 50;
            const SPEED_THRESHOLD_FOR_LARGE_EXTENDED_MBPS = 125;
            const UPLOAD_DATA_SIZE_BYTES = 4 * 1024 * 1024; // 4MB
            
            // --- STATE MANAGEMENT ---
            let state = {
                ping: '--',
                downloadSpeed: '--',
                uploadSpeed: '--',
                status: 'Select a server and click "Start Test".',
                progress: 0,
                isTesting: false,
                showProgress: false,
                currentTest: '',
            };
            
            // --- RENDER FUNCTION ---
            // A single function to update the UI based on the current state
            function render() {
                pingValueEl.textContent = state.ping;
                downloadValueEl.textContent = state.downloadSpeed;
                uploadValueEl.textContent = state.uploadSpeed;
                statusTextEl.textContent = state.status;
                progressBarEl.style.width = `${state.progress}%`;
            
                progressBarContainerEl.style.display = state.showProgress ? 'block' : 'hidden';
                
                // Toggle text colors based on results
                pingValueEl.classList.toggle('text-red-500', state.ping === 'ERR');
                pingValueEl.classList.toggle('text-sky-400', state.ping !== 'ERR');
                downloadValueEl.classList.toggle('text-red-500', state.downloadSpeed === 'ERR');
                downloadValueEl.classList.toggle('text-sky-400', state.downloadSpeed !== 'ERR');
                uploadValueEl.classList.toggle('text-red-500', state.uploadSpeed === 'ERR');
                uploadValueEl.classList.toggle('text-sky-400', state.uploadSpeed !== 'ERR');
                statusTextEl.classList.toggle('text-red-400', state.status.startsWith('Error:'));
                statusTextEl.classList.toggle('text-sky-400', !state.status.startsWith('Error:'));
            
                // Update progress bar color based on test status
                progressBarEl.classList.remove('bg-sky-500', 'bg-green-500', 'bg-red-500');
                if (state.currentTest === 'Error') {
                    progressBarEl.classList.add('bg-red-500');
                } else if (state.currentTest === 'Complete') {
                    progressBarEl.classList.add('bg-green-500');
                } else {
                    progressBarEl.classList.add('bg-sky-500');
                }
            
                // Update button state and content
                startButtonEl.disabled = state.isTesting;
                serverSelectEl.disabled = state.isTesting;
                if (state.isTesting) {
                    startButtonEl.innerHTML = `
                        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        ${state.currentTest ? `Testing ${state.currentTest}...` : 'Testing...'}`;
                } else {
                    startButtonEl.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 mr-2">
                            <path fill-rule="evenodd" d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" clip-rule="evenodd" />
                        </svg>
                        Start Test`;
                }
            }
            
            // --- LOGIC FUNCTIONS ---
            function populateServerList() {
                SERVERS.forEach((server, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = server.name;
                    serverSelectEl.appendChild(option);
                });
            }
            
            function resetMetrics() {
                state.ping = '--';
                state.downloadSpeed = '--';
                state.uploadSpeed = '--';
                state.status = 'Click "Start Test" to begin.';
                state.progress = 0;
                state.showProgress = false;
                state.currentTest = '';
                render();
            }
            
            async function measurePing(pingUrl) {
                state.currentTest = 'Ping';
                state.status = 'Testing Ping...';
                state.ping = '...';
                state.showProgress = true;
                state.progress = 0;
                render();
            
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
                    state.progress = Math.min(100, state.progress + pingProgressIncrement);
                    render();
                    if (i < PING_COUNT - 1) {
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                }
                
                const validPings = pings.filter(p => p !== null);
                if (validPings.length > 0) {
                    const avgPing = validPings.reduce((a, b) => a + b, 0) / validPings.length;
                    state.ping = Math.round(avgPing);
                } else {
                    state.ping = 'ERR';
                    state.status = 'Error: Ping test failed.';
                    render();
                    throw new Error('Ping test failed');
                }
                state.progress = 100;
                render();
            }
            
            
            async function performDownloadTest(downloadUrl, downloadSizeBytes, testLabel) {
                state.currentTest = testLabel;
                state.status = `Testing ${testLabel}...`;
                state.showProgress = true;
                state.progress = 0;
                render();
                
                const startTime = performance.now();
                let measuredSpeed = '--';
            
                try {
                    const response = await fetch(`${downloadUrl}?size=${downloadSizeBytes}&r=${Math.random()}&t=${Date.now()}`, { cache: 'no-store' });
                    if (!response.ok || !response.body) {
                        throw new Error(`Server error for ${testLabel}: ${response.status} ${response.statusText}`);
                    }
                    
                    const reader = response.body.getReader();
                    let receivedLength = 0;
                    
                    while(true) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        receivedLength += value.length;
                        state.progress = Math.min(100, (receivedLength / downloadSizeBytes) * 100);
                        render();
                    }
            
                    const endTime = performance.now();
                    const durationSeconds = (endTime - startTime) / 1000;
                    
                    if (durationSeconds <= 0 || receivedLength === 0) {
                        measuredSpeed = 'ERR';
                         throw new Error(`${testLabel} failed (zero duration or size)`);
                    }
            
                    const speedBps = (receivedLength * 8) / durationSeconds; 
                    measuredSpeed = (speedBps / (1000 * 1000)).toFixed(2);
                    state.progress = 100;
                    render();
                    return measuredSpeed;
            
                } catch (error) {
                    console.error(`${testLabel} failed:`, error);
                    state.downloadSpeed = 'ERR';
                    state.progress = 0;
                    state.status = `Error: ${error.message}`;
                    render();
                    throw error;
                }
            }
            
            
            async function measureUpload(uploadUrl) {
                state.currentTest = 'Upload';
                state.status = 'Testing Upload...';
                state.uploadSpeed = '...';
                state.showProgress = true;
                state.progress = 0;
                render();
            
                try {
                    // Generate a random payload for upload
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
            
                    state.uploadSpeed = speedMbps;
                    state.progress = 100;
                    render();
                    
                    } catch (error) {
                    console.error('Upload test failed:', error);
                    state.uploadSpeed = 'ERR';
                    state.status = `Error: ${error.message}`;
                    state.progress = 0;
                    render();
                    throw error;
                }
            }
            
            async function startTest() {
                if (state.isTesting) return;
            
                // Get the selected server
                const selectedServerIndex = serverSelectEl.value;
                const selectedServer = SERVERS[selectedServerIndex];
                if (!selectedServer) {
                    state.status = 'Error: Please select a valid server.';
                    render();
                    return;
                }
            
                state.isTesting = true;
                resetMetrics();
                state.status = `Initializing test with ${selectedServer.name}...`;
                render();
            
                let finalDownloadSpeed = '--';
            
                try {
                    await measurePing(selectedServer.pingUrl);
                    await new Promise(resolve => setTimeout(resolve, 300));
            
                    const initialSpeed = await performDownloadTest(selectedServer.downloadUrl, INITIAL_DOWNLOAD_SIZE_BYTES, 'Download (10MB)');
                    state.downloadSpeed = initialSpeed;
                    finalDownloadSpeed = initialSpeed;
                    render();
            
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
                        const extendedTestLabel = `Download (${targetExtendedSize / (1024*1024)}MB)`;
                        const extendedSpeed = await performDownloadTest(selectedServer.downloadUrl, targetExtendedSize, extendedTestLabel);
                        state.downloadSpeed = extendedSpeed;
                        finalDownloadSpeed = extendedSpeed;
                        render();
                    }
                    
                    if (finalDownloadSpeed !== 'ERR') {
                        state.status = 'Download test complete.';
                    }
                    render();
            
                    await new Promise(resolve => setTimeout(resolve, 300));
                    await measureUpload(selectedServer.uploadUrl);
            
                    state.status = 'Test Complete!';
                    state.currentTest = 'Complete';
                } catch (error) {
                    console.error("Speed test sequence failed: ", error);
                    if (!state.status.startsWith('Error:')) {
                        state.status = `Error: ${error.message}. Please try again.`;
                    }
                    state.currentTest = 'Error';
                } finally {
                    state.isTesting = false;
                    render();
                }
            }
        
                // --- INITIALIZATION ---
                // This function runs when the script loads
                function initialize() {
                    populateServerList();
                    startButtonEl.addEventListener('click', startTest);
                    render(); // Initial render to set the button text
                }
                
                // Start the application
                initialize();
            </script>
        </body>
    </html>

        </>
    );
}
