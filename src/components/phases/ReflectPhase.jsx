import React from 'react';
import Mascot from '../shared/Mascot';

const getBadgeIcon = (id) => {
  switch (id) {
    case 'graph_spotter': return '🔍';
    case 'value_pro': return '✏️';
    case 'data_master': return '👑';
    case 'perfect_world': return '🎯';
    case 'streak_legend': return '🔥';
    case 'real_world_champion': return '🌍';
    case 'data_explorer': return '📊';
    case 'full_journey': return '🎓';
    default: return '⭐';
  }
};

const getBadgeLabel = (id) => {
  switch (id) {
    case 'graph_spotter': return 'Graph Spotter';
    case 'value_pro': return 'Value Pro';
    case 'data_master': return 'Data Master';
    case 'perfect_world': return 'Perfect World';
    case 'streak_legend': return 'Streak Legend';
    case 'real_world_champion': return 'Real World Champion';
    case 'data_explorer': return 'Data Explorer';
    case 'full_journey': return 'Full Journey';
    default: return 'Badge Unlocked';
  }
};

const WORLD_DATA = [
  { name: "Picture Graph Point", emoji: "🖼️" },
  { name: "Bar Graph Yard", emoji: "📊" },
  { name: "Table Town", emoji: "🗂️" },
  { name: "Line Graph Park", emoji: "📈" },
  { name: "Data Sorting Warehouse", emoji: "🏢" },
  { name: "Total & Difference Factory", emoji: "🏭" },
  { name: "Most & Least Quest Castle", emoji: "🏰" },
  { name: "Picture-vs-Bar Lab", emoji: "🔬" },
  { name: "Real World Data Safari", emoji: "🌍" },
  { name: "Mystery Data Palace", emoji: "🎪" },
];

const REFLECTION_PROMPTS = [
  "Tell me one way you could collect data about your classmates!",
  "What's your favourite way to show data — pictures, bars, tables, or lines?",
  "Can you name a graph type that uses a key?",
  "Where might you spot a bar graph or line graph in real life?",
  "What's the difference between a picture graph and a table?"
];

export default function ReflectPhase({
  xp, totalStars, unlockedBadges, worldScores, correctAnswers,
  onReset, playSound, speak, unlockBadge
}) {
  const getStarRating = (score) => {
    if (score === null) return 0;
    if (score >= 9) return 3;
    if (score >= 7) return 2;
    if (score >= 5) return 1;
    return 0;
  };

  const totalStarsEarned = worldScores.reduce((acc, score) => acc + getStarRating(score), 0);
  const worldsCompleted = worldScores.filter(score => score !== null).length;

  return (
    <div className="main-card" style={{ minHeight: '520px' }}>
      <Mascot mood="excited" bubble="Amazing work! Let's reflect a little! 📋" />

      <h2 style={{ color: 'var(--accent-gold)', fontSize: '28px', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
        Your Performance!
      </h2>

      <div className="results-stats-row" style={{ marginBottom: '32px' }}>
        <div className="results-stat-card">
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>⭐</div>
          <div className="results-stat-val">{totalStarsEarned}</div>
          <div className="results-stat-label">Total Stars</div>
        </div>
        <div className="results-stat-card">
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>✅</div>
          <div className="results-stat-val">{correctAnswers}</div>
          <div className="results-stat-label">Correct Answers</div>
        </div>
        <div className="results-stat-card">
          <div style={{ fontSize: '32px', marginBottom: '4px' }}>🌍</div>
          <div className="results-stat-val">{worldsCompleted}/10</div>
          <div className="results-stat-label">Worlds Completed</div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '18px', textAlign: 'center' }}>
          World Progress
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', justifyContent: 'center', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
          {WORLD_DATA.map((world, idx) => {
            const stars = getStarRating(worldScores[idx]);
            const completed = worldScores[idx] !== null;
            return (
              <div key={idx} style={{ background: completed ? 'rgba(255, 190, 26, 0.15)' : 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '20px' }}>{world.emoji}</span>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ fontSize: '10px', opacity: i < stars ? 1 : 0.2 }}>☆</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {unlockedBadges.length > 0 && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px', fontSize: '18px', textAlign: 'center' }}>
            Badges Earned
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
            {unlockedBadges.map((id) => (
              <div key={id} style={{ background: 'rgba(255, 190, 26, 0.12)', border: '1px solid rgba(255, 190, 26, 0.3)', borderRadius: '12px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: 'var(--accent-gold)' }}>
                <span style={{ fontSize: '18px' }}>{getBadgeIcon(id)}</span>
                {getBadgeLabel(id)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--accent-gold)', fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>
          Time to Reflect!
        </h3>
        <p style={{ color: 'var(--text-muted-lavender)', fontSize: '14px', marginBottom: '16px' }}>
          {REFLECTION_PROMPTS[0]}
        </p>
        <div style={{ background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', padding: '16px', color: 'var(--text-muted-lavender)', fontSize: '13px' }}>
          I could ask my classmates a question, tally their answers, and show the results using a picture graph or bar graph...
        </div>
      </div>

      <button className="btn-nav-outline" onClick={onReset} style={{ marginTop: '24px', padding: '10px 24px', fontSize: '14px', alignSelf: 'center' }}>
        🔄 Start a New Journey
      </button>
    </div>
  );
}
