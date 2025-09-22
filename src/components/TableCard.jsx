import { motion } from 'framer-motion';

const Table = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="table-placeholder">No data to display.</p>;
    }
    const headers = Object.keys(data[0]);
    return (
        <div className="table-container">
            <table>
                <thead>
                    <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr key={i}>
                            {headers.map(h => <td key={`${h}-${i}`}>{row[h]}</td>)}
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
