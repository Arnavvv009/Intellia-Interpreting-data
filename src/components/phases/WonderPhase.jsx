import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';

const barHeights = [22, 40, 16, 32, 48];
const barColors = ['#4A90D9', '#FF8A50', '#A78BFA', '#34D399', '#ffbe1a'];

export default function WonderPhase({ onNext, playSound, speak }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    speak("Ms. Tan wrote down a messy list of numbers about her class's favourite fruits. It was hard to read! Then she turned it into a picture with bars. What could that picture be called?");
  }, [speak]);

  const handleReveal = () => {
    if (revealed) {
      onNext();
      return;
    }
    setRevealed(true);
    playSound('shapeReveal');
    speak("It's a Bar Graph! Graphs and tables turn messy numbers into clear data we can read at a glance. Let's explore more in the story.");
  };

  return (
    <div className="main-card">
      <Mascot
        mood={revealed ? "happy" : "thinking"}
        bubble={revealed ? "Aha! It's a Bar Graph — a way to picture data! 📊" : "Hmm... I wonder..."}
      />

      {/* Reveal Viewport */}
      <div className="wonder-badge-circle">
        <div className={`wonder-silhouette ${revealed ? 'wonder-revealed' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
          <div className="wonder-data-reveal">
            {barHeights.map((h, i) => (
              <div
                key={i}
                className="wonder-data-bar"
                style={{
                  height: revealed ? `${h}px` : '12px',
                  backgroundColor: revealed ? barColors[i] : '#3b2875',
                  opacity: revealed ? 1 : 0.5
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <h2 className="wonder-heading">
        Ms. Tan wrote down a messy list of numbers about her class's favourite fruits. It was hard to read! Then she turned it into a picture with bars. What could that picture be called?
      </h2>

      <p className="wonder-subtitle">
        What if we counted the bars and compared their heights to find out?
      </p>

      <div className="hint-fact-pill">
        ✨ We could look at how tall each bar is to compare the numbers! ✨
      </div>

      {revealed && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden' }}>
          {Array.from({ length: 24 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const size = Math.random() * 6 + 6;
            const color = ['#ffbe1a', '#22c55e', '#a78bfa', '#ff8a50'][i % 4];
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${left}%`,
                  top: '60%',
                  width: `${size}px`,
                  height: `${size}px`,
                  backgroundColor: color,
                  borderRadius: i % 2 === 0 ? '50%' : '0',
                  opacity: 0.8,
                  transform: 'translateY(0)',
                  animation: `floatUp 1.2s ease-out forwards`,
                  animationDelay: `${delay}s`
                }}
              />
            );
          })}
        </div>
      )}

      <button
        className="btn-gold"
        onClick={handleReveal}
        style={{ marginTop: 'auto', alignSelf: 'center' }}
      >
        {revealed ? "Let's Read the Story! ➔" : "I have a guess! 🔍 Let's Find Out!"}
      </button>
    </div>
  );
}
