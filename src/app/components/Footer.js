import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">SmartConsumer</p>
          <p className="footer-tagline">
            AI-powered product intelligence for smarter shopping decisions.
          </p>
        </div>

        <div className="footer-links">
          <div className="footer-col">
            <p className="footer-col-title">Platform</p>
            <Link href="/" className="footer-link">Home</Link>
            <Link href="/about" className="footer-link">About</Link>
            <Link href="/saved" className="footer-link">Saved Products</Link>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Features</p>
            <p className="footer-link">Sentiment Analysis</p>
            <p className="footer-link">Fake Review Detection</p>
            <p className="footer-link">Price Trends</p>
            <p className="footer-link">Image Authenticity</p>
          </div>
          <div className="footer-col">
            <p className="footer-col-title">Data Sources</p>
            <p className="footer-link">Amazon India</p>
            <p className="footer-link">Flipkart</p>
            <p className="footer-link">RapidAPI</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-copy">
          © 2026 SmartConsumer. Built with Next.js & FastAPI.
        </p>
      </div>
    </footer>
  );
}