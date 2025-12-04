'use client';

import { useState, useEffect } from 'react';

interface Bat {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  rotation: number;
  size: number;
}

export default function BatExplosion() {
  const [bats, setBats] = useState<Bat[]>([]);
  const [showExplosion, setShowExplosion] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);

  // Enable audio on first user interaction
  useEffect(() => {
    const enableAudio = () => {
      setAudioEnabled(true);
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  // Create creepy bat screech sound
  const playBatSound = () => {
    if (!audioEnabled) return;
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Create oscillators for a creepy bat screech
      const oscillator1 = audioContext.createOscillator();
      const oscillator2 = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // High-pitched screech
      oscillator1.type = 'sawtooth';
      oscillator1.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator1.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.3);
      
      oscillator2.type = 'square';
      oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(1500, audioContext.currentTime + 0.3);
      
      // Volume envelope - LOUDER
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator1.start(audioContext.currentTime);
      oscillator2.start(audioContext.currentTime);
      oscillator1.stop(audioContext.currentTime + 0.5);
      oscillator2.stop(audioContext.currentTime + 0.5);
      
      console.log('🦇 Bat screech played!');
    } catch (e) {
      console.log('Audio error:', e);
    }
  };

  useEffect(() => {
    // Trigger explosion after audio is enabled
    if (audioEnabled) {
      const timer = setTimeout(() => {
        triggerExplosion();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [audioEnabled]);

  const triggerExplosion = () => {
    setShowExplosion(true);
    
    // Play creepy bat sound
    playBatSound();
    
    // Create 50 bats exploding from center
    const newBats: Bat[] = [];
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 720;
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 2 : 400;
    
    for (let i = 0; i < 50; i++) {
      const angle = (Math.PI * 2 * i) / 50; // Evenly distributed angles
      newBats.push({
        id: i,
        x: centerX,
        y: centerY,
        angle,
        speed: 3 + Math.random() * 4,
        rotation: Math.random() * 360,
        size: 30 + Math.random() * 30
      });
    }
    
    setBats(newBats);

    // Animate bats
    const interval = setInterval(() => {
      setBats(prevBats => 
        prevBats.map(bat => ({
          ...bat,
          x: bat.x + Math.cos(bat.angle) * bat.speed,
          y: bat.y + Math.sin(bat.angle) * bat.speed,
          rotation: bat.rotation + 10,
          speed: bat.speed * 1.08 // Accelerate faster
        })).filter(bat => {
          // Remove bats that are off screen
          const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
          const h = typeof window !== 'undefined' ? window.innerHeight : 900;
          return bat.x > -200 && bat.x < w + 200 &&
                 bat.y > -200 && bat.y < h + 200;
        })
      );
    }, 20);

    // Clean up after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setShowExplosion(false);
      setBats([]);
    }, 5000);
  };

  if (!showExplosion) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      {bats.map(bat => (
        <div
          key={bat.id}
          style={{
            position: 'absolute',
            left: bat.x,
            top: bat.y,
            fontSize: `${bat.size}px`,
            transform: `translate(-50%, -50%) rotate(${bat.rotation}deg)`,
            opacity: 0.9,
            filter: 'drop-shadow(0 0 10px rgba(138, 43, 226, 0.8))',
            textShadow: '0 0 20px rgba(138, 43, 226, 0.8)'
          }}
        >
          🦇
        </div>
      ))}
    </div>
  );
}
