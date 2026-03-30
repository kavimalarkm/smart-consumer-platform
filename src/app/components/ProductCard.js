"use client";
import { useState } from "react";
import ScoreBar from "./ScoreBar";
import { TrendingDown, TrendingUp, Minus, Bookmark, BookmarkCheck } from "lucide-react";

const RANK_LABELS = { 1: "Best Choice", 2: "2nd Choice", 3: "3rd Choice" };
const RANK_CLASSES = { 1: "badge-rank1", 2: "badge-rank2", 3: "badge-rank3" };

function PriceTrendBadge({ trend }) {
  if (trend === "dropping")
    return <span className="trend trend-drop"><TrendingDown size={12} /> Price dropping</span>;
  if (trend === "rising")
    return <span className="trend trend-rise"><TrendingUp size={12} /> Price rising</span>;
  return <span className="trend trend-stable"><Minus size={12} /> Stable price</span>;
}

export default function ProductCard({ product, onCompare, isComparing, onSave, isSaved }) {
  const isBest = product.rank === 1;
  const [imgError, setImgError] = useState(false);
  const rankLabel = RANK_LABELS[product.rank] || `${product.rank}th Choice`;
  const rankClass = RANK_CLASSES[product.rank] || "badge-rank3";

  return (
    <div className={`product-card ${isBest ? "product-card--best" : ""} ${isComparing ? "product-card--comparing" : ""}`}>

      {/* Image */}
      {product.image && !imgError && (
        <div style={{
          width: "100%",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f6f2",
          borderRadius: "10px",
          marginBottom: "14px",
          overflow: "hidden",
        }}>
          <img
            src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(product.image)}`}
            alt={product.name}
            style={{ maxHeight: "160px", maxWidth: "85%", objectFit: "contain" }}
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* Badges row */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap" }}>
        <span className={`rank-badge ${rankClass}`}>{rankLabel}</span>
        {product.platform && (
          <span className={`platform-badge ${product.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
            {product.platform}
          </span>
        )}
      </div>

      {/* Product name */}
      <h2 style={{
        fontFamily: "'Syne', sans-serif",
        fontSize: "15px",
        fontWeight: "600",
        color: "var(--text-primary)",
        marginBottom: "8px",
        lineHeight: "1.4",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>{product.name}</h2>

      {/* Price + trend */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px", flexWrap: "wrap" }}>
        <span style={{ fontSize: "17px", fontWeight: "700", color: "var(--text-primary)" }}>{product.price}</span>
        <PriceTrendBadge trend={product.priceTrend} />
      </div>

      {/* Rating */}
      {product.rating && (
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "14px" }}>
          ⭐ {product.rating}
          {product.reviewCount ? ` (${Number(product.reviewCount).toLocaleString()} reviews)` : ""}
        </div>
      )}

      {/* Score bars */}
      <div className="scores">
        <ScoreBar label="Sentiment" value={product.sentiment} />
        <ScoreBar label="Trust score" value={product.trustScore} />
        <ScoreBar label="Image auth." value={product.imageAuth} />
      </div>

      {/* Tags */}
      {(product.positives?.length > 0 || product.complaints?.length > 0) && (
        <div className="card-tags" style={{ marginTop: "12px", marginBottom: "12px" }}>
          {product.positives?.map((t) => (
            <span key={t} className="tag tag-ok">{t}</span>
          ))}
          {product.complaints?.map((t) => (
            <span key={t} className="tag tag-warn">{t}</span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: "flex", gap: "6px", marginTop: "14px" }}>
        {product.url && (
          
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="view-btn"
            style={{ flex: 1, textAlign: "center" }}
          >
            View on {product.platform} ↗
          </a>
        )}
        {onSave && (
          <button
            className={`save-btn ${isSaved ? "save-btn--active" : ""}`}
            onClick={() => onSave(product)}
            title={isSaved ? "Saved" : "Save product"}
          >
            {isSaved ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
          </button>
        )}
        {onCompare && (
          <button
            className={`compare-btn ${isComparing ? "compare-btn--active" : ""}`}
            onClick={() => onCompare(product)}
          >
            {isComparing ? "✓ Added" : "+ Compare"}
          </button>
        )}
      </div>
    </div>
  );
}