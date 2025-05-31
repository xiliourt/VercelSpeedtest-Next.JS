import Head from 'next/head';
import { useState, useEffect } from 'react';

// Configuration (adjust these as needed)
const PING_COUNT = 5; // Number of ping tests to average
const DOWNLOAD_API_URL = '/api/download'; // URL for download test
const DOWNLOAD_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB - MUST MATCH THE API ROUTE
const UPLOAD_API_URL = '/api/upload'; // URL for upload test
const UPLOAD_DATA_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const PING_API_URL = '/api/ping';

export default function SpeedTestPage() {
    const [ping, setPing] = useState('--');
    const [downloadSpeed, setDownloadSpeed] = useState('--');
    const [uploadSpeed, setUploadSpeed] = useState('--');
    const [status, setStatus] = useState('');
    const [progress, setProgress] = useState(0);
    const [isTesting, setIsTesting] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    const resetMetrics = () => {
        setPing('--');
        setDownloadSpeed('--');
        setUploadSpeed('--');
        setStatus('');
        setProgress(0);
        setShowProgress(false);
    };

    const measurePing = async () => {
        setStatus('Testing Ping...');
        setPing('...');
        let pings = [];
        for (let i = 0; i < PING_COUNT; i++) {
            const startTime = performance.now();
            try {
                await fetch(`${PING_API_URL}?r=${Math.random()}`, { method: 'GET', cache: 'no-store' });
                const endTime = performance.now();
                pings.push(endTime - startTime);
            } catch (error) {
                console.error('Ping request failed:', error);
                pings.push(null);
            }
            await new Promise(resolve => setTimeout(resolve, 200)); // Small delay
        }
        
        const validPings = pings.filter(p => p !== null);
        if (validPings.length > 0) {
            const avgPing = validPings.reduce((a, b) => a + b, 0) / validPings.length;
            setPing(Math.round(avgPing));
        } else {
            setPing('ERR');
            throw new Error('Ping test failed');
        }
    };

    const measureDownload = async () => {
        setStatus('Testing Download...');
        setDownloadSpeed('...');
        setShowProgress(true);
        setProgress(0);

        const startTime = performance.now();
        try {
            const response = await fetch(`${DOWNLOAD_API_URL}?r=${Math.random()}`, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`Server error for download: ${response.status} ${response.statusText}`);
            }
            
            const reader = response.body.getReader();
            let receivedLength = 0;
            
            // eslint-disable-next-line no-constant-condition
            while(true) {
                const {done, value} = await reader.read();
                if (done) break;
                receivedLength += value.length;
                const progressPercentage = Math.min(100, (receivedLength / DOWNLOAD_FILE_SIZE_BYTES) * 100);
                setProgress(progressPercentage);
            }

            const endTime = performance.now();
            const durationSeconds = (endTime - startTime) / 1000;
            
            if (durationSeconds === 0 || receivedLength === 0) {
                 setDownloadSpeed('ERR');
                 throw new Error('Download test failed (zero duration or size)');
            }

            const speedBps = (receivedLength * 8) / durationSeconds; // Use actual received length
            const speedMbps = (speedBps / (1000 * 1000)).toFixed(2); // Use 1000 for Mbps as is common
            setDownloadSpeed(speedMbps);
            setProgress(100);

        } catch (error) {
            console.error('Download test failed:', error);
            setDownloadSpeed('ERR');
            setProgress(0);
            throw error;
        }
    };

    const measureUpload = () => {
        setStatus('Testing Upload...');
        setUploadSpeed('...');
        setShowProgress(true);
        setProgress(0);

        return new Promise((resolve, reject) => {
            const data = new Uint8Array(UPLOAD_DATA_SIZE_BYTES);
            // Simple way to fill the array, crypto.getRandomValues would be better for true randomness
            for (let i = 0; i < UPLOAD_DATA_SIZE_BYTES; i++) {
                data[i] = i % 256; 
            }
            const blob = new Blob([data]);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', `${UPLOAD_API_URL}?r=${Math.random()}`, true);
            // xhr.setRequestHeader('Content-Type', 'application/octet-stream'); // Set by Blob automatically

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
                    if (durationSeconds === 0) {
                       setUploadSpeed('ERR');
                       reject(new Error('Upload test failed (zero duration)'));
                       return;
                    }
                    const speedBps = (UPLOAD_DATA_SIZE_BYTES * 8) / durationSeconds;
                    const speedMbps = (speedBps / (1000 * 1000)).toFixed(2); // Use 1000 for Mbps
                    setUploadSpeed(speedMbps);
                    setProgress(100);
                    resolve();
                } else {
                    setUploadSpeed('ERR');
                    console.error('Upload failed with status:', xhr.status, xhr.statusText, xhr.responseText);
                    reject(new Error(`Upload failed: ${xhr.statusText || 'Server error'} - ${xhr.responseText}`));
                }
            };

            xhr.onerror = () => {
                setUploadSpeed('ERR');
                console.error('Upload network error');
                setProgress(0);
                reject(new Error('Upload network error'));
            };
            
            xhr.send(blob);
        });
    };


    const startTest = async () => {
        if (isTesting) return;
        setIsTesting(true);
        resetMetrics();

        try {
            await measurePing();
            await measureDownload();
            await measureUpload();
            setStatus('Test Complete!');
        } catch (error) {
            console.error("Speed test failed: ", error);
            setStatus(`Error: ${error.message}.`);
        } finally {
            setIsTesting(false);
            // setShowProgress(false); // Keep progress bar at 100% or hide after a delay
            // setProgress(0);
        }
    };

    return (
        <>
            <Head>
                <title>Next.js Speed Test</title>
                <meta name="description" content="Measure your internet speed with Next.js" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="bg-gray-900 text-white flex items-center justify-center min-h-screen p-4 font-sans">
                <div className="bg-gray-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md">
                    <header className="text-center mb-6 sm:mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold text-sky-400">Speed Test</h1>
                        <p className="text-gray-400 mt-1">Measure your connection to this Next.js server.</p>
                    </header>

                    <div className="grid grid-cols-3 gap-4 mb-6 sm:mb-8 text-center">
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Ping</p>
                            <p id="ping-value" className="text-2xl sm:text-3xl font-semibold text-sky-300">{ping}</p>
                            <p className="text-xs text-gray-500">ms</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Download</p>
                            <p id="download-value" className="text-2xl sm:text-3xl font-semibold text-sky-300">{downloadSpeed}</p>
                            <p className="text-xs text-gray-500">Mbps</p>
                        </div>
                        <div>
                            <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Upload</p>
                            <p id="upload-value" className="text-2xl sm:text-3xl font-semibold text-sky-300">{uploadSpeed}</p>
                            <p className="text-xs text-gray-500">Mbps</p>
                        </div>
                    </div>

                    <div className="mb-6 sm:mb-8">
                        {showProgress && (
                            <div id="progress-bar-container" className="w-full bg-gray-700 rounded-full h-2.5">
                                <div 
                                    id="progress-bar" 
                                    className="bg-sky-500 h-2.5 rounded-full transition-all duration-150 ease-linear" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        )}
                        <p id="status-text" className="text-center text-sky-300 h-5 mt-2 text-sm">{status}</p>
                    </div>
                    
                    <button 
                        id="start-button" 
                        onClick={startTest}
                        disabled={isTesting}
                        className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-sky-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 flex items-center justify-center"
                    >
                        {isTesting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Testing...
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

                    <footer className="text-center mt-6 sm:mt-8">
                        <p className="text-xs text-gray-500">Powered by Next.js & Tailwind CSS</p>
                    </footer>
                </div>
            </div>
        </>
    );
}
