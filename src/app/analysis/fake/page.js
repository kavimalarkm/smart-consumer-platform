"use client";
import { useState } from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function FakePage() {
  const [reviews, setReviews] = useState("");
  const [result, setResult] = useState(null);
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);

  function analyzeReviews() {
    if (!reviews.trim()) return;
    const lines = reviews.split("\n").filter(r => r.trim().length > 0);
    const unique = new Set(lines.map(r => r.trim().toLowerCase()));
    const duplicates = lines.length - unique.size;
    const trustScore = Math.round((unique.size / lines.length) * 100);
    const avgLength = lines.reduce((a, b) => a + b.length, 0) / lines.length;
    const genericPhrases = ["good product", "nice", "ok", "fine", "average", "decent"];
    const genericCount = lines.filter(r => genericPhrases.some(p => r.toLowerCase().includes(p))).length;

    setResult({
      total: lines.length,
      unique: unique.size,
      duplicates,
      trustScore,
      genericCount,
      avgLength: Math.round(avgLength),
      verdict: trustScore >= 80 ? "Genuine" : trustScore >= 60 ? "Mostly Genuine" : trustScore >= 40 ? "Suspicious" : "Highly Fake",
    });
  }

  async function analyzeProducts() {
    if (!productQuery.trim()) return;
    setProductLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/search?query=${encodeURIComponent(productQuery)}`
      );
      const data = await res.json();
      setProductResults(data?.products || []);
    } catch (e) { console.error(e); }
    setProductLoading(false);
  }

  const donutData = result ? {
    labels: ["Genuine Reviews", "Duplicate/Fake Reviews"],
    datasets: [{
      data: [result.unique, result.duplicates],
      backgroundColor: ["#16a34a", "#dc2626"],
      borderWidth: 0,
    }]
  } : null;

  const trustBarData = productResults.length > 0 ? {
    labels: productResults.map(p => p.name.slice(0, 18) + "..."),
    datasets: [{
      label: "Trust Score %",
      data: productResults.map(p => p.trustScore),
      backgroundColor: productResults.map(p =>
        p.trustScore >= 80 ? "#16a34a" :
        p.trustScore >= 60 ? "#2563eb" :
        p.trustScore >= 40 ? "#d97706" : "#dc2626"
      ),
      borderRadius: 6,
    }]
  } : null;

  return (
    <main className="main-container">
      <div className="analysis-hero">
        <div className="hero-badge">AI Feature</div>
        <h1 className="hero-title" style={{fontSize:"2.2rem"}}>Fake Review Detection</h1>
        <p className="hero-subtitle">
          Our AI detects suspicious review patterns to give you a real trust score
          — so you know which reviews to believe.
        </p>
      </div>

      <div className="sentiment-steps-row">
        {[
          { num: "1", label: "Collect Reviews", desc: "Fetch all reviews from Amazon" },
          { num: "2", label: "Check Duplicates", desc: "Find copy-pasted reviews" },
          { num: "3", label: "Detect Patterns", desc: "Burst posting & generic text" },
          { num: "4", label: "Calculate Trust", desc: "Unique reviews / total reviews" },
          { num: "5", label: "Trust Score", desc: "0–100% shown on product card" },
        ].map((s, i) => (
          <div key={s.num} className="sentiment-step-chip">
            <div className="sentiment-step-num" style={{background:"#dc2626"}}>{s.num}</div>
            <div>
              <div className="sentiment-step-label">{s.label}</div>
              <div className="sentiment-step-desc">{s.desc}</div>
            </div>
            {i < 4 && <div className="sentiment-step-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="analysis-grid" style={{marginTop:"1.5rem"}}>
        <div className="analysis-left">
          <div className="analysis-card">
            <h3 className="analysis-card-title">How fake reviews are detected</h3>
            <div className="analysis-steps">
              {[
                { num: "1", text: "Duplicate text — same review posted multiple times" },
                { num: "2", text: "Burst posting — many reviews on the same day" },
                { num: "3", text: "Generic language — 'Good product. Nice.' with no details" },
                { num: "4", text: "Short reviews — less than 10 words with no specifics" },
                { num: "5", text: "Trust score = unique reviews ÷ total reviews × 100%" },
              ].map((s) => (
                <div key={s.num} className="analysis-step">
                  <div className="analysis-step-num" style={{background:"#fee2e2",color:"#dc2626"}}>{s.num}</div>
                  <div className="analysis-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-card">
            <h3 className="analysis-card-title">Trust score guide</h3>
            <div className="score-guide">
              {[
                { range: "80–100%", label: "Genuine — reviews are authentic", color: "#16a34a", bg: "#dcfce7" },
                { range: "60–79%", label: "Mostly genuine — few suspicious", color: "#2563eb", bg: "#dbeafe" },
                { range: "40–59%", label: "Suspicious — many fake reviews", color: "#d97706", bg: "#fef3c7" },
                { range: "0–39%", label: "Highly fake — do not trust", color: "#dc2626", bg: "#fee2e2" },
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
            <h3 className="analysis-card-title">Try it live — paste reviews to detect fakes</h3>
            <p style={{fontSize:"12px",color:"var(--text-secondary)",marginBottom:"8px"}}>
              Paste one review per line — duplicate lines will be detected as fake
            </p>
            <textarea
              className="demo-textarea"
              placeholder={"Good product\nGood product\nAmazing quality, works perfectly\nGood product\nBattery life is excellent"}
              value={reviews}
              onChange={(e) => setReviews(e.target.value)}
              rows={6}
            />
            <button className="demo-btn" style={{background:"#dc2626"}} onClick={analyzeReviews}>
              Detect Fake Reviews
            </button>

            {result && (
              <div className="sentiment-result">
                <div className="sentiment-result-top" style={{marginTop:"1rem"}}>
                  <div className={`sentiment-big-badge ${
                    result.verdict === "Genuine" ? "demo-positive" :
                    result.verdict === "Highly Fake" ? "demo-negative" : "demo-neutral"
                  }`}>
                    {result.verdict === "Genuine" ? "✅" :
                     result.verdict === "Highly Fake" ? "❌" : "⚠️"} {result.verdict}
                  </div>
                  <div className="sentiment-score-big" style={{color:"#dc2626"}}>{result.trustScore}%</div>
                </div>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",margin:"1rem 0"}}>
                  {[
                    { label: "Total", value: result.total },
                    { label: "Unique", value: result.unique, color: "#16a34a" },
                    { label: "Duplicates", value: result.duplicates, color: "#dc2626" },
                  ].map((m) => (
                    <div key={m.label} style={{background:"var(--bg)",borderRadius:"8px",padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:"20px",fontWeight:"700",color: m.color || "var(--text-primary)"}}>{m.value}</div>
                      <div style={{fontSize:"11px",color:"var(--text-secondary)"}}>{m.label}</div>
                    </div>
                  ))}
                </div>

                <div style={{height:"180px"}}>
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

      <div className="analysis-card" style={{marginTop:"1rem"}}>
        <h3 className="analysis-card-title">Real product trust score comparison</h3>
        <p style={{fontSize:"13px",color:"var(--text-secondary)",marginBottom:"1rem"}}>
          Search any product to compare trust scores across multiple products
        </p>
        <div style={{display:"flex",gap:"8px",marginBottom:"1rem"}}>
          <input
            type="text"
            placeholder="e.g. Samsung phone, Nike shoes..."
            value={productQuery}
            onChange={(e) => setProductQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && analyzeProducts()}
            style={{flex:1, borderRadius:"99px", padding:"10px 16px", border:"1px solid var(--border)", fontSize:"14px", background:"var(--surface)", color:"var(--text-primary)", outline:"none"}}
          />
          <button className="search-btn" onClick={analyzeProducts} disabled={productLoading}>
            {productLoading ? "Loading..." : "Compare Trust Scores"}
          </button>
        </div>

        {productResults.length > 0 && (
          <div style={{height:"280px"}}>
            <Bar data={trustBarData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => `Trust Score: ${ctx.raw}%` } }
              },
              scales: {
                y: { max: 100, beginAtZero: true, ticks: { callback: (v) => v + "%" } },
                x: { ticks: { font: { size: 10 } } }
              }
            }} />
          </div>
        )}
      </div>
    </main>
  );
}