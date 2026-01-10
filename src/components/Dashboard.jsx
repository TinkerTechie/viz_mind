import { useState, useMemo } from 'react';
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

    if (!insights) return null;

    const summaryText = useMemo(() =>
        `Analysis for ${filename} is complete. The dataset contains ${insights['Data Shape'].rows} rows and ${insights['Data Shape'].cols} columns.`,
        [insights, filename]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.2 }
        }
    };

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

                <motion.div
                    className="dashboard-container"
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                >
                    <header className="dashboard-header-modern">
                        <div>
                            <h1>Insights Overview</h1>
                            <p>Deep-dive analysis of <span className="filename-chip">{filename}</span></p>
                        </div>
                        <div className="header-actions">
                            <button className="header-button secondary">
                                <Icon name="Download" size={18} />
                                <span>Export PDF</span>
                            </button>
                            <button className="header-button primary" onClick={onReset}>
                                <Icon name="Plus" size={18} />
                                <span>New Analysis</span>
                            </button>
                        </div>
                    </header>

                    <div className="dashboard-grid">
                        {/* Primary Column */}
                        <div className="grid-main-col">
                            {/* Stats Row */}
                            <div className="stats-row">
                                <StatCard icon="Database" label="Total Records" value={insights['Data Shape'].rows.toLocaleString()} />
                                <StatCard icon="Columns" label="Data Dimensions" value={insights['Data Shape'].cols.toLocaleString()} />
                                <StatCard icon="Activity" label="Data Quality" value="High" />
                            </div>

                            <div className="charts-row">
                                {insights.missingValuesChartData && insights.missingValuesChartData.length > 0 &&
                                    <div className="grid-span-6">
                                        <ChartCard title="Missing Data Profile" data={insights.missingValuesChartData} chartType="bar" />
                                    </div>
                                }
                                <div className="grid-span-6">
                                    <ChartCard title="Schema Distribution" data={insights.dataTypeChartData} chartType="pie" />
                                </div>
                            </div>

                            <TableCard title="Exploratory Data Preview" data={insights['Data Preview']} />

                            <div className="secondary-tables-row">
                                {insights['Numeric Summary'] &&
                                    <div className="grid-span-12">
                                        <TableCard title="Numeric Profile" data={insights['Numeric Summary']} />
                                    </div>
                                }
                                {insights['Categorical Summary'] &&
                                    <div className="grid-span-12">
                                        <TableCard title="Frequency Analysis" data={insights['Categorical Summary']} />
                                    </div>
                                }
                            </div>
                        </div>

                        {/* Side Column (Fixed on Desktop) */}
                        <aside className="grid-side-col">
                            <CustomAudioPlayer text={summaryText} onReset={onReset} />
                            <AIChat dataSummary={insights} />
                            <div className="glass-card helper-tip">
                                <div className="tip-header">
                                    <Icon name="Lightbulb" size={18} />
                                    <span>Analysis Tip</span>
                                </div>
                                <p>Click on chart legends to toggle visibility or ask the AI specific questions about row correlations.</p>
                            </div>
                        </aside>
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default Dashboard;
