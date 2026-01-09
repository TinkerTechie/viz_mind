import { useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';

const FileUploadScreen = ({ onFileSelect, setLoading, setError }) => {
    const [isDragging, setIsDragging] = useState(false);
    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
        else if (e.type === "dragleave") setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setIsDragging(false);
        const file = e.dataTransfer.files && e.dataTransfer.files[0];
        handleFile(file);
    };

    const handleFileChange = (e) => handleFile(e.target.files[0]);

    const handleFile = (file) => {
        if (file && file.type === 'text/csv') {
            setLoading(true);
            setError(null);
            setTimeout(() => onFileSelect(file), 500);
        } else {
            setError("Invalid file type. Please upload a CSV file.");
        }
    };

    const dropzoneClass = isDragging ? 'dropzone dragging' : 'dropzone';

    return (
        <div className="upload-screen-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="upload-screen-content"
            >
                <h1 className="gradient-text">VizMind</h1>
                <p>Unlock deep insights from your data with AI-powered visualization.</p>

                <label
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    className={dropzoneClass}
                >
                    <Icon name="UploadCloud" className="dropzone-icon" />
                    <span className="dropzone-text">
                        Drag & drop a file or <span className="dropzone-text-highlight">click to upload</span>
                    </span>
                    <span className="dropzone-subtext">CSV files only</span>
                    <input type="file" className="dropzone-input" onChange={handleFileChange} accept=".csv" />
                </label>
            </motion.div>
        </div>
    );
};

export default FileUploadScreen;
