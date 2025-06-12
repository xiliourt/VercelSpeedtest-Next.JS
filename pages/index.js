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
