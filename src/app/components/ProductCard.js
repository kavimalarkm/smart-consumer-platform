"use client";
import { useState } from "react";
import ScoreBar from "./ScoreBar";
import { TrendingDown, TrendingUp, Minus } from "lucide-react";

const RANK_LABELS = { 1: "Best Choice", 2: "2nd Choice", 3: "3rd Choice" };
const RANK_CLASSES = { 1: "badge-rank1", 2: "badge-rank2", 3: "badge-rank3" };

function PriceTrendBadge({ trend }) {
  if (trend === "dropping")
    return <span className="trend trend-drop"><TrendingDown size={13} /> Price dropping</span>;
  if (trend === "rising")
    return <span className="trend trend-rise"><TrendingUp size={13} /> Price rising</span>;
  return <span className="trend trend-stable"><Minus size={13} /> Stable price</span>;
}

export default function ProductCard({ product, onCompare, isComparing }) {
  const isBest = product.rank === 1;
  const [imgError, setImgError] = useState(false);
  const rankLabel = RANK_LABELS[product.rank] || `${product.rank}th Choice`;
  const rankClass = RANK_CLASSES[product.rank] || "badge-rank3";

  return (
    <div className={`product-card ${isBest ? "product-card--best" : ""} ${isComparing ? "product-card--comparing" : ""}`}>
      {product.image && !imgError && (
        <div className="card-image-wrap">
          <img
            src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(product.image)}`}
            alt={product.name}
            className="card-image"
            onError={() => setImgError(true)}
          />
        </div>
      )}
      <div className="card-top">
        <div className="card-badges">
          <span className={`rank-badge ${rankClass}`}>{rankLabel}</span>
          {product.platform && (
            <span className={`platform-badge ${product.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
              {product.platform}
            </span>
          )}
        </div>
        <h2 className="product-name">{product.name}</h2>
        <div className="product-meta">
          <span className="product-price">{product.price}</span>
          <PriceTrendBadge trend={product.priceTrend} />
        </div>
        {product.rating && (
          <div className="product-rating">
            <span className="rating-star">⭐</span>
            <span className="rating-value">{product.rating}</span>
            {product.reviewCount && (
              <span className="rating-count">({product.reviewCount} reviews)</span>
            )}
          </div>
        )}
      </div>
      <div className="scores">
        <ScoreBar label="Sentiment" value={product.sentiment} />
        <ScoreBar label="Trust score" value={product.trustScore} />
        <ScoreBar label="Image auth." value={product.imageAuth} />
      </div>
      <div className="card-tags">
        {product.positives && product.positives.map((t) => (
          <span key={t} className="tag tag-ok">{t}</span>
        ))}
        {product.complaints && product.complaints.map((t) => (
          <span key={t} className="tag tag-warn">{t}</span>
        ))}
      </div>
      <div className="card-actions">
        {product.url && (
          <a href={product.url} target="_blank" rel="noopener noreferrer" className="view-btn">View on {product.platform} ↗</a>
        )}
        {onCompare && (
          <button className={`compare-btn ${isComparing ? "compare-btn--active" : ""}`} onClick={() => onCompare(product)}>
            {isComparing ? "✓ Added" : "+ Compare"}
          </button>
        )}
      </div>
    </div>
  );
}