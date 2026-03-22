"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ExternalLink, ArrowLeft, Bookmark } from "lucide-react";
import { supabase } from "../lib/supabase";

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
            <button
              className={`save-btn ${saved ? "save-btn--active" : ""}`}
              onClick={handleSave}
            >
              <Bookmark size={14} />
              {saved ? "Saved" : "Save"}
            </button>
          </div>
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