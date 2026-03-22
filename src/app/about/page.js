"use client";
import { useState } from "react";

const FEATURES = [
  {
    id: "sentiment",
    icon: "💬",
    title: "Sentiment Analysis",
    short: "AI reads real reviews and scores them positive, neutral, or negative.",
    detail: "Our AI uses TextBlob NLP to analyze the sentiment polarity of each review. Each review is scored from -1 (very negative) to +1 (very positive) and converted to a 0-100% score.",
    demo: true,
  },
  {
    id: "fake",
    icon: "🔍",
    title: "Fake Review Detection",
    short: "Detects duplicate reviews, burst posting, and suspicious patterns.",
    detail: "We check for duplicate text, repeated phrases, and unusual review patterns. The trust score shows what percentage of reviews appear genuine. A score below 60% means many fake reviews were detected.",
    demo: false,
  },
  {
    id: "price",
    icon: "📈",
    title: "Price Trend Analysis",
    short: "Tracks price history and predicts whether prices will drop or rise.",
    detail: "We track product prices over time and show a price history chart on the detail page. The system estimates whether the current price is higher or lower than average to help you decide when to buy.",
    demo: false,
  },
  {
    id: "image",
    icon: "🖼️",
    title: "Image Authenticity",
    short: "Checks if product images are original, edited, or stock photos.",
    detail: "Our system assigns an image authenticity score based on the product listing. Lower scores may indicate stock photos or edited images. Always check product images carefully before buying.",
    demo: false,
  },
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
      <div className="about-hero">
        <div className="hero-badge">About Us</div>
        <h1 className="hero-title">Smart Consumer Intelligence</h1>
        <p className="hero-subtitle">
          AI-powered product analysis platform that helps you shop smarter
          with real data from Amazon and Flipkart.
        </p>
      </div>

      <div className="about-mission">
        <h2 className="about-mission-title">Our Mission</h2>
        <p className="about-mission-text">
          Online shopping should be transparent and trustworthy. We built this
          platform to give every shopper the same data-driven insights that
          experts use — completely free.
        </p>
      </div>

      <div className="features-section">
        <h2 className="about-section-title">Our Features</h2>
        <p style={{textAlign:"center", fontSize:"13px", color:"var(--text-secondary)", marginBottom:"1.5rem"}}>
          Click any feature card to learn more
        </p>

        <div className="about-grid">
          {FEATURES.map((f) => (
            <div key={f.id}>
              <div
                className={`about-card feature-card ${activeCard === f.id ? "feature-card--active" : ""}`}
                onClick={() => handleCardClick(f.id)}
                style={{cursor: "pointer"}}
              >
                <div className="about-icon">{f.icon}</div>
                <h3 className="about-card-title">{f.title}</h3>
                <p className="about-card-text">{f.short}</p>
                <div className="feature-card-cta">
                  {activeCard === f.id ? "▲ Close" : "▼ Learn more"}
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
                            <div className={`demo-sentiment-badge ${
                              result.sentiment === "Positive" ? "demo-positive" :
                              result.sentiment === "Negative" ? "demo-negative" : "demo-neutral"
                            }`}>
                              {result.sentiment === "Positive" ? "😊" :
                               result.sentiment === "Negative" ? "😞" : "😐"}
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
                                  <div className={`demo-bar-fill ${b.cls}`} style={{width: `${b.val}%`}} />
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
    </main>
  );
}