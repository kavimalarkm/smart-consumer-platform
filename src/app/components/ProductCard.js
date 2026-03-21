import { useState } from "react";
import ScoreBar from "./ScoreBar";
import { TrendingDown, TrendingUp, Minus, ExternalLink, Bell } from "lucide-react";

const RANK_LABELS = { 1: "Best Choice", 2: "2nd Choice", 3: "3rd Choice" };
const RANK_CLASSES = { 1: "badge-rank1", 2: "badge-rank2", 3: "badge-rank3" };

function PriceTrendBadge({ trend }) {
  if (trend === "dropping")
    return <span className="trend trend-drop"><TrendingDown size={13} /> Price dropping</span>;
  if (trend === "rising")
    return <span className="trend trend-rise"><TrendingUp size={13} /> Price rising</span>;
  return <span className="trend trend-stable"><Minus size={13} /> Stable price</span>;
}

export default function ProductCard({ product, onCompare, isComparing, isBestDeal }) {
  const isBest = product.rank === 1;
  const [alertSet, setAlertSet] = useState(false);
  const [alertPrice, setAlertPrice] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  function handleSetAlert() {
    if (alertPrice) {
      setAlertSet(true);
      setShowAlert(false);
      alert(`✅ Alert set! We'll notify you when ${product.name} drops to ₹${alertPrice}`);
    }
  }

  return (
    <div className={`product-card ${isBest ? "product-card--best" : ""} ${isComparing ? "product-card--comparing" : ""}`}>
      {isBestDeal && (
        <div className="best-deal-banner">🔥 Best Deal</div>
      )}
      {product.image && (
        <div className="product-image-wrap">
          <img
            src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(product.image)}`}
            alt={product.name}
            className="product-image"
          />
        </div>
      )}
      <div className="card-top">
        <div className="card-badges">
          {RANK_LABELS[product.rank] && (
            <span className={`rank-badge ${RANK_CLASSES[product.rank] || "badge-rank3"}`}>
              {RANK_LABELS[product.rank] || `#${product.rank}`}
            </span>
          )}
          <span className={`platform-badge ${product.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
            {product.platform}
          </span>
        </div>
        <h2 className="product-name">{product.name}</h2>
        <div className="product-meta">
          <span className="product-price">{product.price}</span>
          <PriceTrendBadge trend={product.priceTrend} />
        </div>
        {product.rating && (
          <div className="product-rating">
            ⭐ {product.rating} ({product.reviewCount} reviews)
          </div>
        )}
      </div>
      <div className="scores">
        <ScoreBar label="Sentiment" value={product.sentiment} />
        <ScoreBar label="Trust score" value={product.trustScore} />
        <ScoreBar label="Image auth." value={product.imageAuth} />
      </div>
      <div className="card-tags">
        {product.positives.map((t) => (
          <span key={t} className="tag tag-ok">{t}</span>
        ))}
        {product.complaints.map((t) => (
          <span key={t} className="tag tag-warn">{t}</span>
        ))}
      </div>

      {showAlert && (
        <div className="alert-box">
          <input
            type="number"
            placeholder="Enter target price ₹"
            value={alertPrice}
            onChange={(e) => setAlertPrice(e.target.value)}
            className="alert-input"
          />
          <button className="alert-set-btn" onClick={handleSetAlert}>Set Alert</button>
        </div>
      )}

      <div className="card-actions">
        {product.url && (
          <a href={product.url} target="_blank" rel="noopener noreferrer" className="view-btn">
            View on {product.platform} <ExternalLink size={13} />
          </a>
        )}
        <button
          className={`compare-btn ${isComparing ? "compare-btn--active" : ""}`}
          onClick={() => onCompare(product)}
        >
          {isComparing ? "✓ Added" : "+ Compare"}
        </button>
        <button
          className={`alert-btn ${alertSet ? "alert-btn--active" : ""}`}
          onClick={() => setShowAlert(!showAlert)}
          title="Set price alert"
        >
          <Bell size={13} />
        </button>
      </div>
    </div>
  );
}