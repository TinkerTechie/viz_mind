import { motion } from 'framer-motion';
import { Icon } from './Icon';

const StatCard = ({ icon, label, value, unit, className }) => (
    <motion.div 
        className={`stat-card glass-card ${className || ''}`}
        variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
        <div className="stat-card-label">
            <Icon name={icon} className="icon" />
            <span>{label}</span>
        </div>
        <div>
            <span className="stat-card-value">{value}</span>
            {unit && <span className="stat-card-unit">{unit}</span>}
        </div>
    </motion.div>
);

export default StatCard;

