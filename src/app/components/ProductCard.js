import ScoreBar from "./ScoreBar";
import { TrendingDown, TrendingUp, Minus, ExternalLink } from "lucide-react";

const RANK_LABELS = { 1: "Best Choice", 2: "2nd Choice", 3: "3rd Choice" };
const RANK_CLASSES = { 1: "badge-rank1", 2: "badge-rank2", 3: "badge-rank3" };

function PriceTrendBadge({ trend }) {
  if (trend === "dropping")
    return <span className="trend trend-drop"><TrendingDown size={13} /> Price dropping</span>;
  if (trend === "rising")
    return <span className="trend trend-rise"><TrendingUp size={13} /> Price rising</span>;
  return <span className="trend trend-stable"><Minus size={13} /> Stable price</span>;
}

export default function ProductCard({ product }) {
  const isBest = product.rank === 1;

  return (
    <div className={`product-card ${isBest ? "product-card--best" : ""}`}>
      {product.image && (
        <div className="product-image-wrap">
          <img src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(product.image)}`} alt={product.name} className="product-image" />
        </div>
      )}

      <div className="card-top">
        <span className={`rank-badge ${RANK_CLASSES[product.rank]}`}>
          {RANK_LABELS[product.rank]}
        </span>
<span className={`platform-badge ${product.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
  {product.platform}
</span>
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

      {product.url && (
        <a href={product.url} target="_blank" rel="noopener noreferrer" className="view-btn">
         View on {product.platform} <ExternalLink size={13} />
        </a>
      )}
    </div>
  );
}