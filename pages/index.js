import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

export const metadata = { icons: { icon: '/icon.png' } }

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

const CheckboxCheckedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-sky-400">
        <path fillRule="evenodd" d="M8.25 12a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V13.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M12.75 12a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V13.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>
);

const CheckboxUncheckedIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-slate-500 hover:text-slate-400">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

// --- **NEW** Icon for the download button ---
const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path fillRule="evenodd" d="M12 2.25a.75.75 0 0 1 .75.75v11.69l3.22-3.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06 0l-4.5-4.5a.75.75 0 1 1 1.06-1.06l3.22 3.22V3a.75.75 0 0 1 .75-.75Zm-9 13.5a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
    </svg>
);


// --- SERVER CONFIGURATION ---
const SERVERS = require('../components/servers.js');

// --- TEST CONFIGURATION ---
const PING_COUNT = 10;
const PING_TIMEOUT_MS = 2000;
const INITIAL_DOWNLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const LARGE_DOWNLOAD_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
const SUPER_DOWNLOAD_SIZE_BYTES = 100 * 1024 * 1024; // 50MB
const INITIAL_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const LARGE_UPLOAD_SIZE_BYTES = 25 * 1024 * 1024; // 25MB
const FAST_CONNECTION_THRESHOLD_MBPS = 50;
const SUPER_CONNECTION_THRESHOLD_MBPS = 200;
const FAST_CONNECTION_THRESHOLD_UP_MBPS = 10;

// --- Main App Component ---
export default function App() {
    const [testResults, setTestResults] = useState([]);
    const [isTesting, setIsTesting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Select servers and click "Start Tests" to begin.');
    const [currentTestProgress, setCurrentTestProgress] = useState(0);
    const [overallProgress, setOverallProgress] = useState(0);
    const [selectedServers, setSelectedServers] = useState(() => new Set(SERVERS.map(s => s.name)));
    
    // --- **NEW**: Ref for the element to screenshot ---
    const resultsPanelRef = useRef(null);

    useEffect(() => {
        setTestResults(SERVERS.map(s => ({
            name: s.name,
            ping: '--',
            download: '--',
            upload: '--',
            status: 'pending'
        })));
    }, []);

    const handleToggleServer = (serverName) => {
        if (isTesting) return;
        setSelectedServers(prevSelected => {
            const newSelected = new Set(prevSelected);
            if (newSelected.has(serverName)) {
                newSelected.delete(serverName);
            } else {
                newSelected.add(serverName);
            }
            return newSelected;
        });
    };

    // --- **NEW**: Screenshot download handler ---
    const handleDownloadScreenshot = async () => {
        if (!resultsPanelRef.current) {
            console.error("Results panel ref not found!");
            return;
        }

        try {
            const canvas = await html2canvas(resultsPanelRef.current, {
                backgroundColor: '#1e293b', // Match the panel's background
                useCORS: true, // Important for external resources if any
                scale: 2 // Increase resolution for better quality
            });
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `speedtest-results-${new Date().toISOString().slice(0, 10)}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Oops, something went wrong!", error);
            // Optionally, update status message to inform user of the error
            setStatusMessage("Could not capture screenshot.");
        }
    };
    
    // --- Core Measurement Functions (unchanged) ---
    const measurePing = async (pingUrl, onProgress) => {
        let pings = [];
        const pingProgressIncrement = 100 / PING_COUNT;
        await fetch(`${pingUrl}`, { method: 'GET', cache: 'no-store' });
        for (let i = 0; i < PING_COUNT; i++) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PING_TIMEOUT_MS);
            const startTime = performance.now();
            try {
                await fetch(`${pingUrl}`, { method: 'GET', cache: 'no-store', signal: controller.signal });
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

    const measureDownload = async (downloadUrl, downloadSize, onProgress) => {
        const startTime = performance.now();
        try {
            const response = await fetch(`${downloadUrl}?size=${downloadSize}`);
            if (!response.ok || !response.body) throw new Error(`Server error: ${response.status} ${response.statusText}`);
            
            const reader = response.body.getReader();
            let receivedLength = 0;
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                receivedLength += value.length;
                onProgress((receivedLength / downloadSize) * 100);
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

    const measureUpload = (uploadUrl, uploadsize, onProgress) => {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const startTime = performance.now();
            xhr.open('POST', `${uploadUrl}`, true);
            xhr.setRequestHeader('Content-Type', 'application/octet-stream');
            
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
            };
            
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const durationSeconds = (performance.now() - startTime) / 1000;
                    if (durationSeconds <= 0) return reject(new Error('Upload test failed (zero duration)'));
                    const speedBps = (uploadsize * 8) / durationSeconds;
                    onProgress(100);
                    resolve((speedBps / (1000 * 1000)).toFixed(2));
                } else {
                    onProgress(0);
                    reject(new Error(`Server responded with status: ${xhr.status}`));
                }
            };
            
            xhr.onerror = () => { onProgress(0); reject(new Error(`Upload failed due to a network error.`)); };
            xhr.onabort = () => { onProgress(0); reject(new Error('Upload test was aborted.')); };
            
            const payload = new Blob([new Uint8Array(uploadsize)], { type: 'application/octet-stream' });
            xhr.send(payload);
        });
    };

    const startAllTests = async () => {
        if (isTesting) return;
        
        const serversToTest = SERVERS.filter(s => selectedServers.has(s.name));
        
        if (serversToTest.length === 0) {
            setStatusMessage("Please select at least one server to test.");
            return;
        }

        setIsTesting(true);
        setTestResults(prevResults => prevResults.map(res => {
            if (selectedServers.has(res.name)) {
                return { ...res, ping: '--', download: '--', upload: '--', status: 'pending' };
            }
            return res;
        }));
        setOverallProgress(0);

        for (let i = 0; i < serversToTest.length; i++) {
            const server = serversToTest[i];
            const originalIndex = SERVERS.findIndex(s => s.name === server.name);

            setTestResults(prev => prev.map((r, index) => index === originalIndex ? { ...r, status: 'testing' } : r));
            
            let finalDownload = 'ERR', finalUpload = 'ERR';

            try {
                // Ping
                setStatusMessage(`Pinging ${server.name}...`);
                try {
                    const finalPing = await measurePing(server.pingUrl, (p) => setCurrentTestProgress(p));
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, ping: finalPing } : r));
                } catch (error) {
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, ping: 'ERR', status: 'error' } : r));
                    console.error(`Ping test failed for ${server.name}:`, error);
                    continue;
                }
                
                await new Promise(res => setTimeout(res, 200));

                // Download Test
                setStatusMessage(`Downloading ${INITIAL_DOWNLOAD_SIZE_BYTES / 1024 / 1024}MB from ${server.name}...`);
                try {
                    finalDownload = await measureDownload(server.downloadUrl, INITIAL_DOWNLOAD_SIZE_BYTES, (p) => setCurrentTestProgress(p));
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, download: finalDownload } : r));
                    
                    if (parseFloat(finalDownload) > SUPER_CONNECTION_THRESHOLD_MBPS) {
                        setStatusMessage(`Downloading ${SUPER_DOWNLOAD_SIZE_BYTES / 1024 / 1024}MB from ${server.name}...`);
                        const finalDownloadSuper = await measureDownload(server.downloadUrl, SUPER_DOWNLOAD_SIZE_BYTES, (p) => setCurrentTestProgress(p));
                        setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, download: Math.max(parseFloat(finalDownloadSuper), parseFloat(finalDownload))} : r));
                    } else if (parseFloat(finalDownload) > FAST_CONNECTION_THRESHOLD_MBPS) {
                        setStatusMessage(`Downloading ${LARGE_DOWNLOAD_SIZE_BYTES / 1024 / 1024}MB from ${server.name}...`);
                        const finalDownloadLarge = await measureDownload(server.downloadUrl, LARGE_DOWNLOAD_SIZE_BYTES, (p) => setCurrentTestProgress(p));
                        if (parseFloat(finalDownloadLarge) > SUPER_CONNECTION_THRESHOLD_MBPS) {
                            setStatusMessage(`Downloading ${SUPER_DOWNLOAD_SIZE_BYTES / 1024 / 1024}MB from ${server.name}...`);
                            const finalDownloadSuper = await measureDownload(server.downloadUrl, SUPER_DOWNLOAD_SIZE_BYTES, (p) => setCurrentTestProgress(p));
                            setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, download: Math.max(parseFloat(finalDownloadSuper), parseFloat(finalDownloadLarge), parseFloat(finalDownload))} : r));
                        } else {
                            setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, download: Math.max(parseFloat(finalDownloadLarge), parseFloat(finalDownload))} : r));
                        }
                    }
                } catch(error) {
                    console.error(`Download test failed for ${server.name}:`, error);
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, download: 'ERR', status: 'error' } : r));
                }
                
                await new Promise(res => setTimeout(res, 200));

                // Upload Test
                const initialUploadSize = Math.min(INITIAL_UPLOAD_SIZE_BYTES, server.maxUpload);

                if (initialUploadSize == 0) {
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, upload: 'Disabled', status: 'complete' } : r));
                    return r;
                }
                setStatusMessage(`Uploading ${initialUploadSize / 1024 / 1024}MB to ${server.name}...`);
                try {
                    finalUpload = await measureUpload(server.uploadUrl, initialUploadSize, (p) => setCurrentTestProgress(p));
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, upload: finalUpload } : r));
                    
                    if (parseFloat(finalUpload) > FAST_CONNECTION_THRESHOLD_UP_MBPS && server.maxUpload > LARGE_UPLOAD_SIZE_BYTES) {
                         setStatusMessage(`Uploading ${LARGE_UPLOAD_SIZE_BYTES / 1024 / 1024}MB to ${server.name}...`);
                         const finalUploadLarge = await measureUpload(server.uploadUrl, LARGE_UPLOAD_SIZE_BYTES, (p) => setCurrentTestProgress(p));
                         if (parseFloat(finalUploadLarge) > parseFloat(finalUpload) ) {
                              setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, upload: finalUploadLarge } : r));
                         }
                    }
                } catch (error) {
                    console.error(`Upload test failed for ${server.name}:`, error);
                    setTestResults(prev => prev.map((r, idx) => idx === originalIndex ? { ...r, upload: 'ERR', status: 'error' } : r));
                }

                setTestResults(prev => prev.map((r, idx) => {
                    if (idx === originalIndex && r.status !== 'error') {
                        return { ...r, status: 'complete' };
                    }
                    return r;
                }));

            } catch (error) {
                console.error(`Test failed for ${server.name}:`, error);
                setTestResults(prev => prev.map((r, index) => index === originalIndex ? { ...r, status: 'error' } : r));
            } finally {
                setOverallProgress(((i + 1) / serversToTest.length) * 100);
                setCurrentTestProgress(0);
            }
        };
        setIsTesting(false);
        setStatusMessage('All selected tests complete!');
    };

    const ResultRow = ({ result, isSelected, onToggle, isTestingGlobal }) => {
        const isTestingThis = result.status === 'testing';
        const isComplete = result.status === 'complete';
        const isError = result.status === 'error';
        
        const rowBg = isTestingThis ? 'bg-sky-900/50' : 'bg-slate-800/60';

        const StatusIcon = () => {
            if (isTestingThis) return <SpinnerIcon />;
            if (isComplete) return <CheckCircleIcon />;
            if (isError) return <ExclamationTriangleIcon />;
            if (isSelected) return <CheckboxCheckedIcon />;
            return <CheckboxUncheckedIcon />;
        };

        return (
            <div className={`rounded-xl transition-all duration-300 ${rowBg} hover:bg-slate-700/60 transform hover:scale-[1.02]`}>
                <div className="flex flex-col md:flex-row md:items-center p-3 md:p-4">
                    {/* Server Name & Status */}
                    <div className="flex items-center justify-between md:w-1/3 lg:w-2/5 md:pr-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => onToggle(result.name)}
                                disabled={isTestingGlobal}
                                className="flex-shrink-0 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500/50 disabled:cursor-not-allowed transition-transform active:scale-90"
                            >
                                <StatusIcon />
                            </button>
                            <span className="font-semibold text-slate-200 truncate">{result.name}</span>
                        </div>
                    </div>

                    {/* Stats container */}
                    <div className="mt-3 md:mt-0 grid grid-cols-3 gap-2 md:flex md:w-2/3 lg:w-3/5 md:justify-around">
                        {['ping', 'download', 'upload'].map(statType => {
                            const value = result[statType];
                            const unit = statType === 'ping' ? 'ms' : 'Mbps';
                            const label = statType.charAt(0).toUpperCase() + statType.slice(1);
                            
                            return (
                                <div key={statType} className="text-center bg-slate-900/50 md:bg-transparent p-2 rounded-lg md:p-0 md:w-1/3">
                                    <span className="text-xs font-bold tracking-wider text-slate-400 md:hidden">{label}</span>
                                    <div className="mt-1 md:mt-0">
                                        <span className={`font-mono text-lg md:text-xl font-bold ${value === 'ERR' && value === 'Disabled' ?  'text-red-400' : 'text-slate-100'}`}>{value}</span>
                                        <span className="text-sm text-slate-400 ml-1">{value !== '--' && value !== 'ERR' && value !== 'Disabled' ? unit : ''}</span>
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
                        Next.Js Deployment Speedtests
                    </h1>
                    <p className="text-slate-400 mt-1 text-base md:text-lg">Test your connection to available free Next.js hosts.</p>
                </header>

                {/* Main Results Panel - **ADDED ref HERE** */}
                <div ref={resultsPanelRef} className="bg-slate-800/60 p-3 md:p-4 rounded-2xl shadow-2xl w-full border border-slate-700/80 backdrop-blur-xl">
                    {/* -- Results Header -- */}
                    <div className="flex px-4 pb-3 border-b border-slate-700">
                        <h3 className="font-bold text-slate-300 text-sm w-1/3 lg:w-2/5">Server</h3>
                        <div className="hidden md:flex w-2/3 lg:w-3/5 justify-around">
                            <h3 className="font-bold text-slate-300 text-sm w-1/3 text-center">Ping</h3>
                            <h3 className="font-bold text-slate-300 text-sm w-1/3 text-center">Download</h3>
                            <h3 className="font-bold text-slate-300 text-sm w-1/3 text-center">Upload</h3>
                        </div>
                    </div>

                    {/* Results List */}
                    <div className="space-y-2 mt-2 md:mt-3">
                        {testResults.map((result, index) => (
                            <ResultRow 
                                key={index} 
                                result={result}
                                isSelected={selectedServers.has(result.name)}
                                onToggle={handleToggleServer}
                                isTestingGlobal={isTesting}
                            />
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
                    
                    {/* **UPDATED**: Action Buttons Container */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
                        {/* Start Button */}
                        <button
                            onClick={startAllTests}
                            disabled={isTesting || selectedServers.size === 0}
                            className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-sky-400/50 flex items-center justify-center transform active:scale-98 shadow-lg hover:shadow-sky-500/20"
                        >
                            {isTesting ? (
                                <>
                                    <SpinnerIcon />
                                    <span className="ml-3 text-lg">Testing...</span>
                                </>
                            ) : (
                                <>
                                    <PlayIcon />
                                    <span className="ml-2 text-lg">Start Tests ({selectedServers.size})</span>
                                </>
                            )}
                        </button>
                        
                        <button
                            onClick={handleDownloadScreenshot}
                            disabled={isTesting}
                            className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 px-5 rounded-xl transition-all duration-200 ease-in-out focus:outline-none focus:ring-4 focus:ring-slate-500/50 flex items-center justify-center gap-2 transform active:scale-98 shadow-lg hover:shadow-slate-600/20"
                            title="Download Results as Image"
                        >
                           <DownloadIcon />
                           <span className="hidden sm:inline">Save Results</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
