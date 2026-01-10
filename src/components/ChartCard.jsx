import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from 'recharts';

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
                backdropFilter: 'blur(10px)'
            }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 700, opacity: 0.7 }}>{label || payload[0].name}</p>
                <p style={{ margin: 0, color: payload[0].fill, fontSize: '1.1rem', fontWeight: 800 }}>
                    {payload[0].value.toLocaleString()}
                </p>
                {payload[0].payload.percent && (
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {(payload[0].payload.percent * 100).toFixed(1)}% of total
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const ChartCard = ({ title, data, chartType }) => {
    // Calculate total for donut center if needed
    const total = data && Array.isArray(data) ? data.reduce((sum, item) => sum + (item.value || 0), 0) : 0;

    return (
        <motion.div
            className="glass-card"
            style={{ padding: '2rem', marginBottom: '0rem', position: 'relative' }}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ y: -5 }}
        >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '4px', height: '1.25rem', background: 'var(--primary)', borderRadius: '2px' }}></div>
                {title}
            </h3>
            <div style={{ height: '320px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'pie' ? (
                        <PieChart>
                            <defs>
                                {chartColors.map((color, i) => (
                                    <linearGradient key={`gradient-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0.5} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={80}
                                paddingAngle={4}
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={`url(#grad-${index % chartColors.length})`} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                        </PieChart>
                    ) : (
                        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                                    <stop offset="100%" stopColor="var(--secondary)" stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <XAxis
                                dataKey="name"
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--text-muted)' }}
                                dy={10}
                            />
                            <YAxis
                                stroke="var(--text-muted)"
                                fontSize={10}
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: 'var(--text-muted)' }}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} />
                            <Bar dataKey="count" name="Count" fill="url(#barGradient)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>

                {chartType === 'pie' && (
                    <div style={{
                        position: 'absolute',
                        top: '41%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        pointerEvents: 'none'
                    }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{total}</div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default ChartCard;
