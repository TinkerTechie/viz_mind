import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

const Sidebar = ({ onReset, filename, isOpen, setIsOpen }) => {
    const menuItems = [
        { icon: 'LayoutDashboard', label: 'Dashboard', active: true },
        { icon: 'PieChart', label: 'Visualizations' },
        { icon: 'Table', label: 'Raw Data' },
        { icon: 'MessageSquare', label: 'AI Assistant' },
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="sidebar-backdrop"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={`sidebar ${isOpen ? 'open' : ''}`}
                initial={false}
                animate={{ x: isOpen ? 0 : '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
                <div className="sidebar-header">
                    <div className="logo-container">
                        <div className="logo-icon">VM</div>
                        <span className="logo-text">VizMind</span>
                    </div>
                </div>

                <div className="sidebar-content">
                    <div className="nav-section">
                        <span className="section-label">Main Menu</span>
                        <div className="nav-items">
                            {menuItems.map((item, idx) => (
                                <div key={idx} className={`nav-item ${item.active ? 'active' : ''}`}>
                                    <Icon name={item.icon} size={20} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="nav-section">
                        <span className="section-label">File Details</span>
                        <div className="file-info-card">
                            <Icon name="File" size={16} />
                            <span className="filename-sidebar" title={filename}>{filename}</span>
                        </div>
                    </div>
                </div>

                <div className="sidebar-footer">
                    <button onClick={onReset} className="sidebar-reset-btn">
                        <Icon name="Plus" size={18} />
                        <span>New Analysis</span>
                    </button>
                </div>
            </motion.aside>
        </>
    );
};

export default Sidebar;
