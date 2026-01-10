import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

const FileUploadScreen = ({ onFileSelect, setLoading, setError }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragging(true);
        } else if (e.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) handleFile(file);
    };

    const handleFile = (file) => {
        // Clear previous error
        setError(null);

        // Validate file existence and type
        if (!file) return;

        // Check extension/mime type (some systems don't provide text/csv for all CSVs)
        const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';

        if (isCsv) {
            setFileName(file.name);
            setLoading(true);
            // Artificial delay for premium UX transition
            setTimeout(() => onFileSelect(file), 1200);
        } else {
            setFileName(null);
            setError("Invalid file format. Please upload a .csv file.");
            // Reset input value so same file can be selected again if fixed
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const openFilePicker = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="upload-screen-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="upload-screen-content"
            >
                <div className="brand-badge">Powered by AI</div>
                <h1 className="gradient-text">VizMind</h1>
                <p>Upload your dataset and let VizMind uncover the hidden stories within your data.</p>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFilePicker}
                    className={`dropzone ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        style={{ display: 'none' }}
                    />

                    <div className="dropzone-inner">
                        <AnimatePresence mode="wait">
                            {!fileName ? (
                                <motion.div
                                    key="upload-icon"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="dropzone-state"
                                >
                                    <Icon name="UploadCloud" size={48} className="dropzone-icon" />
                                    <span className="dropzone-text">
                                        Drag & drop a file or <span className="dropzone-text-highlight">click to upload</span>
                                    </span>
                                    <span className="dropzone-subtext">Supports .csv files up to 10MB</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="file-icon"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="dropzone-state"
                                >
                                    <div className="file-avatar">
                                        <Icon name="FileText" size={40} />
                                    </div>
                                    <span className="dropzone-text file-selected-name">{fileName}</span>
                                    <span className="dropzone-subtext ready-text">File ready for analysis</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="upload-features">
                    <div className="feature"><Icon name="Zap" size={14} /> Instant Processing</div>
                    <div className="feature"><Icon name="Lock" size={14} /> Data Privacy</div>
                    <div className="feature"><Icon name="Shield" size={14} /> Secure Storage</div>
                </div>
            </motion.div>
        </div>
    );
};

export default FileUploadScreen;
