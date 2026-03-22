"use client";
import { useState } from "react";

export default function About() {
  const [demoText, setDemoText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon">💬</div>
          <h3 className="about-card-title">Sentiment Analysis</h3>
          <p className="about-card-text">
            AI reads real reviews and scores them positive, neutral, or negative
            using Natural Language Processing.
          </p>
        </div>
        <div className="about-card">
          <div className="about-icon">🔍</div>
          <h3 className="about-card-title">Fake Review Detection</h3>
          <p className="about-card-text">
            Detects duplicate reviews, burst posting, and suspicious patterns
            to give you a real trust score.
          </p>
        </div>
        <div className="about-card">
          <div className="about-icon">📈</div>
          <h3 className="about-card-title">Price Trend Analysis</h3>
          <p className="about-card-text">
            Tracks price history and predicts whether prices will drop,
            rise, or stay stable.
          </p>
        </div>
        <div className="about-card">
          <div className="about-icon">🖼️</div>
          <h3 className="about-card-title">Image Authenticity</h3>
          <p className="about-card-text">
            Checks if product images are original, edited, or stock photos
            so you know what you're buying.
          </p>
        </div>
      </div>

      <div className="demo-section">
        <h2 className="about-section-title">Try Sentiment Analysis Live</h2>
        <p className="demo-subtitle">Type any product review below and see how our AI analyzes it!</p>

        <div className="demo-box">
          <textarea
            className="demo-textarea"
            placeholder="e.g. This phone has amazing camera quality but the battery drains too fast..."
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            rows={4}
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
                <div className="demo-bar-wrap">
                  <div className="demo-bar-label">Positive</div>
                  <div className="demo-bar-track">
                    <div className="demo-bar-fill demo-bar-green" style={{width: `${result.positive}%`}} />
                  </div>
                  <div className="demo-bar-pct">{result.positive}%</div>
                </div>
                <div className="demo-bar-wrap">
                  <div className="demo-bar-label">Neutral</div>
                  <div className="demo-bar-track">
                    <div className="demo-bar-fill demo-bar-amber" style={{width: `${result.neutral}%`}} />
                  </div>
                  <div className="demo-bar-pct">{result.neutral}%</div>
                </div>
                <div className="demo-bar-wrap">
                  <div className="demo-bar-label">Negative</div>
                  <div className="demo-bar-track">
                    <div className="demo-bar-fill demo-bar-red" style={{width: `${result.negative}%`}} />
                  </div>
                  <div className="demo-bar-pct">{result.negative}%</div>
                </div>
              </div>
            </div>
          )}

          {result?.error && (
            <p className="auth-error">{result.error}</p>
          )}
        </div>
      </div>

    </main>
  );
}