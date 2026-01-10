import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

const Table = ({ data }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const rowsPerPage = 10;

    if (!data) return <p className="table-placeholder">No data to display.</p>;

    const { headers, rows } = useMemo(() => {
        let h = [];
        let r = [];
        if (Array.isArray(data)) {
            if (data.length > 0) {
                h = Object.keys(data[0]);
                r = data.map(row => h.map(col => row[col]));
            }
        } else if (data.headers && data.rows) {
            h = data.headers;
            r = data.rows;
        }
        return { headers: h, rows: r };
    }, [data]);

    const filteredRows = useMemo(() => {
        if (!searchTerm) return rows;
        return rows.filter(row =>
            row.some(cell =>
                String(cell).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }, [rows, searchTerm]);

    const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
    const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    if (headers.length === 0) return <p className="table-placeholder">No valid data columns found.</p>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '1rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Icon name="Search" size={14} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search table..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        style={{
                            width: '100%',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '2rem',
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            color: 'white',
                            fontSize: '0.85rem',
                            outline: 'none'
                        }}
                    />
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    Showing <span style={{ color: 'white', fontWeight: 600 }}>{filteredRows.length}</span> results
                </div>
            </div>

            <div className="table-container" style={{ flex: 1 }}>
                <table>
                    <thead>
                        <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode='wait'>
                            {paginatedRows.map((row, i) => (
                                <motion.tr
                                    key={`${currentPage}-${i}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                >
                                    {row.map((cell, j) => (
                                        <td key={`${i}-${j}`}>
                                            {typeof cell === 'number' ? cell.toLocaleString() : String(cell)}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
                {filteredRows.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Icon name="SearchX" size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>No matches found for "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                    <button
                        className="header-button"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => prev - 1)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                        <Icon name="ChevronLeft" size={16} /> Previous
                    </button>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Page <span style={{ color: 'var(--primary)' }}>{currentPage}</span> of {totalPages}
                    </div>
                    <button
                        className="header-button"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                        Next <Icon name="ChevronRight" size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

const TableCard = ({ title, data, className }) => (
    <motion.div
        className={`table-card glass-card ${className || ''}`}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
        <div className="table-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon name="Table" size={20} style={{ color: 'var(--primary)' }} />
                <span>{title}</span>
            </div>
        </div>
        <Table data={data} />
    </motion.div>
);

export default TableCard;
