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
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  async function analyze() {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/analyze-sentiment?text=${encodeURIComponent(text)}`
      );
      const data = await res.json();
      setResult(data);
      setHistory((prev) => [{ text: text.slice(0, 30) + "...", ...data }, ...prev.slice(0, 4)]);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function analyzeProducts() {
    if (!productQuery.trim()) return;
    setProductLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/search?query=${encodeURIComponent(productQuery)}`
      );
      const data = await res.json();
      setProductResults(data.products || []);
    } catch (e) { console.error(e); }
    setProductLoading(false);
  }

  const donutData = result ? {
    labels: ["Positive", "Neutral", "Negative"],
    datasets: [{
      data: [result.positive, result.neutral, result.negative],
      backgroundColor: ["#16a34a", "#d97706", "#dc2626"],
      borderWidth: 0,
    }]
  } : null;

  const productBarData = productResults.length > 0 ? {
    labels: productResults.map(p => p.name.slice(0, 20) + "..."),
    datasets: [
      {
        label: "Sentiment %",
        data: productResults.map(p => p.sentiment),
        backgroundColor: productResults.map(p =>
          p.sentiment >= 75 ? "#16a34a" :
          p.sentiment >= 55 ? "#2563eb" :
          p.sentiment >= 40 ? "#d97706" : "#dc2626"
        ),
        borderRadius: 6,
      }
    ]
  } : null;

  const historyBarData = history.length > 1 ? {
    labels: history.map((_, i) => `Review ${history.length - i}`),
    datasets: [
      { label: "Positive %", data: history.map(h => h.positive), backgroundColor: "#16a34a", borderRadius: 4 },
      { label: "Neutral %", data: history.map(h => h.neutral), backgroundColor: "#d97706", borderRadius: 4 },
      { label: "Negative %", data: history.map(h => h.negative), backgroundColor: "#dc2626", borderRadius: 4 },
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
            <h3 className="analysis-card-title">Try it live — analyze any review</h3>
            <textarea
              className="demo-textarea"
              placeholder="Paste any product review here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
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
                <div style={{height: "180px", marginTop: "1rem"}}>
                  {donutData && (
                    <Doughnut data={donutData} options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "right", labels: { font: { size: 11 } } } },
                      cutout: "65%"
                    }} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="analysis-card" style={{marginTop: "1rem"}}>
        <h3 className="analysis-card-title">Real product sentiment analysis</h3>
        <p style={{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"1rem"}}>
          Search any product to see real sentiment scores from actual Amazon reviews
        </p>
        <div style={{display:"flex",gap:"8px",marginBottom:"1rem"}}>
          <input
            type="text"
            className="search-input"
            placeholder="e.g. iPhone 16, Samsung TV, Nike shoes..."
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeProducts()}
            style={{flex:1, borderRadius:"99px", padding:"10px 16px", border:"1px solid var(--border)", fontSize:"14px", background:"var(--surface)", color:"var(--text-primary)", outline:"none"}}
          />
          <button className="search-btn" onClick={analyzeProducts} disabled={productLoading}>
            {productLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {productResults.length > 0 && (
          <div style={{height: "280px"}}>
            <Bar
              data={productBarData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx) => `Sentiment: ${ctx.raw}%`
                    }
                  }
                },
                scales: {
                  y: { max: 100, beginAtZero: true, ticks: { callback: (v) => v + "%" } },
                  x: { ticks: { font: { size: 10 } } }
                }
              }}
            />
          </div>
        )}

        {productResults.length > 0 && (
          <div style={{display:"flex",gap:"8px",marginTop:"10px",flexWrap:"wrap"}}>
            {productResults.map((p) => (
              <div key={p.id} style={{
                background: p.sentiment >= 75 ? "#dcfce7" : p.sentiment >= 55 ? "#dbeafe" : p.sentiment >= 40 ? "#fef3c7" : "#fee2e2",
                borderRadius:"99px", padding:"4px 12px", fontSize:"11px",
                color: p.sentiment >= 75 ? "#166534" : p.sentiment >= 55 ? "#1e40af" : p.sentiment >= 40 ? "#92400e" : "#991b1b",
                fontWeight: "500"
              }}>
                {p.name.slice(0, 25)}... — {p.sentiment}%
              </div>
            ))}
          </div>
        )}
      </div>

      {historyBarData && (
        <div className="analysis-card" style={{marginTop: "1rem"}}>
          <h3 className="analysis-card-title">Your review analysis history</h3>
          <div style={{height: "200px"}}>
            <Bar data={historyBarData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "top" } },
              scales: { x: { stacked: true }, y: { stacked: true, max: 100 } }
            }} />
          </div>
        </div>
      )}
    </main>
  );
}