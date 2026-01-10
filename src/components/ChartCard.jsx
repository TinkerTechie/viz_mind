import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { Icon } from './Icon';

const chartColors = ['#6366f1', '#ec4899', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div style={{
                background: 'rgba(13, 13, 13, 0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '1rem',
                borderRadius: '1rem',
                color: 'white',
                fontSize: '0.85rem',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)',
                backdropFilter: 'blur(10px)',
                zIndex: 1000
            }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, opacity: 0.7 }}>{label || payload[0].name}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: payload[0].fill }}></div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                        {payload[0].value.toLocaleString()}
                    </span>
                </div>
            </div>
        );
    }
    return null;
};

const ChartCard = ({ title, data, chartType }) => {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="BarChart" size={48} style={{ marginBottom: '1rem', color: 'var(--text-muted)' }} />
                <p style={{ color: 'var(--text-muted)' }}>No data available for {title}</p>
            </div>
        );
    }

    const total = data.reduce((sum, item) => sum + (item.value || item.count || 0), 0);

    return (
        <motion.div
            className="glass-card"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ height: '100%', padding: '2rem' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '4px', height: '1.1rem', background: 'var(--primary)', borderRadius: '2px' }}></div>
                    {title}
                </h3>
            </div>

            <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'pie' ? (
                        <PieChart>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                innerRadius={70}
                                paddingAngle={5}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    ) : (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis
                                dataKey="name"
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                            <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default ChartCard;
