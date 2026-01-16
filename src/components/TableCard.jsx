import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

const TableCard = ({ title, data }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    const { headers, rows } = useMemo(() => {
        if (!data || !data.headers || !data.rows) return { headers: [], rows: [] };

        let filteredRows = data.rows;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filteredRows = data.rows.filter(row =>
                row.some(cell => String(cell).toLowerCase().includes(query))
            );
        }

        return { headers: data.headers, rows: filteredRows };
    }, [data, searchQuery]);

    const totalPages = Math.ceil(rows.length / rowsPerPage);
    const paginatedRows = rows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    if (!data) return null;

    return (
        <motion.div
            className="glass-card table-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ width: '100%', marginBottom: '2.5rem' }}
        >
            <div className="table-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '4px', height: '1.25rem', background: 'var(--primary)', borderRadius: '2px' }}></div>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{title}</span>
                </div>

                <div style={{ position: 'relative' }}>
                    <Icon name="Search" size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="search"
                        placeholder="Search data..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '0.75rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(255,255,255,0.03)',
                            color: 'white',
                            fontSize: '0.85rem',
                            width: '240px',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            <div className="table-container">
                {headers.length > 5 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', padding: '1.5rem' }}>
                        <AnimatePresence mode="popLayout">
                            {paginatedRows.map((row, idx) => (
                                <motion.div
                                    key={`${currentPage}-${idx}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '1rem',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}
                                >
                                    {row.map((cell, i) => (
                                        <div key={i} style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.2rem' }}>
                                                {headers[i]}
                                            </span>
                                            <span style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.9)', wordBreak: 'break-word', lineHeight: '1.4' }}>
                                                {typeof cell === 'number' ? cell.toLocaleString() : String(cell)}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                {headers.map((h, i) => <th key={i}>{h}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {paginatedRows.map((row, idx) => (
                                    <motion.tr
                                        key={`${currentPage}-${idx}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        {row.map((cell, i) => (
                                            <td key={i}>
                                                {typeof cell === 'number' ? cell.toLocaleString() : String(cell)}
                                            </td>
                                        ))}
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                )}

                {rows.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Icon name="Database" size={40} style={{ marginBottom: '1rem', opacity: 0.3 }} />
                        <p>No matching records found</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Showing {((currentPage - 1) * rowsPerPage) + 1} to {Math.min(currentPage * rowsPerPage, rows.length)} of {rows.length} records
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', opacity: currentPage === 1 ? 0.3 : 1 }}
                        >
                            <Icon name="ChevronLeft" size={16} />
                        </button>
                        <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem', fontSize: '0.85rem', fontWeight: 600 }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            style={{ padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', cursor: 'pointer', opacity: currentPage === totalPages ? 0.3 : 1 }}
                        >
                            <Icon name="ChevronRight" size={16} />
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TableCard;
