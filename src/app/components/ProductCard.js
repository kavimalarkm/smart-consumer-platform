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

export default function ProductCard({ product }) {
  const isBest = product.rank === 1;
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageResult, setImageResult] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);

  async function checkImage() {
    if (!imageUrl && !imageFile) return;
    setImageLoading(true);
    setImageResult(null);
    try {
      let res;
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        res = await fetch("https://smart-consumer-backend.onrender.com/analyze-image", {
          method: "POST",
          body: formData,
        });
      } else {
        res = await fetch(
          `https://smart-consumer-backend.onrender.com/analyze-image?url=${encodeURIComponent(imageUrl)}`,
          { method: "POST" }
        );
      }
      const data = await res.json();
      setImageResult(data);
    } catch (err) {
      setImageResult({ error: "Could not connect to server", score: 0, verdict: "Failed", flags: [] });
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className={`product-card ${isBest ? "product-card--best" : ""}`}>
      <div className="card-top">
        <span className={`rank-badge ${RANK_CLASSES[product.rank]}`}>
          {RANK_LABELS[product.rank]}
        </span>
        <h2 className="product-name">{product.name}</h2>
        <div className="product-meta">
          <span className="product-price">{product.price}</span>
          <PriceTrendBadge trend={product.priceTrend} />
        </div>
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

      <div className="image-checker">
        <p className="image-checker-label">Check product image</p>
        <input
          className="image-input"
          type="text"
          placeholder="Paste image URL..."
          value={imageUrl}
          onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }}
        />
        <div className="image-checker-row">
          <label className="upload-btn">
            Upload image
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => { setImageFile(e.target.files[0]); setImageUrl(""); }}
            />
          </label>
          {imageFile && <span className="file-name">{imageFile.name}</span>}
          <button className="check-btn" onClick={checkImage} disabled={imageLoading}>
            {imageLoading ? "Checking..." : "Analyze"}
          </button>
        </div>

        {imageResult && !imageResult.error && (
          <div className="image-result">
            <ScoreBar label="Auth. score" value={imageResult.score} />
            <span className={`tag ${imageResult.score >= 75 ? "tag-ok" : imageResult.score >= 50 ? "tag-warn" : "tag-danger"}`}>
              {imageResult.verdict}
            </span>
            {imageResult.flags.map((f) => (
              <span key={f} className="tag tag-warn">{f}</span>
            ))}
          </div>
        )}
        {imageResult && imageResult.error && (
          <p className="image-error">{imageResult.error}</p>
        )}
      </div>
    </div>
  );
}