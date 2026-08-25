import React from 'react';
import { REPRESENTATIONS } from '../../data/chartData';

// Renders one of the 4 data representations. `highlight` can be
// 'total' | 'highest' | 'lowest' | a specific category label.
// onPartClick(label) fires when a bar / row / point / icon-row is tapped —
// this powers the "counting" station, mirroring the old face/edge/vertex taps.
export default function ChartViewer({ type, highlight = null, onPartClick = null, size = 240, compact = false }) {
  const rep = REPRESENTATIONS[type];
  if (!rep) return null;
  const { dataset } = rep;

  const isHighlighted = (label, value) => {
    if (!highlight) return false;
    if (highlight === 'total') return true;
    if (highlight === 'highest') return value === rep.highest.value;
    if (highlight === 'lowest') return value === rep.lowest.value;
    return highlight === label;
  };

  const maxVal = Math.max(...dataset.items.map(i => i.value));

  return (
    <div className="chart-viewer-stage" style={{ maxWidth: size + 100, minHeight: compact ? 140 : 185 }}>
      <span className="chart-title-tag">{rep.emoji} {dataset.title}</span>

      {type === 'bar' && (
        <div className="bar-chart-wrap">
          {dataset.items.map((item) => {
            const hl = isHighlighted(item.label, item.value);
            const heightPx = Math.max(12, (item.value / maxVal) * 110);
            return (
              <div key={item.label} className="bar-chart-col" onClick={() => onPartClick && onPartClick(item.label)}>
                <span className="bar-chart-value">{item.value}</span>
                <div
                  className={`bar-chart-bar ${hl ? 'bar-chart-bar--highlight' : ''}`}
                  style={{ height: `${heightPx}px`, backgroundColor: item.color || rep.color }}
                />
                <span className="bar-chart-label">{item.emoji}</span>
                <span className="bar-chart-cat">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {type === 'pictograph' && (
        <div className="pictograph-wrap">
          {dataset.items.map((item) => {
            const hl = isHighlighted(item.label, item.value);
            return (
              <div
                key={item.label}
                className={`pictograph-row ${hl ? 'pictograph-row--highlight' : ''}`}
                onClick={() => onPartClick && onPartClick(item.label)}
              >
                <span className="pictograph-row-label">{item.label}</span>
                <span className="pictograph-icons">
                  {Array.from({ length: item.value }).map((_, i) => (
                    <span key={i}>{item.emoji}</span>
                  ))}
                </span>
              </div>
            );
          })}
          <div className="pictograph-key">🔑 {dataset.key}</div>
        </div>
      )}

      {type === 'table' && (
        <table className="data-table-view">
          <thead>
            <tr><th>Day</th><th>{dataset.unit}</th></tr>
          </thead>
          <tbody>
            {dataset.items.map((item) => {
              const hl = isHighlighted(item.label, item.value);
              return (
                <tr key={item.label} className={hl ? 'data-row--highlight' : ''} onClick={() => onPartClick && onPartClick(item.label)}>
                  <td>{item.emoji} {item.label}</td>
                  <td>{item.value}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {type === 'line' && (
        <LineChartSVG dataset={dataset} rep={rep} highlight={highlight} isHighlighted={isHighlighted} onPartClick={onPartClick} />
      )}
    </div>
  );
}

function LineChartSVG({ dataset, isHighlighted, onPartClick }) {
  const width = 260;
  const height = 130;
  const padding = 24;
  const values = dataset.items.map(i => i.value);
  const min = Math.min(...values) - 2;
  const max = Math.max(...values) + 2;
  const stepX = (width - padding * 2) / (dataset.items.length - 1);

  const toXY = (idx, val) => {
    const x = padding + idx * stepX;
    const y = height - padding - ((val - min) / (max - min)) * (height - padding * 2);
    return [x, y];
  };

  const points = dataset.items.map((item, idx) => toXY(idx, item.value));
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');

  return (
    <div className="line-chart-svg-wrap">
      <svg width={width} height={height + 20} viewBox={`0 0 ${width} ${height + 20}`}>
        <path d={pathD} className="line-chart-path" fill="none" stroke="#34D399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {dataset.items.map((item, idx) => {
          const [x, y] = points[idx];
          const hl = isHighlighted(item.label, item.value);
          return (
            <g
              key={item.label}
              className={`line-chart-point ${hl ? 'line-chart-point--highlight' : ''}`}
              onClick={() => onPartClick && onPartClick(item.label)}
            >
              <circle cx={x} cy={y} r={hl ? 7 : 5} fill={hl ? '#ffbe1a' : '#34D399'} stroke="#0e0724" strokeWidth="1.5" />
              <text x={x} y={y - 12} fontSize="11" fill="#bca8f2" textAnchor="middle" fontWeight="800">{item.value}</text>
              <text x={x} y={height + 14} fontSize="11" fill="#bca8f2" textAnchor="middle">{item.label}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
