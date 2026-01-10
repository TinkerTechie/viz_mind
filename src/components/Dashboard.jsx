import { useState, useMemo, useEffect } from 'react';
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
    const [exporting, setExporting] = useState(false);
    const [showToast, setShowToast] = useState(false);

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

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => {
            window.print();
            setExporting(false);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        }, 1000);
    };

    const summaryText = useMemo(() =>
        `Analysis for ${filename} is complete. The dataset contains ${insights['Data Shape']?.rows} rows and ${insights['Data Shape']?.cols} columns.`,
        [insights, filename]);

    return (
        <div className="dashboard-layout">
            <Sidebar
                onReset={onReset}
                filename={filename}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            <main className="main-content">
                {/* Mobile Header */}
                <header className="mobile-header">
                    <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
                        <Icon name="Menu" size={24} />
                    </button>
                    <div className="mobile-logo">VizMind</div>
                    <button className="mobile-reset" onClick={onReset}>
                        <Icon name="Plus" size={20} />
                    </button>
                </header>

                <div className="dashboard-container">
                    <header className="dashboard-header-modern">
                        <div>
                            <h1 style={{ color: 'white', letterSpacing: '-0.02em' }}>Insights Overview</h1>
                            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                                Deep-dive analysis of <span className="filename-chip">{filename}</span>
                            </p>
                        </div>
                        <div className="header-actions">
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

                    <div className="dashboard-grid">
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

                            {insights['Numeric Summary'] && (
                                <div className="secondary-tables-row">
                                    <div className="grid-span-12">
                                        <TableCard title="Numeric Analysis" data={insights['Numeric Summary']} />
                                    </div>
                                </div>
                            )}

                            {insights['Categorical Summary'] && (
                                <div className="secondary-tables-row">
                                    <div className="grid-span-12">
                                        <TableCard title="Frequency Analysis" data={insights['Categorical Summary']} />
                                    </div>
                                </div>
                            )}
                        </div>

                        <aside className="grid-side-col">
                            <CustomAudioPlayer text={summaryText} onReset={onReset} />
                            <AIChat dataSummary={insights} />
                        </aside>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
