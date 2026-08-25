import React, { useState, useEffect } from 'react';
import Mascot from '../shared/Mascot';
import ChartViewer from '../shared/ChartViewer';
import { REPRESENTATIONS } from '../../data/chartData';

const REP_KEYS = Object.keys(REPRESENTATIONS); // pictograph, bar, table, line

export default function SimulatePhase({ onNext, playSound, speak }) {
  const [station, setStation] = useState(0); // 0=Explorer,1=Counter,2=Match,3=Sandbox
  const [completedStations, setCompletedStations] = useState([false, false, false, false]);

  useEffect(() => {
    if (station === 0) {
      speak("Welcome to the Graph Explorer! Choose a data representation, and toggle highlights to find the total, highest, and lowest values.");
    } else if (station === 1) {
      speak("In the Data Counter, let's read the numbers. Tap the chart to explore, then use the number pad to fill in the grid.");
    } else if (station === 2) {
      speak("Let's match the descriptions on the left with the correct graph names on the right.");
    } else if (station === 3) {
      speak("Welcome to the Trend Sandbox. Tell me which features each graph type has, then click watch it to see why!");
    }
  }, [station, speak]);

  const markStationCompleted = (idx) => {
    setCompletedStations(prev => {
      const updated = [...prev];
      updated[idx] = true;
      return updated;
    });
  };

  // -------------------------------------------------------------
  // STATION A: Graph Explorer
  // -------------------------------------------------------------
  const [activeRep, setActiveRep] = useState('pictograph');
  const [highlightMode, setHighlightMode] = useState(null); // 'total' | 'highest' | 'lowest'
  const [explorerTracks, setExplorerTracks] = useState({
    pictograph: new Set(), bar: new Set(), table: new Set(), line: new Set()
  });

  const handleHighlightToggle = (mode) => {
    setHighlightMode(prev => (prev === mode ? null : mode));
    playSound('explore');

    setExplorerTracks(prev => {
      const updated = { ...prev };
      const currentSet = new Set(updated[activeRep]);
      currentSet.add(mode);
      updated[activeRep] = currentSet;

      const allExplored = Object.keys(updated).every(k => {
        const s = updated[k];
        return s.has('total') && s.has('highest') && s.has('lowest');
      });
      if (allExplored) markStationCompleted(0);
      return updated;
    });
  };

  // -------------------------------------------------------------
  // STATION B: Data Counter
  // -------------------------------------------------------------
  const [counterRep, setCounterRep] = useState('pictograph');
  const [tallyMode, setTallyMode] = useState('total'); // 'total' | 'highest' | 'lowest'
  const [tallyList, setTallyList] = useState([]);
  const [tallyAnswers, setTallyAnswers] = useState({
    pictograph: { total: '', highest: '', lowest: '' },
    bar: { total: '', highest: '', lowest: '' },
    table: { total: '', highest: '', lowest: '' },
    line: { total: '', highest: '', lowest: '' }
  });
  const [activeCell, setActiveCell] = useState({ rep: 'pictograph', prop: 'total' });

  const handleTallyClick = (label) => {
    setTallyList(prev => {
      if (prev.includes(label)) return prev;
      playSound('explore');
      return [...prev, label];
    });
  };

  const correctValue = (rep, prop) => {
    if (prop === 'highest') return REPRESENTATIONS[rep].highest.value;
    if (prop === 'lowest') return REPRESENTATIONS[rep].lowest.value;
    return REPRESENTATIONS[rep].total;
  };

  const handleNumPadInput = (num) => {
    setTallyAnswers(prev => {
      const nextAns = {
        ...prev,
        [activeCell.rep]: {
          ...prev[activeCell.rep]
        }
      };
      const currentVal = nextAns[activeCell.rep][activeCell.prop].toString();

      if (num === 'C') {
        nextAns[activeCell.rep][activeCell.prop] = '';
      } else if (num === '✓') {
        const correctVal = correctValue(activeCell.rep, activeCell.prop);
        const enteredVal = parseInt(nextAns[activeCell.rep][activeCell.prop], 10);
        if (enteredVal === correctVal) playSound('correct');
        else playSound('wrong');
      } else {
        const nextVal = currentVal + num;
        if (parseInt(nextVal, 10) <= 200) {
          nextAns[activeCell.rep][activeCell.prop] = parseInt(nextVal, 10);
        }
      }
      checkStationBCompletion(nextAns);
      return nextAns;
    });
  };

  const checkStationBCompletion = (answersObj) => {
    const isComplete = Object.keys(answersObj).every(k => {
      const row = answersObj[k];
      return parseInt(row.total, 10) === correctValue(k, 'total') &&
             parseInt(row.highest, 10) === correctValue(k, 'highest') &&
             parseInt(row.lowest, 10) === correctValue(k, 'lowest');
    });
    if (isComplete) markStationCompleted(1);
  };

  const resetStationB = () => {
    setTallyAnswers({
      pictograph: { total: '', highest: '', lowest: '' },
      bar: { total: '', highest: '', lowest: '' },
      table: { total: '', highest: '', lowest: '' },
      line: { total: '', highest: '', lowest: '' }
    });
    setTallyList([]);
    setCompletedStations(prev => {
      const next = [...prev];
      next[1] = false;
      return next;
    });
    playSound('explore');
  };

  useEffect(() => {
    setTallyList([]);
  }, [counterRep]);

  // -------------------------------------------------------------
  // STATION C: Match the Graph
  // -------------------------------------------------------------
  const [selectedNet, setSelectedNet] = useState(null);
  const [selectedShapeName, setSelectedShapeName] = useState(null);
  const [matches, setMatches] = useState({});

  const leftNets = REP_KEYS.map(k => ({ text: REPRESENTATIONS[k].netDescription, rep: k }));
  const rightNames = [
    { text: "Line Graph", id: "line" },
    { text: "Picture Graph", id: "pictograph" },
    { text: "Table", id: "table" },
    { text: "Bar Graph", id: "bar" }
  ];

  const handleMatchClick = (side, idx) => {
    if (side === 'left') {
      if (Object.keys(matches).includes(idx.toString())) return;
      setSelectedNet(idx);
      if (selectedShapeName !== null) verifyMatch(idx, selectedShapeName);
    } else {
      if (Object.values(matches).includes(idx)) return;
      setSelectedShapeName(idx);
      if (selectedNet !== null) verifyMatch(selectedNet, idx);
    }
  };

  const verifyMatch = (leftIdx, rightIdx) => {
    const net = leftNets[leftIdx];
    const name = rightNames[rightIdx];

    if (net.rep === name.id) {
      playSound('correct');
      setMatches(prev => {
        const nextMatches = { ...prev, [leftIdx]: rightIdx };
        if (Object.keys(nextMatches).length === 4) markStationCompleted(2);
        return nextMatches;
      });
    } else {
      playSound('wrong');
    }
    setSelectedNet(null);
    setSelectedShapeName(null);
  };

  const resetStationC = () => {
    setMatches({});
    setSelectedNet(null);
    setSelectedShapeName(null);
    setCompletedStations(prev => {
      const next = [...prev];
      next[2] = false;
      return next;
    });
    playSound('explore');
  };

  // -------------------------------------------------------------
  // STATION D: Trend Sandbox
  // -------------------------------------------------------------
  const [sandboxToggles, setSandboxToggles] = useState({
    pictograph: { usesKey: null, usesAxis: null, bestForTrends: null },
    bar: { usesKey: null, usesAxis: null, bestForTrends: null },
    table: { usesKey: null, usesAxis: null, bestForTrends: null },
    line: { usesKey: null, usesAxis: null, bestForTrends: null }
  });
  const [sandboxDemo, setSandboxDemo] = useState(null); // { rep, feature }
  const [demoTrigger, setDemoTrigger] = useState(0);

  const handleSandboxToggle = (repId, feature) => {
    setSandboxToggles(prev => {
      const next = {
        ...prev,
        [repId]: {
          ...prev[repId]
        }
      };
      const current = next[repId][feature];
      next[repId][feature] = current === null ? true : current === true ? false : null;

      const correctVal = REPRESENTATIONS[repId][feature];
      if (next[repId][feature] === correctVal) playSound('explore');
      else if (next[repId][feature] !== null) playSound('wrong');

      checkStationDCompletion(next);
      return next;
    });
  };

  const checkStationDCompletion = (togglesObj) => {
    const isComplete = Object.keys(togglesObj).every(k => {
      const row = togglesObj[k];
      return row.usesKey === REPRESENTATIONS[k].usesKey &&
             row.usesAxis === REPRESENTATIONS[k].usesAxis &&
             row.bestForTrends === REPRESENTATIONS[k].bestForTrends;
    });
    if (isComplete) markStationCompleted(3);
  };

  const resetStationD = () => {
    setSandboxToggles({
      pictograph: { usesKey: null, usesAxis: null, bestForTrends: null },
      bar: { usesKey: null, usesAxis: null, bestForTrends: null },
      table: { usesKey: null, usesAxis: null, bestForTrends: null },
      line: { usesKey: null, usesAxis: null, bestForTrends: null }
    });
    setSandboxDemo(null);
    setCompletedStations(prev => {
      const next = [...prev];
      next[3] = false;
      return next;
    });
    playSound('explore');
  };

  const triggerWatchIt = (repId, feature) => {
    setSandboxDemo({ rep: repId, feature });
    setDemoTrigger(prev => prev + 1);
    playSound('shapeReveal');
    const featureLabel = feature === 'usesKey' ? 'the key' : feature === 'usesAxis' ? 'the axis and scale' : 'the trend over time';
    speak(`Watch how the ${REPRESENTATIONS[repId].name} shows ${featureLabel}!`);
  };

  const renderDemo = () => {
    if (!sandboxDemo) return null;
    const { rep, feature } = sandboxDemo;
    const rname = REPRESENTATIONS[rep].name;
    let icon = '🔑';
    let text = `${rname} uses a key!`;
    if (feature === 'usesAxis') { icon = '📐'; text = `${rname} uses an axis and scale!`; }
    if (feature === 'bestForTrends') { icon = '📈'; text = `${rname} shows change over time!`; }

    return (
      <div key={demoTrigger} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', animation: 'bounceIn 0.5s ease forwards' }}>
        <span style={{ fontSize: '32px' }}>{icon}</span>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--accent-gold)', textAlign: 'center' }}>{text}</span>
      </div>
    );
  };

  const currentStationComplete = completedStations[station];

  return (
    <div style={{ width: '100%' }}>
      <div className="simulate-header">
        <h2 className="simulate-heading">✏️ Simulate</h2>
        <p className="simulate-sub">Explore and discover — no wrong answers!</p>
      </div>

      <div className="simulate-tabs">
        {[
          { id: 0, label: "Graph Explorer", badge: "A", color: "#a78bfa" },
          { id: 1, label: "Data Counter", badge: "B", color: "#34d399" },
          { id: 2, label: "Match the Graph", badge: "C", color: "#ffbe1a" },
          { id: 3, label: "Trend Sandbox", badge: "D", color: "#ff8a50" }
        ].map((tab) => (
          <div
            key={tab.id}
            className={`sim-tab ${station === tab.id ? 'sim-tab--active' : ''}`}
            onClick={() => setStation(tab.id)}
          >
            <div className="sim-tab-badge" style={{ backgroundColor: tab.color }}>{tab.badge}</div>
            <span style={{ fontSize: '13px', fontWeight: '700' }}>{tab.label}</span>
            {completedStations[tab.id] && <span style={{ color: 'var(--accent-success-green)' }}>✓</span>}
          </div>
        ))}
      </div>

      <div className="main-card" style={{ minHeight: '520px' }}>

        {/* ================= STATION A: GRAPH EXPLORER ================= */}
        {station === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="sim-station-title"><span>📊</span> Graph Explorer</h3>
            <p className="sim-station-instruction">Pick a graph type, then toggle the highlights to explore its data.</p>

            <div className="shape-selector-row">
              {REP_KEYS.map((k) => (
                <button
                  key={k}
                  className={`shape-selector-btn ${activeRep === k ? 'shape-selector-btn--active' : ''}`}
                  onClick={() => { setActiveRep(k); speak(REPRESENTATIONS[k].name); playSound('explore'); }}
                >
                  {REPRESENTATIONS[k].emoji} {REPRESENTATIONS[k].name}
                </button>
              ))}
            </div>

            <ChartViewer type={activeRep} highlight={highlightMode} size={260} />

            <div className="highlight-controls">
              <button
                className={`btn-highlight-toggle ${highlightMode === 'total' ? 'btn-highlight-toggle--active' : ''}`}
                onClick={() => handleHighlightToggle('total')}
              >
                Highlight Total ({REPRESENTATIONS[activeRep].total})
              </button>
              <button
                className={`btn-highlight-toggle ${highlightMode === 'highest' ? 'btn-highlight-toggle--active' : ''}`}
                onClick={() => handleHighlightToggle('highest')}
              >
                Highlight Highest ({REPRESENTATIONS[activeRep].highest.value})
              </button>
              <button
                className={`btn-highlight-toggle ${highlightMode === 'lowest' ? 'btn-highlight-toggle--active' : ''}`}
                onClick={() => handleHighlightToggle('lowest')}
              >
                Highlight Lowest ({REPRESENTATIONS[activeRep].lowest.value})
              </button>
            </div>

            <div className="property-live-tally">
              <div className="tally-row">
                <span className="tally-item" style={{ color: 'var(--accent-gold)' }}>Total: {REPRESENTATIONS[activeRep].total}</span>
                <span>|</span>
                <span className="tally-item" style={{ color: 'var(--accent-alert-coral)' }}>Highest: {REPRESENTATIONS[activeRep].highest.value}</span>
                <span>|</span>
                <span className="tally-item" style={{ color: 'var(--accent-alert-coral)' }}>Lowest: {REPRESENTATIONS[activeRep].lowest.value}</span>
              </div>
              <div className="tally-classification">
                This {REPRESENTATIONS[activeRep].name} has {REPRESENTATIONS[activeRep].propertyDescription}.
              </div>
            </div>

            <Mascot mood="thinking" bubble={REPRESENTATIONS[activeRep].funFact} />
          </div>
        )}

        {/* ================= STATION B: DATA COUNTER ================= */}
        {station === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="sim-station-title" style={{ margin: 0 }}><span>🎯</span> Data Counter</h3>
              <button className="btn-nav-outline" onClick={resetStationB} style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                🔄 Reset
              </button>
            </div>
            <p className="sim-station-instruction">Tap the chart to read each category, then fill in the table cells.</p>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <div className="shape-selector-row" style={{ gap: '4px', marginBottom: '8px' }}>
                  {REP_KEYS.map((k) => (
                    <button
                      key={k}
                      className={`shape-selector-btn ${counterRep === k ? 'shape-selector-btn--active' : ''}`}
                      onClick={() => { setCounterRep(k); setActiveCell({ rep: k, prop: 'total' }); speak(REPRESENTATIONS[k].name); }}
                      style={{ padding: '4px 8px', fontSize: '11px' }}
                    >
                      {REPRESENTATIONS[k].emoji}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '6px', marginBottom: '4px' }}>
                  <button className={`btn-highlight-toggle ${tallyMode === 'total' ? 'btn-highlight-toggle--active' : ''}`} onClick={() => setTallyMode('total')} style={{ padding: '4px 10px', fontSize: '11px' }}>Total</button>
                  <button className={`btn-highlight-toggle ${tallyMode === 'highest' ? 'btn-highlight-toggle--active' : ''}`} onClick={() => setTallyMode('highest')} style={{ padding: '4px 10px', fontSize: '11px' }}>Highest</button>
                  <button className={`btn-highlight-toggle ${tallyMode === 'lowest' ? 'btn-highlight-toggle--active' : ''}`} onClick={() => setTallyMode('lowest')} style={{ padding: '4px 10px', fontSize: '11px' }}>Lowest</button>
                </div>

                <ChartViewer
                  type={counterRep}
                  highlight={tallyMode}
                  size={185}
                  compact
                  onPartClick={handleTallyClick}
                />

                <div style={{ fontSize: '11px', fontWeight: '800', color: 'var(--accent-gold)', marginTop: '4px' }}>
                  Categories Read: {tallyList.length} / {REPRESENTATIONS[counterRep].dataset.items.length}
                </div>
              </div>

              <div style={{ flex: '1', minWidth: '280px', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                <div className="table-scroll-container" style={{ margin: 0, flex: '1 1 280px' }}>
                  <table className="property-match-table">
                    <thead>
                      <tr><th>Graph</th><th>Total</th><th>Highest</th><th>Lowest</th></tr>
                    </thead>
                    <tbody>
                      {REP_KEYS.map((k) => {
                        const cellStyle = (prop) => {
                          const val = tallyAnswers[k][prop];
                          if (val === '') return 'table-input-cell';
                          const isCorrect = val === correctValue(k, prop);
                          return `table-input-cell ${isCorrect ? 'table-input-cell--correct' : 'table-input-cell--incorrect'} ${activeCell.rep === k && activeCell.prop === prop ? 'table-input-cell--active' : ''}`;
                        };
                        return (
                          <tr key={k}>
                            <td className="cell-shape-name">{REPRESENTATIONS[k].emoji} {REPRESENTATIONS[k].name}</td>
                            <td><div className={cellStyle('total')} onClick={() => { setActiveCell({ rep: k, prop: 'total' }); setCounterRep(k); setTallyMode('total'); }}>{tallyAnswers[k].total}</div></td>
                            <td><div className={cellStyle('highest')} onClick={() => { setActiveCell({ rep: k, prop: 'highest' }); setCounterRep(k); setTallyMode('highest'); }}>{tallyAnswers[k].highest}</div></td>
                            <td><div className={cellStyle('lowest')} onClick={() => { setActiveCell({ rep: k, prop: 'lowest' }); setCounterRep(k); setTallyMode('lowest'); }}>{tallyAnswers[k].lowest}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="num-pad-overlay" style={{ marginTop: 0, flex: '0 0 180px' }}>
                  <div className="num-pad-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(n => (
                      <button key={n} className="num-btn" onClick={() => handleNumPadInput(n.toString())}>{n}</button>
                    ))}
                    <button className="num-btn num-btn--back" onClick={() => handleNumPadInput('C')}>Clear</button>
                    <button className="num-btn num-btn--submit" onClick={() => handleNumPadInput('✓')}>Check</button>
                  </div>
                </div>
              </div>
            </div>

            <Mascot mood="curious" bubble="Tap the chart to explore, then use the number pad to fill in the table cells!" />
          </div>
        )}

        {/* ================= STATION C: MATCH THE GRAPH ================= */}
        {station === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="sim-station-title" style={{ margin: 0 }}><span>🧩</span> Match the Graph</h3>
              <button className="btn-nav-outline" onClick={resetStationC} style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                🔄 Reset
              </button>
            </div>
            <p className="sim-station-instruction">Match each description with the correct graph type name.</p>

            <div className="unfold-sandbox">
              <div style={{ width: '100%', height: '100px', backgroundColor: 'var(--surface-pill-darkest)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'var(--accent-gold)', fontWeight: '700', gap: '8px' }}>
                {selectedNet !== null ? (
                  <>
                    <span>🔍 Description:</span>
                    <span>{leftNets[selectedNet].text}</span>
                  </>
                ) : (
                  <span>Select a card on the left to start matching!</span>
                )}
              </div>

              <div className="matching-game">
                <div className="match-left">
                  {leftNets.map((net, i) => {
                    const isMatched = Object.keys(matches).includes(i.toString());
                    const isSelected = selectedNet === i;
                    return (
                      <div key={i} className={`match-card ${isSelected ? 'match-card--selected' : ''} ${isMatched ? 'match-card--completed' : ''}`} onClick={() => handleMatchClick('left', i)}>
                        <span>{net.text}</span>
                        {isMatched && <span>✓</span>}
                      </div>
                    );
                  })}
                </div>

                <div className="match-right">
                  {rightNames.map((name, i) => {
                    const matchValue = Object.values(matches).indexOf(i);
                    const isMatched = matchValue !== -1;
                    const isSelected = selectedShapeName === i;
                    return (
                      <div key={i} className={`match-card ${isSelected ? 'match-card--selected' : ''} ${isMatched ? 'match-card--completed' : ''}`} onClick={() => handleMatchClick('right', i)}>
                        <span>{REPRESENTATIONS[name.id].emoji} {name.text}</span>
                        {isMatched && <span>Matched</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <Mascot mood="thinking" bubble="Picture graphs use icons and a key! Bar graphs use bars on a scale! What about tables and line graphs?" />
          </div>
        )}

        {/* ================= STATION D: TREND SANDBOX ================= */}
        {station === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <h3 className="sim-station-title" style={{ margin: 0 }}><span>🔍</span> Trend Sandbox</h3>
              <button className="btn-nav-outline" onClick={resetStationD} style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                🔄 Reset
              </button>
            </div>
            <p className="sim-station-instruction">Uses a Key? Uses an Axis? Best for Trends? Toggle YES/NO, then watch the demo.</p>

            <div className="physics-sandbox">
              <div className="sandbox-row" style={{ borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                <th>Graph</th>
                <th>Uses a Key?</th>
                <th>Uses an Axis?</th>
                <th>Best for Trends?</th>
              </div>

              {REP_KEYS.map((k) => {
                const toggles = sandboxToggles[k];
                const btnStyle = (feature, expected) => {
                  const state = toggles[feature];
                  if (state === null) return 'sandbox-toggle-btn';
                  return state === expected
                    ? 'sandbox-toggle-btn sandbox-toggle-btn--yes'
                    : 'sandbox-toggle-btn sandbox-toggle-btn--no';
                };

                return (
                  <div key={k} className="sandbox-row">
                    <td className="physics-shape-name">{REPRESENTATIONS[k].emoji} {REPRESENTATIONS[k].name}</td>

                    <td>
                      <button className={btnStyle('usesKey', REPRESENTATIONS[k].usesKey)} onClick={() => handleSandboxToggle(k, 'usesKey')}>
                        {toggles.usesKey === null ? 'Toggle' : toggles.usesKey ? 'YES' : 'NO'}
                      </button>
                      {toggles.usesKey === REPRESENTATIONS[k].usesKey && (
                        <button className="watch-it-btn" onClick={() => triggerWatchIt(k, 'usesKey')} style={{ marginLeft: '4px', padding: '3px 6px', fontSize: '9px' }}>👀</button>
                      )}
                    </td>

                    <td>
                      <button className={btnStyle('usesAxis', REPRESENTATIONS[k].usesAxis)} onClick={() => handleSandboxToggle(k, 'usesAxis')}>
                        {toggles.usesAxis === null ? 'Toggle' : toggles.usesAxis ? 'YES' : 'NO'}
                      </button>
                      {toggles.usesAxis === REPRESENTATIONS[k].usesAxis && (
                        <button className="watch-it-btn" onClick={() => triggerWatchIt(k, 'usesAxis')} style={{ marginLeft: '4px', padding: '3px 6px', fontSize: '9px' }}>👀</button>
                      )}
                    </td>

                    <td>
                      <button className={btnStyle('bestForTrends', REPRESENTATIONS[k].bestForTrends)} onClick={() => handleSandboxToggle(k, 'bestForTrends')}>
                        {toggles.bestForTrends === null ? 'Toggle' : toggles.bestForTrends ? 'YES' : 'NO'}
                      </button>
                      {toggles.bestForTrends === REPRESENTATIONS[k].bestForTrends && (
                        <button className="watch-it-btn" onClick={() => triggerWatchIt(k, 'bestForTrends')} style={{ marginLeft: '4px', padding: '3px 6px', fontSize: '9px' }}>👀</button>
                      )}
                    </td>
                  </div>
                );
              })}

              <div className="physics-stage-viewport" style={{ alignItems: 'center', justifyContent: 'center' }}>
                <div className="physics-floor" />
                <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '10px', color: 'var(--text-muted-lavender)' }}>
                  Demo Arena: {sandboxDemo ? `${REPRESENTATIONS[sandboxDemo.rep].name}` : 'Click the Eye 👀 icon to test'}
                </div>
                {renderDemo()}
              </div>
            </div>

            <Mascot mood="happy" bubble="Picture graphs need a key! Bar graphs and line graphs use an axis! Line graphs are best for trends over time!" />
          </div>
        )}

      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
        <button
          className="btn-nav-outline"
          onClick={() => { if (station > 0) setStation(prev => prev - 1); }}
          disabled={station === 0}
        >
          🠔 Previous Station
        </button>

        {station < 3 ? (
          <button className="btn-nav-outline" onClick={() => setStation(prev => prev + 1)}>
            Next Station ➔
          </button>
        ) : (
          <button
            className="btn-gold"
            onClick={onNext}
            style={{ padding: '14px 32px', fontSize: '18px' }}
          >
            Begin Practice Phase! ➔
          </button>
        )}
      </div>
    </div>
  );
}
