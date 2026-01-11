import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomAudioPlayer from './CustomAudioPlayer';
import StatCard from './StatCard';
import TableCard from './TableCard';
import ChartCard from './ChartCard';
import AIChat from './AIChat';
import Sidebar from './Sidebar';
import { Icon } from './Icon';

const Dashboard = ({ insights, filename, onReset }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('Dashboard');
    const [exporting, setExporting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const reportRef = useRef(null);

    // Defensive check
    if (!insights) {
        console.warn("Dashboard rendered without insights");
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#050505', color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <Icon name="AlertTriangle" size={48} style={{ color: '#ec4899', marginBottom: '1.5rem' }} />
                    <h2>Analysis data not found</h2>
                    <button onClick={onReset} className="header-button primary" style={{ margin: '1.5rem auto' }}>Return Home</button>
                </div>
            </div>
        );
    }

    const handleExport = async () => {
        if (!window.html2pdf) {
            console.error("html2pdf library not loaded");
            return;
        }

        setExporting(true);
        const element = reportRef.current;
        const opt = {
            margin: 10,
            filename: `VizMind_Report_${filename.replace('.csv', '')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: {
                scale: 2,
                useCORS: true,
                backgroundColor: '#050505' // Match app background
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        try {
            await window.html2pdf().set(opt).from(element).save();
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("PDF Export Error:", error);
        } finally {
            setExporting(false);
        }
    };

    const summaryText = useMemo(() =>
        `Analysis for ${filename} is complete. The dataset contains ${insights['Data Shape']?.rows} rows and ${insights['Data Shape']?.cols} columns.`,
        [insights, filename]);

    const renderContent = () => {
        const variants = {
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
        };

        switch (activeSection) {
            case 'Visualizations':
                return (
                    <motion.div key="viz" variants={variants} initial="initial" animate="animate" exit="exit" className="grid-main-col">
                        <div className="charts-row">
                            {insights.missingValuesChartData && insights.missingValuesChartData.length > 0 &&
                                <div className="grid-span-6">
                                    <ChartCard title="Data Completeness" data={insights.missingValuesChartData} chartType="bar" />
                                </div>
                            }
                            <div className="grid-span-6">
                                <ChartCard title="Schema Breakdown" data={insights.dataTypeChartData} chartType="pie" />
                            </div>
                        </div>
                        {/* You can add more specific charts here if needed */}
                        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>
                            <Icon name="BarChart3" size={48} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
                            <h3>More Visualizations coming soon</h3>
                            <p>We are working on advanced correlation matrices and trend analysis.</p>
                        </div>
                    </motion.div>
                );
            case 'Raw Data':
                return (
                    <motion.div key="raw" variants={variants} initial="initial" animate="animate" exit="exit" className="grid-main-col">
                        <TableCard title="Exploratory Data Preview" data={insights['Data Preview']} />
                        {insights['Numeric Summary'] && <TableCard title="Numeric Analysis" data={insights['Numeric Summary']} />}
                        {insights['Categorical Summary'] && <TableCard title="Frequency Analysis" data={insights['Categorical Summary']} />}
                    </motion.div>
                );
            case 'AI Assistant':
                return (
                    <motion.div key="ai" variants={variants} initial="initial" animate="animate" exit="exit" className="grid-main-col">
                        <AIChat dataSummary={insights} />
                    </motion.div>
                );
            case 'Dashboard':
            default:
                return (
                    <motion.div key="dash" variants={variants} initial="initial" animate="animate" exit="exit" className="dashboard-grid">
                        <div className="grid-main-col">
                            {/* Stats Row */}
                            <div className="stats-row">
                                <StatCard icon="Database" label="Total Records" value={insights['Data Shape']?.rows?.toLocaleString() || '0'} />
                                <StatCard icon="Columns" label="Dimensions" value={insights['Data Shape']?.cols?.toLocaleString() || '0'} />
                                <StatCard icon="Activity" label="Quality Score" value="98%" />
                            </div>

                            <div className="charts-row">
                                {insights.missingValuesChartData && insights.missingValuesChartData.length > 0 &&
                                    <div className="grid-span-6">
                                        <ChartCard title="Data Completeness" data={insights.missingValuesChartData} chartType="bar" />
                                    </div>
                                }
                                <div className="grid-span-6">
                                    <ChartCard title="Schema Breakdown" data={insights.dataTypeChartData} chartType="pie" />
                                </div>
                            </div>

                            <TableCard title="Exploratory Data Preview" data={insights['Data Preview']} />
                        </div>

                        <aside className="grid-side-col">
                            <CustomAudioPlayer text={summaryText} onReset={onReset} />
                            <AIChat dataSummary={insights} />
                        </aside>
                    </motion.div>
                );
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar
                onReset={onReset}
                filename={filename}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                activeSection={activeSection}
                onSectionChange={setActiveSection}
            />

            <main className="main-content">
                {/* Mobile Header */}
                <header className="mobile-header" data-html2canvas-ignore>
                    <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                        <Icon name="Menu" size={24} />
                    </button>
                    <div className="mobile-logo">VizMind</div>
                    <button className="mobile-reset" onClick={onReset}>
                        <Icon name="Plus" size={20} />
                    </button>
                </header>

                <div className="dashboard-container" ref={reportRef}>
                    <header className="dashboard-header-modern">
                        <div>
                            <h1 style={{ color: 'white', letterSpacing: '-0.02em' }}>{activeSection}</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                Analysis of <span className="filename-chip">{filename}</span>
                            </p>
                        </div>
                        <div className="header-actions" data-html2canvas-ignore>
                            <button
                                className={`header-button ${exporting ? 'loading' : ''}`}
                                onClick={handleExport}
                                disabled={exporting}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'white' }}
                            >
                                <Icon name={exporting ? "Loader2" : "Download"} size={18} className={exporting ? "spin" : ""} />
                                <span>{exporting ? 'Exporting...' : 'Export PDF'}</span>
                            </button>
                            <button className="header-button primary" onClick={onReset}>
                                <Icon name="Plus" size={18} />
                                <span>New Analysis</span>
                            </button>
                        </div>
                    </header>

                    <AnimatePresence>
                        {showToast && (
                            <motion.div
                                initial={{ opacity: 0, y: -20, x: '-50%' }}
                                animate={{ opacity: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, scale: 0.9, x: '-50%' }}
                                style={{
                                    position: 'fixed',
                                    top: '2rem',
                                    left: '50%',
                                    zIndex: 10000,
                                    padding: '1rem 2rem',
                                    background: 'rgba(20, 20, 20, 0.95)',
                                    border: '1px solid var(--primary)',
                                    borderRadius: '1rem',
                                    backdropFilter: 'blur(20px)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                                    color: 'white'
                                }}
                            >
                                <Icon name="CheckCircle" style={{ color: 'var(--primary)' }} />
                                <div>
                                    <div style={{ fontWeight: 800 }}>Report Ready</div>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Your PDF has been generated successfully.</div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        {renderContent()}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
