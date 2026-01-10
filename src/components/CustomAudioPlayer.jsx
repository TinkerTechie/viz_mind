import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';

const CustomAudioPlayer = ({ text, onReset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isVoicesLoaded, setIsVoicesLoaded] = useState(false);
    const utteranceRef = useRef(null);

    useEffect(() => {
        const setupVoices = () => {
            const voices = speechSynthesis.getVoices();
            if (voices.length > 0) {
                setIsVoicesLoaded(true);
            }
        };

        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = setupVoices;
        } else {
            setIsVoicesLoaded(true);
        }

        return () => {
            speechSynthesis.onvoiceschanged = null;
            speechSynthesis.cancel();
        };
    }, []);

    useEffect(() => {
        if (!text || !isVoicesLoaded) return;

        speechSynthesis.cancel(); // Stop any current speech

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = speechSynthesis.getVoices();

        // Find best voice
        const preferredVoice = voices.find(v => v.lang.includes('en-GB') && v.name.includes('Neural')) ||
            voices.find(v => v.lang.includes('en') && v.name.includes('Google')) ||
            voices.find(v => v.lang.includes('en')) ||
            voices[0];

        utterance.voice = preferredVoice;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsPlaying(true);
            setProgress(0);
        };

        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(100);
        };

        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;
                const totalLength = text.length;
                setProgress((charIndex / totalLength) * 100);
            }
        };

        utteranceRef.current = utterance;
    }, [text, isVoicesLoaded]);

    const togglePlay = () => {
        if (!utteranceRef.current) return;

        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                setIsPlaying(true);
            } else {
                speechSynthesis.pause();
                setIsPlaying(false);
            }
        } else {
            speechSynthesis.speak(utteranceRef.current);
            setIsPlaying(true);
        }
    };

    const stopPlay = () => {
        speechSynthesis.cancel();
        setIsPlaying(false);
        setProgress(0);
    };

    return (
        <motion.div
            className="audio-player glass-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="audio-player-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: isPlaying ? 'var(--secondary)' : 'var(--text-muted)',
                        boxShadow: isPlaying ? '0 0 10px var(--secondary)' : 'none',
                        transition: 'all 0.3s ease'
                    }}></div>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: isPlaying ? 'white' : 'var(--text-muted)' }}>
                        AI Voice Narrator
                    </span>
                </div>
                <Icon name="Waveform" size={14} style={{ color: isPlaying ? 'var(--secondary)' : 'var(--text-muted)', opacity: 0.5 }} />
            </div>

            <div style={{ padding: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="audio-player-controls">
                    <button
                        onClick={togglePlay}
                        className={`play-pause-btn ${!isVoicesLoaded ? 'loading' : ''}`}
                        disabled={!isVoicesLoaded}
                        style={{ background: isPlaying ? 'rgba(255,255,255,0.1)' : 'var(--primary)' }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isPlaying ? 'pause' : 'play'}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Icon name={isPlaying ? "Pause" : "Play"} size={22} style={{ fill: isPlaying ? 'white' : 'none' }} />
                            </motion.div>
                        </AnimatePresence>
                    </button>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'white', display: 'flex', justifyContent: 'space-between' }}>
                            <span>{isPlaying ? "Generating Insights..." : isVoicesLoaded ? "Ready for Briefing" : "Initializing Voice..."}</span>
                            <span style={{ opacity: 0.5 }}>{Math.round(progress)}%</span>
                        </div>
                        <div className="progress-bar-container" style={{ overflow: 'hidden', height: '6px' }}>
                            <motion.div
                                className="progress-bar"
                                style={{
                                    width: `${progress}%`,
                                    background: 'linear-gradient(90deg, var(--primary), var(--secondary))'
                                }}
                                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                            />
                        </div>
                    </div>
                </div>

                {isPlaying && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={stopPlay}
                        style={{
                            alignSelf: 'center',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#ef4444',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '0.4rem 1rem',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        <Icon name="Square" size={12} fill="#ef4444" />
                        STOP CAPTURE
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
};

export default CustomAudioPlayer;