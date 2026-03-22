export default function About() {
  return (
    <main className="main-container">

      <div className="about-hero">
        <div className="hero-badge">About Us</div>
        <h1 className="hero-title">Smart Consumer Intelligence</h1>
        <p className="hero-subtitle">
          We help shoppers make smarter decisions using AI — no more fake
          reviews, price traps, or misleading product images.
        </p>
      </div>

      <div className="about-stats">
        <div className="about-stat">
          <div className="about-stat-number">10+</div>
          <div className="about-stat-label">Products per search</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-number">2</div>
          <div className="about-stat-label">Platforms compared</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-number">AI</div>
          <div className="about-stat-label">Powered analysis</div>
        </div>
        <div className="about-stat">
          <div className="about-stat-number">Free</div>
          <div className="about-stat-label">Always free</div>
        </div>
      </div>

      <div className="about-section">
        <h2 className="about-section-title">How Sentiment Analysis Works</h2>
        <div className="about-flow">
          <div className="about-flow-step">
            <div className="about-flow-icon">📝</div>
            <div className="about-flow-title">Collect Reviews</div>
            <div className="about-flow-desc">We fetch real customer reviews from Amazon India using the RapidAPI.</div>
          </div>
          <div className="about-flow-arrow">→</div>
          <div className="about-flow-step">
            <div className="about-flow-icon">🧠</div>
            <div className="about-flow-title">NLP Analysis</div>
            <div className="about-flow-desc">Our AI uses TextBlob NLP to analyze the sentiment polarity of each review.</div>
          </div>
          <div className="about-flow-arrow">→</div>
          <div className="about-flow-step">
            <div className="about-flow-icon">📊</div>
            <div className="about-flow-title">Score Calculation</div>
            <div className="about-flow-desc">Reviews are classified as positive, neutral, or negative and scored 0-100%.</div>
          </div>
          <div className="about-flow-arrow">→</div>
          <div className="about-flow-step">
            <div className="about-flow-icon">🔍</div>
            <div className="about-flow-title">Keyword Extraction</div>
            <div className="about-flow-desc">Most frequent words from positive and negative reviews are extracted.</div>
          </div>
          <div className="about-flow-arrow">→</div>
          <div className="about-flow-step">
            <div className="about-flow-icon">✅</div>
            <div className="about-flow-title">Final Score</div>
            <div className="about-flow-desc">A final sentiment score and trust score is shown on each product card.</div>
          </div>
        </div>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon">💬</div>
          <h3 className="about-card-title">Sentiment Analysis</h3>
          <p className="about-card-text">
            Our AI reads real customer reviews using Natural Language Processing (NLP).
            It classifies each review as positive, neutral, or negative and gives
            an overall sentiment score from 0 to 100%.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">🔍</div>
          <h3 className="about-card-title">Fake Review Detection</h3>
          <p className="about-card-text">
            We detect suspicious patterns like duplicate reviews, burst posting,
            and repetitive text. A trust score shows how genuine the reviews are.
            Lower trust score means more fake reviews detected.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">📈</div>
          <h3 className="about-card-title">Price Trend Analysis</h3>
          <p className="about-card-text">
            We track product prices over time and show a price history chart.
            The system predicts whether the price is likely to drop, rise,
            or remain stable — so you always buy at the right time.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">🖼️</div>
          <h3 className="about-card-title">Image Authenticity</h3>
          <p className="about-card-text">
            Our system checks if product images are original, edited, or stock
            photos. An authenticity score shows how trustworthy the product
            images are — helping you avoid misleading listings.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">🏆</div>
          <h3 className="about-card-title">Smart Ranking</h3>
          <p className="about-card-text">
            Products are ranked using a weighted combination of sentiment score,
            trust score, image authenticity, and price. The best overall product
            is highlighted as the top recommendation.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">⚡</div>
          <h3 className="about-card-title">Real-Time Data</h3>
          <p className="about-card-text">
            All product data, prices, and reviews are fetched in real-time from
            Amazon India and Flipkart via RapidAPI. You always see the most
            up-to-date information when you search.
          </p>
        </div>
      </div>

      <div className="about-tech">
        <h2 className="about-section-title">Tech Stack</h2>
        <div className="tech-grid">
          {[
            { name: "Next.js", desc: "Frontend framework", color: "#0f0e0c" },
            { name: "FastAPI", desc: "Python backend", color: "#059669" },
            { name: "TextBlob", desc: "NLP & sentiment", color: "#2563eb" },
            { name: "Supabase", desc: "Auth & database", color: "#3ecf8e" },
            { name: "RapidAPI", desc: "Product data", color: "#0f172a" },
            { name: "Vercel", desc: "Frontend hosting", color: "#000000" },
            { name: "Render", desc: "Backend hosting", color: "#46e3b7" },
            { name: "GitHub", desc: "Version control", color: "#1f2328" },
          ].map((tech) => (
            <div key={tech.name} className="tech-card">
              <div className="tech-name">{tech.name}</div>
              <div className="tech-desc">{tech.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="about-mission">
        <h2 className="about-mission-title">Our Mission</h2>
        <p className="about-mission-text">
          Online shopping should be transparent and trustworthy. We built this
          platform to give every shopper the same data-driven insights that
          experts use — completely free.
        </p>
      </div>

    </main>
  );
}