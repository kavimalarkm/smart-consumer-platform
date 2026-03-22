"use client";
import { useState } from "react";
import ScoreBar from "./ScoreBar";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";
import { TrendingDown, TrendingUp, Minus, ExternalLink, Bookmark, Bell, Share2 } from "lucide-react";const RANK_LABELS = { 1: "Best Choice", 2: "2nd Choice", 3: "3rd Choice" };
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
const router = useRouter();

function handleViewDetail() {
  const data = encodeURIComponent(JSON.stringify(product));
  router.push(`/product?data=${data}`);
}
  const [saved, setSaved] = useState(false);
const [alertSet, setAlertSet] = useState(false);
const [alertPrice, setAlertPrice] = useState("");
const [showAlert, setShowAlert] = useState(false);

async function handleSave() {
  if (saved) {
    alert("Already saved!");
    return;
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Please login to save products!");
    return;
  }

  const { data: existing } = await supabase
    .from("saved_products")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_name", product.name)
    .single();

  if (existing) {
    setSaved(true);
    alert("Already saved!");
    return;
  }

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
  if (!error) {
    setSaved(true);
  } else {
    alert("Error saving product!");
  }
}
  function handleSetAlert() {
    if (alertPrice) {
      setAlertSet(true);
      setShowAlert(false);
      alert(`✅ Alert set! We'll notify you when ${product.name} drops to ₹${alertPrice}`);
    }
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

  return (
    <div className={`product-card ${isBest ? "product-card--best" : ""} ${isComparing ? "product-card--comparing" : ""}`}>
      {isBestDeal && <div className="best-deal-banner">🔥 Best Deal</div>}
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
       <h2 className="product-name" onClick={handleViewDetail} style={{cursor:"pointer"}}>
  {product.name}
</h2>
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
          {isComparing ? "✓" : "+ Compare"}
        </button>
        <button
          className={`save-btn ${saved ? "save-btn--active" : ""}`}
          onClick={handleSave}
          title="Save product"
        >
          <Bookmark size={13} />
        </button>
        <button
          className={`alert-btn ${alertSet ? "alert-btn--active" : ""}`}
          onClick={() => setShowAlert(!showAlert)}
          title="Set price alert"
        >
          <Bell size={13} />
        </button>
<button
  className="save-btn"
  onClick={handleShare}
  title="Share product"
>
  <Share2 size={13} />
</button>
      </div>
    </div>
  );
}