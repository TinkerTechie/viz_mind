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
        setError(null);
        if (!file) return;

        const isCsv = file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';

        if (isCsv) {
            setFileName(file.name);
            setLoading(true);
            setTimeout(() => onFileSelect(file), 1200);
        } else {
            setFileName(null);
            setError("Invalid file format. Please upload a .csv file.");
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="upload-screen-content"
            >
                <div className="brand-badge">POWERED BY AI</div>
                <h1 className="logo-title">VizMind</h1>
                <p className="tagline">Upload your dataset and let VizMind uncover the hidden stories within your data.</p>

                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={openFilePicker}
                    className={`dropzone-v2 ${isDragging ? 'dragging' : ''} ${fileName ? 'has-file' : ''}`}
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
                                    key="upload-state"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="dropzone-state"
                                >
                                    <Icon name="UploadCloud" size={48} className="drop-icon" />
                                    <span className="drop-main-text">
                                        Drag & drop a file or <span className="highlight-text">click to upload</span>
                                    </span>
                                    <span className="drop-sub-text">Supports .csv files up to 10MB</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="file-state"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="dropzone-state"
                                >
                                    <Icon name="FileText" size={48} className="drop-icon" />
                                    <span className="drop-main-text">{fileName}</span>
                                    <span className="drop-sub-text">Ready for analysis</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                <div className="sample-data-container">
                    <p className="sample-text">No data? Try out our sample dataset</p>
                    <button
                        className="btn-sample"
                        onClick={(e) => {
                            e.stopPropagation();
                            const sampleCsv = `Date,Product,Category,Sales,Quantity,Region
2023-01-01,Smartphone,Electronics,500,10,North
2023-01-02,Laptop,Electronics,1200,5,West
2023-01-03,Headphones,Electronics,150,20,East
2023-01-04,T-shirt,Apparel,25,100,South
2023-01-05,Jeans,Apparel,60,50,North
2023-01-06,Smartphone,Electronics,500,8,South
2023-01-07,Laptop,Electronics,1200,3,North`;
                            const blob = new Blob([sampleCsv], { type: 'text/csv' });
                            const file = new File([blob], "sample_sales_data.csv", { type: 'text/csv' });
                            handleFile(file);
                        }}
                    >
                        <Icon name="Database" size={14} /> Load Sample Data
                    </button>
                </div>

                <div className="upload-footer-features">
                    <div className="footer-feature"><Icon name="Zap" size={14} /> Instant Processing</div>
                    <div className="footer-feature"><Icon name="Lock" size={14} /> Data Privacy</div>
                    <div className="footer-feature"><Icon name="Shield" size={14} /> Secure Storage</div>
                </div>
            </motion.div>
        </div>
    );
};

export default FileUploadScreen;
