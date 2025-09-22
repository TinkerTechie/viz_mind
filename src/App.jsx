import { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInsights } from './utils/dataAnalyzer';
import FileUploadScreen from './components/FileUploadScreen';
import Dashboard from './components/Dashboard';
import { Icon } from './components/Icon';

function App() {
    const [file, setFile] = useState(null);
    const [insights, setInsights] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileSelect = useCallback((selectedFile) => {
        setFile(selectedFile);
        Papa.parse(selectedFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const newInsights = generateInsights(results.data);
                setInsights(newInsights);
                setIsLoading(false);
            },
            error: (err) => {
                setError("Failed to parse CSV file: " + err.message);
                setIsLoading(false);
            }
        });
    }, []);
    
    const handleReset = () => {
        setFile(null);
        setInsights(null);
        setError(null);
    };
    
    return (
         <div className="app-container">
            <AnimatePresence>
                {isLoading && (
                    <motion.div 
                        key="loader"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="loader-overlay"
                    >
                        <div className="loader-spinner"></div>
                        <p className="loader-text">Analyzing your data...</p>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {!file ? (
                     <motion.div key="uploader" exit={{ opacity: 0, scale: 0.9 }}>
                         <FileUploadScreen onFileSelect={handleFileSelect} setLoading={setIsLoading} setError={setError} />
                     </motion.div>
                ) : (
                     <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                         <Dashboard insights={insights} filename={file.name} onReset={handleReset} />
                     </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {error && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="error-popup"
                    >
                        <Icon name="AlertTriangle" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="error-popup-close-btn">
                            <Icon name="X" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
         </div>
    );
}

export default App;
