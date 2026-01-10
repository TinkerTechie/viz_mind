import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';

const CustomAudioPlayer = ({ text, onReset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const utteranceRef = useRef(null);
    const [voiceIndex, setVoiceIndex] = useState(0);

    useEffect(() => {
        if (!text) return;

        const setupUtterance = () => {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = speechSynthesis.getVoices();

            // Try to find a premium/natural-sounding voice
            const preferredVoices = voices.filter(v => v.lang.startsWith('en'));
            utterance.voice = preferredVoices[voiceIndex % preferredVoices.length] || voices[0];
            utterance.rate = 1.0;
            utterance.pitch = 1.0;

            utterance.onstart = () => setIsPlaying(true);
            utterance.onend = () => {
                setIsPlaying(false);
                setProgress(0);
            };
            utterance.onerror = (e) => {
                console.error("Speech error:", e);
                setIsPlaying(false);
            };
            utterance.onboundary = (e) => {
                if (e.name === 'word') {
                    setProgress((e.charIndex / text.length) * 100);
                }
            };
            utteranceRef.current = utterance;
        };

        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = setupUtterance;
        } else {
            setupUtterance();
        }

        return () => {
            speechSynthesis.cancel();
            speechSynthesis.onvoiceschanged = null;
        }
    }, [text, voiceIndex]);

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
            variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
            style={{ marginBottom: '0rem' }}
        >
            <div className="audio-player-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isPlaying ? 'var(--secondary)' : 'var(--text-muted)', boxShadow: isPlaying ? '0 0 10px var(--secondary)' : 'none' }}></div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Audio Insight Summary</h3>
                </div>
                <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }} title="Reset Analysis">
                    <Icon name="RefreshCw" size={16} />
                </button>
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>
                "Analyzing dataset properties and highlighting key findings..."
            </div>

            <div className="audio-player-controls">
                <button onClick={togglePlay} className="play-pause-btn">
                    <Icon name={isPlaying ? "Pause" : "Play"} size={24} style={{ marginLeft: isPlaying ? 0 : 4 }} />
                </button>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="progress-bar-container" style={{ background: 'rgba(255,255,255,0.05)', height: '8px' }}>
                        <motion.div
                            className="progress-bar"
                            style={{ width: `${progress}%` }}
                            animate={{ width: `${progress}%` }}
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                            {isPlaying ? 'READING SUMMARY...' : 'READY TO PLAY'}
                        </div>
                        {isPlaying && (
                            <button onClick={stopPlay} style={{ background: 'none', border: 'none', color: 'var(--secondary)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                STOP
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomAudioPlayer;