import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAIInsights, initOpenAI } from '../utils/aiEngine';
import { Icon } from './Icon';

const AIChat = ({ dataSummary }) => {
    const [query, setQuery] = useState('');
    const [chatHistory, setChatHistory] = useState([]);
    const [isThinking, setIsThinking] = useState(false);
    const [apiKey, setApiKey] = useState(localStorage.getItem('open_ai_key') || '');
    const [isKeySet, setIsKeySet] = useState(!!localStorage.getItem('open_ai_key'));
    const [showKeyInput, setShowKeyInput] = useState(!isKeySet);

    const handleSaveKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('open_ai_key', apiKey);
            initOpenAI(apiKey);
            setIsKeySet(true);
            setShowKeyInput(false);
        }
    };

    const handleSend = async () => {
        if (!query.trim() || isThinking) return;

        const userMsg = { role: 'user', content: query };
        setChatHistory(prev => [...prev, userMsg]);
        setQuery('');
        setIsThinking(true);

        try {
            if (!isKeySet) {
                initOpenAI(apiKey);
                setIsKeySet(true);
            }
            const aiResponse = await getAIInsights(dataSummary, query);
            setChatHistory(prev => [...prev, { role: 'ai', content: aiResponse }]);
        } catch (error) {
            setChatHistory(prev => [...prev, { role: 'error', content: error.message }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="glass-card ai-chat-container" style={{ gridColumn: 'span 12', marginTop: '1.5rem', display: 'flex', flexDirection: 'column' }}>
            <div className="table-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon name="Sparkles" style={{ color: 'var(--secondary)' }} />
                    <span>AI Data Assistant</span>
                </div>
                {!isKeySet || showKeyInput ? (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="password"
                            placeholder="Enter OpenAI API Key"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '0.5rem', padding: '0.25rem 0.5rem', color: 'white', fontSize: '0.8rem' }}
                        />
                        <button onClick={handleSaveKey} className="header-button" style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Save</button>
                    </div>
                ) : (
                    <button onClick={() => setShowKeyInput(true)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.8rem' }}>Settings</button>
                )}
            </div>

            <div className="chat-messages" style={{ padding: '1.5rem', height: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {chatHistory.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                        <Icon name="MessageSquare" size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                        <p>Ask anything about your data...<br /><small>(e.g., "What are the top trends?" or "Summarize the anomalies")</small></p>
                    </div>
                )}
                {chatHistory.map((msg, i) => (
                    <div key={i} style={{
                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        padding: '1rem',
                        borderRadius: '1rem',
                        background: msg.role === 'user' ? 'var(--primary)' : msg.role === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid ' + (msg.role === 'error' ? '#ef4444' : 'var(--glass-border)'),
                        color: msg.role === 'user' ? 'white' : 'var(--text-main)',
                        fontSize: '0.9rem',
                        lineHeight: '1.5'
                    }}>
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', opacity: 0.6, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>
                            <Icon name={msg.role === 'user' ? 'User' : msg.role === 'ai' ? 'Cpu' : 'AlertCircle'} size={12} />
                            {msg.role}
                        </div>
                        {msg.content}
                    </div>
                ))}
                {isThinking && (
                    <div style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.05)', padding: '1rem', borderRadius: '1rem', color: 'var(--text-muted)' }}>
                        AI is thinking...
                    </div>
                )}
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Ask a question about your dataset..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '1rem', padding: '0.75rem 1.25rem', color: 'white' }}
                />
                <button onClick={handleSend} disabled={isThinking || !apiKey} className="header-button" style={{ background: 'var(--accent)', borderColor: 'var(--accent)' }}>
                    <Icon name="Send" size={18} />
                </button>
            </div>
        </div>
    );
};

export default AIChat;
