import { useMemo } from 'react';
import { motion } from 'framer-motion';
import CustomAudioPlayer from './CustomAudioPlayer';
import StatCard from './StatCard';
import TableCard from './TableCard';
import { Icon } from './Icon';

const Dashboard = ({ insights, filename, onReset }) => {
    if(!insights) return null;

    const summaryText = useMemo(() => 
        `Analysis for ${filename} is complete. The dataset contains ${insights['Data Shape'].rows} rows and ${insights['Data Shape'].cols} columns.`,
    [insights, filename]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    return (
        <motion.div 
            className="dashboard-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <header className="dashboard-header">
                <div>
                    <h1>Analysis Dashboard</h1>
                    <p>Showing results for <span className="filename">{filename}</span></p>
                </div>
                <button onClick={onReset} className="header-button">
                    <Icon name="Upload" /> Analyze Another File
                </button>
            </header>
            
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="column grid-col-span-4">
                    <CustomAudioPlayer text={summaryText} onReset={onReset} />
                    <StatCard icon="FileText" label="Rows" value={insights['Data Shape'].rows} />
                    <StatCard icon="Columns" label="Columns" value={insights['Data Shape'].cols} />
                    <TableCard title="Data Types" data={insights['Data Types']} />
                </div>

                {/* Right Column */}
                <div className="column grid-col-span-8">
                     {insights['Missing Values'] && insights['Missing Values'].length > 0 && 
                        <TableCard title="Missing Values" data={insights['Missing Values']} />
                    }
                    {insights['Numeric Summary'] && 
                        <TableCard title="Numeric Summary" data={insights['Numeric Summary']} />
                    }
                    {insights['Categorical Summary'] && 
                        <TableCard title="Categorical Summary" data={insights['Categorical Summary']} />
                    }
                    <TableCard title="Data Preview (First 5 Rows)" data={insights['Data Preview']} />
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;