import { motion } from 'framer-motion';

const Table = ({ data }) => {
    if (!data) return <p className="table-placeholder">No data to display.</p>;

    let headers = [];
    let rows = [];

    if (Array.isArray(data)) {
        if (data.length === 0) return <p className="table-placeholder">No data to display.</p>;
        headers = Object.keys(data[0]);
        rows = data.map(row => headers.map(h => row[h]));
    } else if (data.headers && data.rows) {
        headers = data.headers;
        rows = data.rows;
    } else {
        return <p className="table-placeholder">Unsupported data format.</p>;
    }

    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>{headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr key={i}>
                            {row.map((cell, j) => <td key={`${i}-${j}`}>{cell}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const TableCard = ({ title, data, className }) => (
    <motion.div
        className={`table-card glass-card ${className || ''}`}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
        <h3 className="table-card-header">{title}</h3>
        <Table data={data} />
    </motion.div>
);

export default TableCard;
