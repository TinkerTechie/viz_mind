import { motion } from 'framer-motion';
import { Icon } from './Icon';

const StatCard = ({ icon, label, value, unit, className }) => (
    <motion.div
        className={`stat-card glass-card ${className || ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="stat-card-label">
            <Icon name={icon} size={20} className="icon" />
            <span>{label}</span>
        </div>
        <div style={{ marginTop: '0.5rem' }}>
            <span className="stat-card-value">{value}</span>
            {unit && <span className="stat-card-unit" style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '1rem' }}>{unit}</span>}
        </div>
    </motion.div>
);

export default StatCard;
