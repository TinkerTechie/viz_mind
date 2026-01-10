import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { analyzeData } from './utils/dataAnalyzer';
import FileUploadScreen from './components/FileUploadScreen';
import Dashboard from './components/Dashboard';
import { Icon } from './Icon';

function App() {
    const [file, setFile] = useState(null);
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = useCallback(async (selectedFile) => {
        setIsLoading(true);
        setError(null);

        // Brief delay to show loader and smooth transition
        await new Promise(r => setTimeout(r, 800));

        try {
            const newInsights = await analyzeData(selectedFile);
            setFile(selectedFile);
            setInsights(newInsights);
        } catch (err) {
            setError(err.message || "An unexpected error occurred during analysis.");
            setFile(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleReset = () => {
        setFile(null);
        setInsights(null);
        setError(null);
    };

    return (
        <div className="app-container">
            <AnimatePresence mode="wait">
                {isLoading && (
                    <motion.div
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="loader-overlay"
                    >
                        <div className="loader-spinner"></div>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="loader-text"
                            style={{ fontSize: '1.25rem', fontWeight: 600, letterSpacing: '0.05em' }}
                        >
                            VIZMIND IS ANALYZING...
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {!file ? (
                    <motion.div
                        key="uploader"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.5 }}
                    >
                        <FileUploadScreen
                            onFileSelect={handleFileSelect}
                            setLoading={setIsLoading}
                            setError={setError}
                        />
                    </motion.div>
                ) : (
                    <motion.div
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <Dashboard insights={insights} filename={file.name} onReset={handleReset} />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="error-popup"
                        style={{ borderLeft: '4px solid #fff' }}
                    >
                        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>
                            <Icon name="AlertCircle" size={20} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '0.1rem', opacity: 0.8 }}>System Alert</span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{error}</span>
                        </div>
                        <button onClick={() => setError(null)} className="error-popup-close-btn" style={{ marginLeft: '1rem' }}>
                            <Icon name="X" size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default App;
