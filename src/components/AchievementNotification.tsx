import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Achievement, RARITY_COLORS, RARITY_GLOW } from '../data/achievements';
import { Confetti } from './Confetti';
import './AchievementNotification.css';

interface AchievementNotificationProps {
  achievement: Achievement | null;
  personNames?: string[];
  onClose: () => void;
}

export const AchievementNotification: React.FC<AchievementNotificationProps> = ({ 
  achievement,
  personNames, 
  onClose 
}) => {
  const [show, setShow] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const lastAchievementIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (achievement && achievement.id !== lastAchievementIdRef.current) {
      lastAchievementIdRef.current = achievement.id;
      setShow(true);
      setShowConfetti(true);
      
      // Play achievement sound
      playAchievementSound(achievement.rarity);
      
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(() => {
          setShowConfetti(false);
          onClose();
          lastAchievementIdRef.current = null;
        }, 500);
      }, 4000);
      return () => clearTimeout(timer);
    } else if (!achievement) {
      setShow(false);
      setShowConfetti(false);
      lastAchievementIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [achievement]);

  const playAchievementSound = (rarity: string) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different sounds based on rarity
    const frequencies = {
      common: [523, 659, 784],
      rare: [523, 659, 784, 988],
      epic: [523, 659, 784, 988, 1047],
      legendary: [523, 659, 784, 988, 1047, 1319]
    };
    
    const notes = frequencies[rarity as keyof typeof frequencies] || frequencies.common;
    let currentNote = 0;
    
    oscillator.frequency.setValueAtTime(notes[0], audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    
    const interval = setInterval(() => {
      currentNote++;
      if (currentNote < notes.length) {
        oscillator.frequency.setValueAtTime(notes[currentNote], audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      } else {
        clearInterval(interval);
        oscillator.stop(audioContext.currentTime + 0.1);
      }
    }, 150);
  };

  if (!achievement) return null;

  const rarityColor = RARITY_COLORS[achievement.rarity];
  const rarityGlow = RARITY_GLOW[achievement.rarity];

  // Confetti colors based on rarity
  const confettiColors = {
    common: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFF'],
    rare: ['#2196F3', '#03A9F4', '#00BCD4', '#FFF'],
    epic: ['#9C27B0', '#E91E63', '#FF4081', '#FFF'],
    legendary: ['#FF9800', '#FFC107', '#FFD700', '#FF6F00', '#FFF']
  };

  return (
    <>
      <Confetti 
        active={showConfetti} 
        colors={confettiColors[achievement.rarity]} 
        particleCount={achievement.rarity === 'legendary' ? 200 : 150}
        duration={4000}
      />
    <AnimatePresence>
      {show && (
        <motion.div
          className="achievement-notification"
          initial={{ x: 400, opacity: 0, scale: 0.8 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{
            borderColor: rarityColor,
            boxShadow: `0 8px 32px ${rarityGlow}, 0 0 60px ${rarityGlow}`,
          }}
        >
          <motion.div 
            className="achievement-glow"
            animate={{
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 2, repeat: 2 }}
            style={{ background: `radial-gradient(circle, ${rarityGlow}, transparent)` }}
          />
          
          <div className="achievement-content">
            <div className="achievement-header">
              <span className="achievement-label">🏆 CONQUISTA DESBLOQUEADA!</span>
              <span 
                className="achievement-rarity"
                style={{ color: rarityColor }}
              >
                {achievement.rarity.toUpperCase()}
              </span>
            </div>
            
            {personNames && personNames.length > 0 && (
              <div className="achievement-people">
                {personNames.map((name, idx) => (
                  <div key={idx} className="person-badge">
                    <span className="person-name">{name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="achievement-body">
              <motion.div 
                className="achievement-icon"
                animate={{
                  rotate: [0, -10, 10, -10, 10, 0],
                  scale: [1, 1.2, 1.2, 1.2, 1.2, 1],
                }}
                transition={{ duration: 0.6 }}
              >
                {achievement.icon}
              </motion.div>
              
              <div className="achievement-info">
                <h3 className="achievement-title" style={{ color: rarityColor }}>
                  {achievement.title}
                </h3>
                <p className="achievement-description">{achievement.description}</p>
              </div>
            </div>
          </div>

          <motion.div 
            className="achievement-particles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  background: rarityColor,
                }}
                animate={{
                  y: [-20, -100],
                  x: [0, (Math.random() - 0.5) * 50],
                  opacity: [1, 0],
                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
};
