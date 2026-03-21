export default function About() {
  return (
    <main className="main-container">
      <div className="about-hero">
        <div className="hero-badge">About Us</div>
        <h1 className="hero-title">Smart Consumer Intelligence</h1>
        <p className="hero-subtitle">
          We help shoppers make smarter decisions using AI — no more fake reviews,
          price traps, or misleading product images.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon">💬</div>
          <h3 className="about-card-title">Sentiment Analysis</h3>
          <p className="about-card-text">
            Our AI reads thousands of reviews and tells you exactly what users
            love and hate about each product — in seconds.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">🔍</div>
          <h3 className="about-card-title">Fake Review Detection</h3>
          <p className="about-card-text">
            We detect suspicious review patterns like repeated text, burst
            posting, and fake accounts to give you a real trust score.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">📈</div>
          <h3 className="about-card-title">Price Trend Analysis</h3>
          <p className="about-card-text">
            Track price history and get predictions on when prices are likely
            to drop — so you always buy at the right time.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">🖼️</div>
          <h3 className="about-card-title">Image Authenticity</h3>
          <p className="about-card-text">
            Our system checks if product images are original, edited, or stock
            photos — so you know exactly what you're buying.
          </p>
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