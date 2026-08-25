import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import ChartViewer from '../shared/ChartViewer';
import { questionBank } from '../../data/questionBank';

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const WORLDS = [
  { id: 0, name: "Picture Graph Point", color: "#4A90D9", focus: "Reading picture graphs", difficulty: "Easy" },
  { id: 1, name: "Bar Graph Yard", color: "#FF8A50", focus: "Reading bar graphs", difficulty: "Easy-Med" },
  { id: 2, name: "Table Town", color: "#A78BFA", focus: "Reading tables", difficulty: "Medium" },
  { id: 3, name: "Line Graph Park", color: "#34D399", focus: "Reading line graphs", difficulty: "Medium" },
  { id: 4, name: "Data Sorting Warehouse", color: "#e6a200", focus: "Mixed graph classification", difficulty: "Med-Hard" },
  { id: 5, name: "Total & Difference Factory", color: "#8b5cf6", focus: "Totals & differences across all graphs", difficulty: "Medium" },
  { id: 6, name: "Most & Least Quest Castle", color: "#06b6d4", focus: "Finding highest/lowest values", difficulty: "Hard" },
  { id: 7, name: "Picture-vs-Bar Lab", color: "#ec4899", focus: "Distinguishing graph features", difficulty: "Hard" },
  { id: 8, name: "Real World Data Safari", color: "#ef4444", focus: "Real-life data scenarios", difficulty: "Hard" },
  { id: 9, name: "Mystery Data Palace", color: "#10b981", focus: "Mixed hard, reverse reasoning", difficulty: "Hardest" }
];

export default function PlayPhase({
  onNext, playSound, speak,
  xp, setXp, totalStars, setTotalStars,
  streak, setStreak, maxStreak, setMaxStreak,
  worldScores, setWorldScores,
  unlockedBadges, unlockBadge,
  usedQuestionIds, setUsedQuestionIds,
  onResetWorlds, setCorrectAnswers
}) {
  const [activeWorld, setActiveWorld] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currQIdx, setCurrQIdx] = useState(0);

  const [lives, setLives] = useState(3);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [answeredState, setAnsweredState] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [floatScore, setFloatScore] = useState(null);

  const startWorld = (worldId) => {
    const worldQuestions = questionBank.filter(q => q.world === worldId);
    const usedForThisWorld = usedQuestionIds[worldId] || [];
    const availableQuestions = worldQuestions.filter(q => !usedForThisWorld.includes(q.id));
    const questionsToUse = availableQuestions.length > 0 ? availableQuestions : worldQuestions;

    setQuestions(shuffle(questionsToUse).slice(0, 10));
    setCurrQIdx(0);
    setLives(3);
    setAttempts(0);
    setHintsUsed(0);
    setAnsweredState(null);
    setSelectedOption(null);
    setShowExplanation(false);
    setActiveWorld(worldId);
    playSound('levelUp');
    speak(`Welcome to World ${worldId + 1}: ${WORLDS[worldId].name}. Let's answer some questions!`);
  };

  const currentQ = questions[currQIdx];

  useEffect(() => {
    if (activeWorld !== null && currentQ) {
      speak(currentQ.questionText);
    }
  }, [currQIdx, activeWorld, currentQ, speak]);

  const handleAnswerSubmit = (option, e) => {
    if (answeredState === 'correct') return;

    setSelectedOption(option);
    const isCorrect = option === currentQ.correctAnswer;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    setUsedQuestionIds(prev => {
      const world = {
        ...prev,
        [activeWorld]: prev[activeWorld] ? [...prev[activeWorld]] : []
      };
      if (!world[activeWorld].includes(currentQ.id)) {
        world[activeWorld].push(currentQ.id);
      }
      return world;
    });

    if (isCorrect) {
      playSound('correct');
      setAnsweredState('correct');
      setCorrectAnswers(prev => prev + 1);
      setStreak(prev => {
        const nextStreak = prev + 1;
        if (nextStreak > maxStreak) setMaxStreak(nextStreak);
        return nextStreak;
      });

      let earnedXP = 10;
      if (nextAttempts === 2) earnedXP = 7;
      if (hintsUsed > 0) earnedXP = 5;

      let bonusXP = 0;
      if (streak >= 4) {
        bonusXP = 5;
        playSound('streak');
      }

      const totalEarned = earnedXP + bonusXP;
      setXp(prev => prev + totalEarned);

      if (e) {
        const rect = e.target.getBoundingClientRect();
        setFloatScore({ x: rect.left + rect.width / 2, y: rect.top, val: `+${totalEarned} XP` });
        setTimeout(() => setFloatScore(null), 1000);
      }

      speakPraisePhrase();

      if (streak + 1 >= 10) unlockBadge('streak_legend');
    } else {
      playSound('wrong');
      setStreak(0);
      setShowExplanation(true);
      setAnsweredState('incorrect');

      if (lives > 1) {
        speak("That's incorrect! Let's check the explanation.");
        setLives(prev => prev - 1);
      } else {
        setLives(0);
        speak("That's incorrect! Oh no, you have run out of hearts. Let's retry this world.");
      }
    }
  };

  const speakPraisePhrase = () => {
    const praises = ["Excellent!", "Well done!", "Brilliant!", "You got it!", "Super smart!"];
    const randomPraise = praises[Math.floor(Math.random() * praises.length)];
    speak(`That's correct! ${randomPraise}`);
  };

  const handleNextQuestion = () => {
    if (currQIdx < 9) {
      setCurrQIdx(prev => prev + 1);
      setAttempts(0);
      setHintsUsed(0);
      setAnsweredState(null);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      const finalWorldScore = Math.max(0, lives + 7);
      setWorldScores(prev => {
        const nextScores = [...prev];
        nextScores[activeWorld] = finalWorldScore;
        return nextScores;
      });

      let stars = 0;
      if (finalWorldScore >= 9) stars = 3;
      else if (finalWorldScore >= 7) stars = 2;
      else if (finalWorldScore >= 5) stars = 1;

      setTotalStars(prev => prev + stars);
      playSound('badge');

      if (activeWorld === 2 && finalWorldScore >= 9) unlockBadge('real_world_champion');
      if (activeWorld === 3 && finalWorldScore >= 9) unlockBadge('perfect_world');

      speak(`Fabulous! You completed the world with ${stars} stars and a score of ${finalWorldScore} out of 10.`);
      setActiveWorld(null);
    }
  };

  const handleRetryWorld = () => { startWorld(activeWorld); };

  const handleUseHint = () => {
    if (hintsUsed < 2) {
      setHintsUsed(prev => prev + 1);
      playSound('explore');
      const hintText = hintsUsed === 0 ? currentQ.hint1 : currentQ.hint2;
      speak(hintText);
    }
  };

  const isWorldUnlocked = (idx) => {
    if (idx === 0) return true;
    const priorScore = worldScores[idx - 1];
    return priorScore !== null && priorScore >= 5;
  };

  // -------------------------------------------------------------
  // RENDER VISUAL for each question
  // -------------------------------------------------------------
  const scenarioEmojis = {
    W8_01: '🍚', W8_02: '📝', W8_03: '🍦', W8_04: '📖', W8_05: '🌦️',
    W8_06: '📚', W8_07: '🍊', W8_08: '📰', W8_09: '🚌', W8_10: '🖼️'
  };

  const renderVisual = () => {
    if (!currentQ || !currentQ.visual) return null;
    const { visual, repType } = currentQ;

    if (visual.startsWith('chart_')) {
      return <ChartViewer type={repType} size={280} />;
    }

    if (visual === 'multi_compare') {
      return (
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center' }}>
          <ChartViewer type="pictograph" size={170} compact />
          <ChartViewer type="bar" size={170} compact />
        </div>
      );
    }

    if (visual === 'real_scenario') {
      const emoji = scenarioEmojis[currentQ.id] || '🎒';
      return (
        <div style={{ fontSize: '96px', animation: 'floatActor 2s ease-in-out infinite alternate' }}>
          {emoji}
        </div>
      );
    }

    return <ChartViewer type={repType || 'bar'} size={280} />;
  };

  // -------------------------------------------------------------
  // VIEWPORT: WORLD SELECT SCREEN
  // -------------------------------------------------------------
  if (activeWorld === null) {
    const allCompleted = worldScores.every(score => score !== null);
    if (allCompleted) unlockBadge('data_master');

    return (
      <div className="main-card" style={{ minHeight: '520px' }}>
        <div className="simulate-header">
          <h2 className="simulate-heading">🎮 Choose Your World!</h2>
          <p className="simulate-sub">Beat each world to unlock the next. Earn stars and XP!</p>
        </div>

        <div className="world-select-list">
          {WORLDS.map((w, idx) => {
            const unlocked = isWorldUnlocked(idx);
            const score = worldScores[idx];
            let starRating = 0;
            if (score >= 9) starRating = 3;
            else if (score >= 7) starRating = 2;
            else if (score >= 5) starRating = 1;

            return (
              <div key={w.id} className={`world-card ${unlocked ? '' : 'world-card--locked'}`}>
                <div className="world-card-left">
                  {unlocked ? (
                    <div className="world-dot-icon" style={{ backgroundColor: `${w.color}20`, border: `2.5px solid ${w.color}` }}>
                      <span style={{ fontSize: '14px' }}>📊</span>
                    </div>
                  ) : (
                    <div className="world-lock-icon">🔒</div>
                  )}
                  <div className="world-info">
                    <span className="world-name">World {w.id + 1}: {w.name}</span>
                    <span className="world-difficulty">Focus: {w.focus} ({w.difficulty})</span>
                  </div>
                </div>

                <div className="world-card-right">
                  {unlocked && score !== null && (
                    <div className="world-stars">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={i} style={{ opacity: i < starRating ? 1 : 0.2 }}>⭐</span>
                      ))}
                    </div>
                  )}
                  {unlocked ? (
                    <button className="btn-play-world" onClick={() => startWorld(w.id)}>
                      {score !== null ? 'REPLAY' : 'PRACTICE'}
                    </button>
                  ) : (
                    <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-locked-gray)' }}>LOCKED</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn-nav-outline" onClick={onResetWorlds} style={{ marginTop: '20px', padding: '10px 24px', fontSize: '14px', alignSelf: 'center' }}>
          🔄 Reset Worlds
        </button>

        {worldScores[0] !== null && (
          <button className="btn-gold" onClick={onNext} style={{ marginTop: '10px', padding: '12px 28px', fontSize: '15px', alignSelf: 'center' }}>
            Go to Reflection ➔
          </button>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEWPORT: QUIZ HUD & GAME SCREEN
  // -------------------------------------------------------------
  const pct = Math.round(((currQIdx + 1) / 10) * 100);

  return (
    <div style={{ width: '100%' }}>
      <div className="quiz-header">
        <div className="world-pill-badge">
          <div className="world-badge-dot" style={{ backgroundColor: WORLDS[activeWorld].color }} />
          <span>{WORLDS[activeWorld].name}</span>
        </div>

        <div className="stats-hud">
          <span className="hud-item hud-item--xp">⭐ {xp} XP</span>
          <span className="hud-item hud-item--lives">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} style={{ opacity: i < lives ? 1 : 0.2 }}>❤️</span>
            ))}
          </span>
          <span className="hud-item hud-item--streak">🔥 {streak}x Streak</span>
        </div>

        <div className="progress-row">
          <span>Question {currQIdx + 1}/10</span>
          <span>{pct}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="main-card" style={{ minHeight: '460px' }}>
        {lives === 0 ? (
          <div className="results-box" style={{ justifyContent: 'center', height: '100%', marginTop: '40px' }}>
            <span style={{ fontSize: '64px' }}>😢</span>
            <h3 className="results-title" style={{ color: 'var(--accent-alert-coral)' }}>Out of Hearts!</h3>
            <p style={{ color: 'var(--text-muted-lavender)' }}>
              Dexter says: "No worries! Let's practice some more. Try again to master this world!"
            </p>
            <div className="results-actions">
              <button className="btn-gold" onClick={handleRetryWorld}>🔄 Retry World</button>
              <button className="btn-nav-outline" onClick={() => setActiveWorld(null)}>🚪 Quit World</button>
            </div>
          </div>
        ) : (
          <div className="quiz-question-box">
            <h2 className="quiz-question-text">{currentQ.questionText}</h2>

            <div className="quiz-visual-area">
              {renderVisual()}
            </div>

            <div className="answer-grid">
              {currentQ.options.map((opt, i) => {
                const isSelected = selectedOption === opt;
                const isCorrectAns = opt === currentQ.correctAnswer;

                let btnClass = "answer-btn";
                if (answeredState) {
                  if (isCorrectAns) btnClass += " answer-btn--correct";
                  else if (isSelected) btnClass += " answer-btn--incorrect";
                }

                return (
                  <button
                    key={i}
                    className={btnClass}
                    onClick={(e) => handleAnswerSubmit(opt, e)}
                    disabled={answeredState !== null}
                  >
                    {opt.toString()}
                  </button>
                );
              })}
            </div>

            {floatScore && (
              <div className="float-up-score" style={{ left: `${floatScore.x}px`, top: `${floatScore.y}px` }}>
                {floatScore.val}
              </div>
            )}

            {hintsUsed > 0 && (
              <div className="hint-drawer">
                <span className="hint-drawer-icon">💡</span>
                <span className="hint-drawer-text">{hintsUsed === 1 ? currentQ.hint1 : currentQ.hint2}</span>
              </div>
            )}

            {showExplanation && (
              <div className="explanation-panel">
                <div className="explanation-heading">💡 Correct Answer Explanation:</div>
                <div className="explanation-text">{currentQ.explanation}</div>
              </div>
            )}

            <div className="quiz-actions">
              <button
                className="btn-hint"
                onClick={handleUseHint}
                disabled={hintsUsed >= 2 || answeredState === 'correct'}
                style={{ opacity: answeredState === 'correct' ? 0.3 : 1 }}
              >
                💡 {hintsUsed === 0 ? 'Use Hint' : hintsUsed === 1 ? 'Show Another Hint' : 'No More Hints'}
              </button>

              {answeredState !== null && (
                <button className="btn-gold" onClick={handleNextQuestion} style={{ padding: '8px 24px', fontSize: '14px' }}>
                  {currQIdx < 9 ? 'Next Question ➔' : 'Complete World ➔'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
