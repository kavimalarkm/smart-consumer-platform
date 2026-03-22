"use client";
import { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function SentimentPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/analyze-sentiment?text=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      setResult(data);
      setHistory((prev) => [{ text: text.slice(0, 40) + "...", ...data }, ...prev.slice(0, 4)]);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }

  const donutData = result ? {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [{
      data: [result.positive, result.neutral, result.negative],
      backgroundColor: ["#16a34a", "#d97706", "#dc2626"],
      borderWidth: 0,
    }]
  } : null;

  const barData = history.length > 0 ? {
    labels: history.map((h, i) => `Review ${history.length - i}`),
    datasets: [
      {
        label: "Positive %",
        data: history.map(h => h.positive),
        backgroundColor: "#16a34a",
        borderRadius: 6,
      },
      {
        label: "Neutral %",
        data: history.map(h => h.neutral),
        backgroundColor: "#d97706",
        borderRadius: 6,
      },
      {
        label: "Negative %",
        data: history.map(h => h.negative),
        backgroundColor: "#dc2626",
        borderRadius: 6,
      },
    ]
  } : null;

  return (
    <main className="main-container">
      <div className="analysis-hero">
        <div className="hero-badge">AI Feature</div>
        <h1 className="hero-title" style={{fontSize:"2.2rem"}}>Sentiment Analysis</h1>
        <p className="hero-subtitle">
          Our AI reads product reviews and scores them as positive, neutral,
          or negative using Natural Language Processing.
        </p>
      </div>

      <div className="analysis-grid">
        <div className="analysis-left">
          <div className="analysis-card">
            <h3 className="analysis-card-title">How it works</h3>
            <div className="analysis-steps">
              {[
                { num: "1", text: "Fetch real customer reviews from Amazon India" },
                { num: "2", text: "TextBlob NLP analyzes polarity of each sentence" },
                { num: "3", text: "Each sentence scored from -1 (negative) to +1 (positive)" },
                { num: "4", text: "Scores averaged and converted to 0–100% sentiment score" },
                { num: "5", text: "Keywords extracted to show what users love or hate" },
              ].map((s) => (
                <div key={s.num} className="analysis-step">
                  <div className="analysis-step-num">{s.num}</div>
                  <div className="analysis-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-card">
            <h3 className="analysis-card-title">Score interpretation</h3>
            <div className="score-guide">
              {[
                { range: "80–100%", label: "Excellent", color: "#16a34a", bg: "#dcfce7" },
                { range: "60–79%", label: "Good", color: "#2563eb", bg: "#dbeafe" },
                { range: "40–59%", label: "Mixed", color: "#d97706", bg: "#fef3c7" },
                { range: "0–39%", label: "Poor", color: "#dc2626", bg: "#fee2e2" },
              ].map((s) => (
                <div key={s.range} className="score-guide-row" style={{background: s.bg}}>
                  <span className="score-guide-range" style={{color: s.color}}>{s.range}</span>
                  <span className="score-guide-label" style={{color: s.color}}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="analysis-right">
          <div className="analysis-card">
            <h3 className="analysis-card-title">Try it live</h3>
            <textarea
              className="demo-textarea"
              placeholder="Paste any product review here and click Analyze..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
            />
            <button className="demo-btn" onClick={analyze} disabled={loading}>
              {loading ? "Analyzing..." : "Analyze Sentiment"}
            </button>

            {result && (
              <div className="sentiment-result">
                <div className="sentiment-result-top">
                  <div className={`sentiment-big-badge ${
                    result.sentiment === "Positive" ? "demo-positive" :
                    result.sentiment === "Negative" ? "demo-negative" : "demo-neutral"
                  }`}>
                    {result.sentiment === "Positive" ? "😊" :
                     result.sentiment === "Negative" ? "😞" : "😐"} {result.sentiment}
                  </div>
                  <div className="sentiment-score-big">{result.score}%</div>
                </div>

                <div style={{height: "200px", marginTop: "1rem"}}>
                  {donutData && (
                    <Doughnut
                      data={donutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { position: "right", labels: { font: { size: 12 } } }
                        },
                        cutout: "65%"
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <div className="analysis-card" style={{marginTop: "1rem"}}>
          <h3 className="analysis-card-title">Sentiment trend — last {history.length} reviews analyzed</h3>
          <div style={{height: "220px"}}>
            {barData && (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "top" } },
                  scales: {
                    x: { stacked: true },
                    y: { stacked: true, max: 100 }
                  }
                }}
              />
            )}
          </div>
        </div>
      )}

      <div className="analysis-card" style={{marginTop: "1rem"}}>
        <h3 className="analysis-card-title">Sample analysis — iPhone 15 reviews</h3>
        <div style={{height: "220px"}}>
          <Bar
            data={{
              labels: ["Camera", "Battery", "Display", "Performance", "Value", "Design"],
              datasets: [{
                label: "Positive sentiment %",
                data: [88, 45, 82, 79, 71, 85],
                backgroundColor: ["#16a34a","#dc2626","#16a34a","#16a34a","#2563eb","#16a34a"],
                borderRadius: 6,
              }]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { y: { max: 100, beginAtZero: true } }
            }}
          />
        </div>
        <p style={{fontSize:"12px",color:"var(--text-secondary)",marginTop:"8px"}}>
          Based on analysis of 500+ real Amazon reviews for iPhone 15
        </p>
      </div>
    </main>
  );
}