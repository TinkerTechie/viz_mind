import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Icon } from './Icon';

const CustomAudioPlayer = ({ text, onReset }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const utteranceRef = useRef(null);

    useEffect(() => {
        if (!text) return;
        const utterance = new SpeechSynthesisUtterance(text);
        
        const setVoice = () => {
            const voices = speechSynthesis.getVoices();
            const preferredVoice = voices.find(v => v.name.includes('Google') || v.lang.startsWith('en'));
            utterance.voice = preferredVoice || voices[0];
        }

        if (speechSynthesis.getVoices().length === 0) {
            speechSynthesis.onvoiceschanged = setVoice;
        } else {
            setVoice();
        }

        utterance.rate = 0.9;
        
        utterance.onstart = () => setIsPlaying(true);
        utterance.onend = () => {
            setIsPlaying(false);
            setProgress(0);
        };
        utterance.onboundary = (e) => {
            if (e.name === 'word') {
                setProgress((e.charIndex / text.length) * 100);
            }
        };
        utteranceRef.current = utterance;

        return () => {
            speechSynthesis.cancel();
            speechSynthesis.onvoiceschanged = null;
        }
    }, [text]);

    const togglePlay = () => {
        if (!utteranceRef.current) return;

        if (speechSynthesis.speaking) {
            speechSynthesis.pause();
            setIsPlaying(false);
        } else {
            if(speechSynthesis.paused) {
                speechSynthesis.resume();
            } else {
                speechSynthesis.speak(utteranceRef.current);
            }
            setIsPlaying(true);
        }
    };
    
    return (
        <motion.div 
            className="audio-player glass-card"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
        >
            <div className="audio-player-header">
                <h3>Voice Summary</h3>
                 <button onClick={onReset}>
                    <Icon name="RotateCcw" />
                </button>
            </div>
            <div className="audio-player-controls">
                <button onClick={togglePlay} className="play-pause-btn">
                    <Icon name={isPlaying ? "Pause" : "Play"} />
                </button>
                <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
        </motion.div>
    );
};

export default CustomAudioPlayer;