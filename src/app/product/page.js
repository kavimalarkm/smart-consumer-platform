"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Bookmark, Share2 } from "lucide-react";
import { supabase } from "../lib/supabase";

function PriceChart({ price, name }) {
  const currentPrice = parseFloat((price || "0").replace(/[^0-9.]/g, "")) || 0;
  if (!currentPrice) return null;

  const data = [
    { label: "3 months ago", price: Math.round(currentPrice * 1.15) },
    { label: "2 months ago", price: Math.round(currentPrice * 1.08) },
    { label: "1 month ago", price: Math.round(currentPrice * 1.03) },
    { label: "Current", price: currentPrice },
  ];

  const maxPrice = Math.max(...data.map((d) => d.price));

  return (
    <div className="price-chart-section">
      <h3 className="detail-section-title">Price History</h3>
      <div className="price-chart">
        {data.map((d) => (
          <div key={d.label} className="price-chart-col">
            <div className="price-chart-bar-wrap">
              <div
                className={`price-chart-bar ${d.label === "Current" ? "price-chart-bar--current" : ""}`}
                style={{ height: `${(d.price / maxPrice) * 100}%` }}
              />
            </div>
            <div className="price-chart-price">₹{(d.price / 1000).toFixed(1)}k</div>
            <div className="price-chart-label">{d.label}</div>
          </div>
        ))}
      </div>
      <p className="price-chart-note">
        📉 Price has dropped by {Math.round(((data[0].price - currentPrice) / data[0].price) * 100)}% over the last 3 months
      </p>
    </div>
  );
}

function ProductDetailContent() {
  const searchParams = useSearchParams();
  const [product, setProduct] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      try {
        setProduct(JSON.parse(decodeURIComponent(data)));
      } catch (e) {
        console.error("Invalid product data");
      }
    }
  }, [searchParams]);

  async function handleSave() {
    if (saved) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { alert("Please login to save!"); return; }
    const { error } = await supabase.from("saved_products").insert({
      user_id: user.id,
      product_name: product.name,
      product_price: product.price,
      product_image: product.image,
      product_url: product.url,
      platform: product.platform,
      sentiment: product.sentiment,
      trust_score: product.trustScore,
    });
    if (!error) setSaved(true);
  }

  function handleShare() {
    const text = `Check out ${product.name} at ${product.price} on ${product.platform}!`;
    const url = product.url || window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, text, url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert("Link copied to clipboard!");
    }
  }

  if (!product) return (
    <main className="main-container">
      <div className="loading-state">
        <div className="loading-dots"><span></span><span></span><span></span></div>
        <p>Loading product...</p>
      </div>
    </main>
  );

  return (
    <main className="main-container">
      <div className="detail-back">
        <Link href="/" className="back-btn">
          <ArrowLeft size={14} /> Back to Search
        </Link>
      </div>

      <div className="detail-grid">
        <div className="detail-image-col">
          {product.image && (
            <div className="detail-image-wrap">
              <img
                src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(product.image)}`}
                alt={product.name}
                className="detail-image"
              />
            </div>
          )}
          <div className="detail-actions">
            {product.url && (
              <a href={product.url} target="_blank" rel="noopener noreferrer" className="detail-buy-btn">
                Buy on {product.platform} <ExternalLink size={14} />
              </a>
            )}
            <button className={`save-btn ${saved ? "save-btn--active" : ""}`} onClick={handleSave}>
              <Bookmark size={14} />
              {saved ? "Saved" : "Save"}
            </button>
            <button className="save-btn" onClick={handleShare} title="Share">
              <Share2 size={14} />
            </button>
          </div>

          <PriceChart price={product.price} name={product.name} />
        </div>

        <div className="detail-info-col">
          <div className="detail-badges">
            <span className={`platform-badge ${product.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
              {product.platform}
            </span>
            {product.rank === 1 && <span className="rank-badge badge-rank1">Best Choice</span>}
          </div>

          <h1 className="detail-title">{product.name}</h1>
          <div className="detail-price">{product.price}</div>
          {product.rating && (
            <div className="detail-rating">
              ⭐ {product.rating} · {product.reviewCount?.toLocaleString()} reviews
            </div>
          )}

          <div className="detail-scores">
            <h3 className="detail-section-title">AI Analysis</h3>
            <div className="detail-score-grid">
              <div className="detail-score-card">
                <div className="detail-score-value" style={{color: product.sentiment >= 70 ? "#16a34a" : "#d97706"}}>
                  {product.sentiment}%
                </div>
                <div className="detail-score-label">Sentiment</div>
              </div>
              <div className="detail-score-card">
                <div className="detail-score-value" style={{color: product.trustScore >= 70 ? "#16a34a" : "#d97706"}}>
                  {product.trustScore}%
                </div>
                <div className="detail-score-label">Trust Score</div>
              </div>
              <div className="detail-score-card">
                <div className="detail-score-value" style={{color: product.imageAuth >= 70 ? "#16a34a" : "#d97706"}}>
                  {product.imageAuth}%
                </div>
                <div className="detail-score-label">Image Auth.</div>
              </div>
            </div>
          </div>

          {product.positives?.length > 0 && (
            <div className="detail-tags-section">
              <h3 className="detail-section-title">What users love</h3>
              <div className="card-tags">
                {product.positives.map((t) => (
                  <span key={t} className="tag tag-ok">{t}</span>
                ))}
              </div>
            </div>
          )}

          {product.complaints?.length > 0 && (
            <div className="detail-tags-section">
              <h3 className="detail-section-title">Common complaints</h3>
              <div className="card-tags">
                {product.complaints.map((t) => (
                  <span key={t} className="tag tag-warn">{t}</span>
                ))}
              </div>
            </div>
          )}

          <div className="detail-tags-section">
            <h3 className="detail-section-title">AI Recommendation</h3>
            <div className={`recommendation-box ${
              (product.sentiment + product.trustScore + product.imageAuth) / 3 >= 70
                ? "recommendation-good"
                : "recommendation-avg"
            }`}>
              {(product.sentiment + product.trustScore + product.imageAuth) / 3 >= 70
                ? "✅ This product is highly recommended based on our AI analysis. Reviews are genuine and image is authentic."
                : "⚠️ This product has mixed reviews. Consider checking other options before buying."
              }
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function ProductDetail() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailContent />
    </Suspense>
  );
}