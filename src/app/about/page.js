"use client";
import { useState } from "react";
import Link from "next/link";

const FEATURES = [
  {
    id: "sentiment",
    icon: "💬",
    title: "Sentiment Analysis",
    short: "AI reads real reviews and scores them positive, neutral, or negative.",
    detail: "Our AI uses TextBlob NLP to analyze the sentiment polarity of each review. Each review is scored from -1 (very negative) to +1 (very positive) and converted to a 0-100% score.",
    demo: true,
    color: "#1a3cff",
    bg: "#e8ecff",
    link: "/analysis/sentiment",
  },
  {
    id: "fake",
    icon: "🔍",
    title: "Fake Review Detection",
    short: "Detects duplicate reviews, burst posting, and suspicious patterns.",
    detail: "We check for duplicate text, repeated phrases, and unusual review patterns. The trust score shows what percentage of reviews appear genuine.",
    demo: false,
    color: "#dc2626",
    bg: "#fee2e2",
    link: "/analysis/fake",
  },
  {
    id: "price",
    icon: "📈",
    title: "Price Trend Analysis",
    short: "Tracks price history and predicts whether prices will drop or rise.",
    detail: "We track product prices over time and show a price history chart. The system estimates whether the current price is higher or lower than average.",
    demo: false,
    color: "#16a34a",
    bg: "#dcfce7",
    link: "/analysis/price",
  },
  {
    id: "image",
    icon: "🖼️",
    title: "Image Authenticity",
    short: "Checks if product images are original, edited, or stock photos.",
    detail: "Our system checks image metadata, file size, format headers and patterns to assign an authenticity score from 0-100%.",
    demo: false,
    color: "#d97706",
    bg: "#fef3c7",
    link: "/analysis/image",
  },
];


const HOW_IT_WORKS = [
  { num: "1", icon: "🔍", title: "Search", desc: "Enter any product name — we fetch real listings from Amazon and Flipkart instantly." },
  { num: "2", icon: "🧠", title: "Analyze", desc: "Our AI analyzes reviews, checks image authenticity, and calculates trust scores." },
  { num: "3", icon: "📊", title: "Score", desc: "Each product gets sentiment, trust, and image authenticity scores from 0–100%." },
  { num: "4", icon: "🏆", title: "Rank", desc: "Products are ranked by combined scores so the best choice is always first." },
];

export default function About() {
  const [activeCard, setActiveCard] = useState(null);
  const [demoText, setDemoText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleCardClick(id) {
    setActiveCard(activeCard === id ? null : id);
    setResult(null);
    setDemoText("");
  }

  async function analyzeSentiment() {
    if (!demoText.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/analyze-sentiment?text=${encodeURIComponent(demoText)}`
      );
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ error: "Could not analyze. Try again!" });
    }
    setLoading(false);
  }

  return (
    <main className="main-container">

      {/* Hero */}
      <div className="about-hero">
        <div className="hero-badge">About Us</div>
        <h1 className="hero-title">Smart Consumer Intelligence</h1>
        <p className="hero-subtitle">
          AI-powered product analysis platform that helps you shop smarter
          with real data from Amazon and Flipkart.
        </p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <Link href="/" style={{ background: "var(--accent)", color: "white", borderRadius: "99px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", textDecoration: "none", fontFamily: "'Syne', sans-serif" }}>
            Try it now →
          </Link>
          <a href="https://github.com/kavimalarkm/smart-consumer-platform" target="_blank" rel="noopener noreferrer" style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", borderRadius: "99px", padding: "10px 24px", fontSize: "14px", fontWeight: "600", textDecoration: "none", fontFamily: "'Syne', sans-serif" }}>
            View on GitHub ↗
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="about-stats">
        {[
          { number: "10+", label: "Products per search" },
          { number: "2", label: "Platforms (Amazon + Flipkart)" },
          { number: "4", label: "AI analysis features" },
          { number: "100%", label: "Free forever" },
        ].map((s) => (
          <div key={s.label} className="about-stat">
            <div className="about-stat-number">{s.number}</div>
            <div className="about-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Mission */}
      <div className="about-mission">
        <h2 className="about-mission-title">Our Mission</h2>
        <p className="about-mission-text">
          Online shopping should be transparent and trustworthy. We built this
          platform to give every shopper the same data-driven insights that
          experts use — completely free. No ads, no sponsored results, just honest AI analysis.
        </p>
      </div>

      {/* How it works */}
      <div className="about-section">
        <h2 className="about-section-title">How It Works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
          {HOW_IT_WORKS.map((step) => (
            <div key={step.num} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem", textAlign: "center" }}>
              <div style={{ fontSize: "32px", marginBottom: "12px" }}>{step.icon}</div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "11px", fontWeight: "700", color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "6px" }}>Step {step.num}</div>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "16px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>{step.title}</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="features-section">
        <h2 className="about-section-title">Our Features</h2>
        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Click any feature to learn more and try a live demo
        </p>
        <div className="about-grid">
          {FEATURES.map((f) => (
            <div key={f.id}>
              <div
                className={`about-card feature-card ${activeCard === f.id ? "feature-card--active" : ""}`}
                onClick={() => handleCardClick(f.id)}
                style={{ cursor: "pointer" }}
              >
                <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", marginBottom: "1rem" }}>
                  {f.icon}
                </div>
                <h3 className="about-card-title">{f.title}</h3>
                <p className="about-card-text">{f.short}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "12px" }}>
                  <Link href={f.link} onClick={(e) => e.stopPropagation()} style={{ fontSize: "12px", color: f.color, fontWeight: "600", textDecoration: "none" }}>
                    Try it →
                  </Link>
                  <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    {activeCard === f.id ? "▲ Close" : "▼ Learn more"}
                  </span>
                </div>
              </div>

              {activeCard === f.id && (
                <div className="feature-expand">
                  <p className="feature-detail">{f.detail}</p>
                  {f.demo && (
                    <div className="demo-box">
                      <p className="demo-subtitle">Try it yourself — type any review:</p>
                      <textarea
                        className="demo-textarea"
                        placeholder="e.g. This phone has amazing camera quality but the battery drains too fast..."
                        value={demoText}
                        onChange={(e) => setDemoText(e.target.value)}
                        rows={3}
                      />
                      <button className="demo-btn" onClick={analyzeSentiment} disabled={loading}>
                        {loading ? "Analyzing..." : "Analyze Sentiment"}
                      </button>
                      {result && !result.error && (
                        <div className="demo-result">
                          <div className="demo-result-score">
                            <div className={`demo-sentiment-badge ${result.sentiment === "Positive" ? "demo-positive" : result.sentiment === "Negative" ? "demo-negative" : "demo-neutral"}`}>
                              {result.sentiment === "Positive" ? "😊" : result.sentiment === "Negative" ? "😞" : "😐"}
                              {result.sentiment}
                            </div>
                            <div className="demo-score-val">Score: {result.score}%</div>
                          </div>
                          <div className="demo-breakdown">
                            {[
                              { label: "Positive", val: result.positive, cls: "demo-bar-green" },
                              { label: "Neutral", val: result.neutral, cls: "demo-bar-amber" },
                              { label: "Negative", val: result.negative, cls: "demo-bar-red" },
                            ].map((b) => (
                              <div key={b.label} className="demo-bar-wrap">
                                <div className="demo-bar-label">{b.label}</div>
                                <div className="demo-bar-track">
                                  <div className={`demo-bar-fill ${b.cls}`} style={{ width: `${b.val}%` }} />
                                </div>
                                <div className="demo-bar-pct">{b.val}%</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {result?.error && <p className="auth-error">{result.error}</p>}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: "center", padding: "3rem 0", background: "var(--accent-light)", borderRadius: "var(--radius)", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: "700", color: "var(--accent)", marginBottom: "12px" }}>
          Ready to shop smarter?
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
          Search any product and get instant AI-powered analysis — completely free.
        </p>
        <Link href="/" style={{ background: "var(--accent)", color: "white", borderRadius: "99px", padding: "12px 32px", fontSize: "15px", fontWeight: "600", textDecoration: "none", fontFamily: "'Syne', sans-serif" }}>
          Start Searching →
        </Link>
      </div>

    </main>
  );
}