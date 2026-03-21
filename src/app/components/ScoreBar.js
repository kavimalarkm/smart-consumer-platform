export default function ScoreBar({ label, value }) {
  const barColor =
    value >= 80 ? "#16a34a"
    : value >= 65 ? "#2563eb"
    : value >= 50 ? "#d97706"
    : "#dc2626";

  return (
    <div className="score-row">
      <span className="score-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, background: barColor }}
        />
      </div>
      <span className="score-value" style={{ color: barColor }}>
        {value}%
      </span>
    </div>
  );
}