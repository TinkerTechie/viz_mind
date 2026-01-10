import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIInsights, initOpenAI } from '../utils/aiEngine';
import { Icon } from './Icon';

const AIChat = ({ dataSummary }) => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('open_ai_key') || import.meta.env.VITE_OPENAI_API_KEY || '');
    const [isKeySet, setIsKeySet] = useState(!!(localStorage.getItem('open_ai_key') || import.meta.env.VITE_OPENAI_API_KEY));
    const [showKeyInput, setShowKeyInput] = useState(!isKeySet);
    const chatEndRef = useRef(null);

    useEffect(() => {
        if (isKeySet && apiKey) {
            initOpenAI(apiKey);
        }
    }, [isKeySet, apiKey]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isThinking]);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('open_ai_key', apiKey);
            initOpenAI(apiKey);
            setIsKeySet(true);
            setShowKeyInput(false);
        }
    };

    const handleSend = async () => {
        if (!query.trim() || isThinking || !isKeySet) return;

        const userMsg = { role: 'user', content: query, timestamp: new Date().toLocaleTimeString() };
        setChatHistory(prev => [...prev, userMsg]);
        const currentQuery = query;
        setQuery('');
        setIsThinking(true);

        try {
            const aiResponse = await getAIInsights(dataSummary, currentQuery);
            setChatHistory(prev => [...prev, {
                role: 'ai',
                content: aiResponse,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } catch (error) {
            setChatHistory(prev => [...prev, {
                role: 'error',
                content: `Error: ${error.message}. Please check your API key and connection.`,
                timestamp: new Date().toLocaleTimeString()
            }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="glass-card ai-chat-container" style={{ gridColumn: 'span 12', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: 'var(--secondary)', padding: '0.5rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon name="Sparkles" size={18} style={{ color: 'white' }} />
                    </div>
                    <div>
                        <span style={{ fontWeight: 700, fontSize: '1rem' }}>AI Data Assistant</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Powered by GPT-4</div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <AnimatePresence>
                        {(!isKeySet || showKeyInput) && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                style={{ display: 'flex', gap: '0.5rem' }}
                            >
                                <input
                                    type="password"
                                    placeholder="OpenAI API Key"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '0.4rem 0.8rem', color: 'white', fontSize: '0.8rem', width: '180px' }}
                                />
                                <button onClick={handleSaveKey} className="header-button" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem', background: 'var(--primary)' }}>Save</button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {isKeySet && !showKeyInput && (
                        <button
                            onClick={() => setShowKeyInput(true)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: '0.5rem' }}
                        >
                            <Icon name="Settings" size={14} style={{ marginRight: '0.4rem' }} />
                            Update Key
                        </button>
                    )}
                </div>
            </div>

            <div className="chat-messages" style={{ padding: '1.5rem', height: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', scrollBehavior: 'smooth' }}>
                {chatHistory.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem', opacity: 0.5 }}>
                        <Icon name="MessageSquare" size={48} style={{ marginBottom: '1.5rem' }} />
                        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}>Ready to analyze?</h4>
                        <p style={{ fontSize: '0.9rem' }}>Ask questions about trends, correlations, or summaries.<br />I'll use your dataset context to provide answers.</p>
                    </div>
                )}

                {chatHistory.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.4rem'
                        }}
                    >
                        <div style={{
                            padding: '1rem 1.25rem',
                            borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0 1.25rem' : '1.25rem 1.25rem 1.25rem 0',
                            background: msg.role === 'user' ? 'linear-gradient(135deg, var(--primary), var(--accent))' : msg.role === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid ' + (msg.role === 'user' ? 'transparent' : msg.role === 'error' ? '#ef4444' : 'var(--glass-border)'),
                            color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            boxShadow: msg.role === 'user' ? '0 10px 15px -3px rgba(99, 102, 241, 0.3)' : 'none'
                        }}>
                            {msg.content}
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                            <Icon name={msg.role === 'user' ? 'User' : 'Cpu'} size={10} />
                            {msg.role.toUpperCase()} • {msg.timestamp}
                        </div>
                    </motion.div>
                ))}

                {isThinking && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{ alignSelf: 'flex-start', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--text-muted)' }}
                    >
                        <div className="loader-spinner" style={{ width: '20px', height: '20px', borderSize: '2px' }}></div>
                        <span style={{ fontSize: '0.85rem' }}>Analyzing dataset...</span>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.1)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder={isKeySet ? "Ask a question about your data..." : "Please set your API key first..."}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    disabled={!isKeySet || isThinking}
                    style={{
                        flex: 1,
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '1rem',
                        padding: '0.85rem 1.5rem',
                        color: 'white',
                        outline: 'none',
                        transition: 'all 0.3s ease'
                    }}
                    className="chat-input"
                />
                <button
                    onClick={handleSend}
                    disabled={isThinking || !isKeySet || !query.trim()}
                    className="header-button"
                    style={{
                        background: 'var(--primary)',
                        borderColor: 'transparent',
                        padding: '0 1.5rem',
                        opacity: (isThinking || !isKeySet || !query.trim()) ? 0.5 : 1
                    }}
                >
                    <Icon name={isThinking ? "Loader2" : "Send"} size={18} className={isThinking ? "spin" : ""} />
                </button>
            </div>
        </div>
    );
};

export default AIChat;
