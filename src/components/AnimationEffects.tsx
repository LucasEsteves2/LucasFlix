import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPieceProps {
  x: number;
  delay: number;
  color: string;
  size: number;
}

const ConfettiPiece: React.FC<ConfettiPieceProps> = ({ x, delay, color, size }) => {
  const randomRotate = Math.random() * 720 - 360;
  const randomX = Math.random() * 200 - 100;

  return (
    <motion.div
      initial={{ 
        y: -20, 
        x: x,
        rotate: 0,
        opacity: 1
      }}
      animate={{ 
        y: window.innerHeight + 100,
        x: x + randomX,
        rotate: randomRotate,
        opacity: [1, 1, 0.8, 0]
      }}
      transition={{
        duration: 3 + Math.random() * 2,
        delay: delay,
        ease: "easeIn"
      }}
      style={{
        position: 'fixed',
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

interface ConfettiExplosionProps {
  trigger: boolean;
  duration?: number;
  particleCount?: number;
}

export const ConfettiExplosion: React.FC<ConfettiExplosionProps> = ({ 
  trigger, 
  duration = 3000,
  particleCount = 80 
}) => {
  const [show, setShow] = useState(false);
  
  const colors = [
    '#e50914', // Netflix red
    '#ff6b6b',
    '#ffd700', // Gold
    '#ff69b4', // Pink
    '#9c27b0', // Purple
    '#00bcd4', // Cyan
    '#4caf50', // Green
    '#ff9800', // Orange
    '#ffffff'  // White
  ];

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}>
        {[...Array(particleCount)].map((_, i) => (
          <ConfettiPiece
            key={i}
            x={Math.random() * window.innerWidth}
            delay={Math.random() * 0.5}
            color={colors[Math.floor(Math.random() * colors.length)]}
            size={5 + Math.random() * 10}
          />
        ))}
      </div>
    </AnimatePresence>
  );
};

interface SleepAnimationProps {
  trigger: boolean;
  personName?: string;
}

export const SleepAnimation: React.FC<SleepAnimationProps> = ({ trigger, personName }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (trigger) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1rem'
        }}
      >
        {/* Fundo escuro */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(circle, rgba(0,0,0,0.9), rgba(0,0,0,0.95))',
            backdropFilter: 'blur(5px)'
          }}
        />

        {/* Z's caindo */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              y: -50,
              x: (Math.random() - 0.5) * window.innerWidth * 0.8,
              opacity: 0,
              scale: 0.5
            }}
            animate={{ 
              y: window.innerHeight,
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.5, 1.5, 0.8],
              rotate: [0, 360]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              delay: i * 0.15,
              ease: "easeIn"
            }}
            style={{
              position: 'absolute',
              fontSize: `${2 + Math.random() * 3}rem`,
              color: '#9c27b0',
              textShadow: '0 0 20px rgba(156, 39, 176, 0.8)',
              fontWeight: 'bold',
              zIndex: 1
            }}
          >
            z
          </motion.div>
        ))}

        {/* Mensagem central */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ 
            scale: [0, 1.2, 1],
            rotate: [10, -5, 0]
          }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            duration: 0.6,
            type: "spring",
            stiffness: 200
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            textAlign: 'center',
            padding: '2rem 3rem',
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.2), rgba(229, 9, 20, 0.2))',
            backdropFilter: 'blur(10px)',
            border: '2px solid rgba(156, 39, 176, 0.5)',
            borderRadius: '20px',
            boxShadow: '0 0 50px rgba(156, 39, 176, 0.5)'
          }}
        >
          <motion.div
            animate={{ 
              rotate: [-5, 5, -5],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ fontSize: '4rem', marginBottom: '1rem' }}
          >
            😴
          </motion.div>
          <h2 style={{ 
            fontSize: '2rem', 
            color: '#ff69b4',
            textShadow: '0 0 20px rgba(255, 105, 180, 0.8)',
            fontWeight: 900,
            marginBottom: '0.5rem'
          }}>
            {personName ? `${personName} dormiu!` : 'Alguém dormiu!'}
          </h2>
          <p style={{ 
            fontSize: '1.2rem', 
            color: '#ffffff',
            textShadow: '0 2px 10px rgba(0,0,0,0.8)'
          }}>
            💤 Mais um para o Mural da Vergonha 💤
          </p>
        </motion.div>

        {/* Lua */}
        <motion.div
          initial={{ scale: 0, y: -100 }}
          animate={{ 
            scale: 1,
            y: 0,
            rotate: 360
          }}
          transition={{ 
            duration: 2,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            fontSize: '6rem',
            filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.5))',
            zIndex: 1
          }}
        >
          🌙
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
