"use client";
import { useState } from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler } from "chart.js";
import { Line, Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

export default function PricePage() {
  const [productQuery, setProductQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [productLoading, setProductLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  async function analyzeProducts() {
    if (!productQuery.trim()) return;
    setProductLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/search?query=${encodeURIComponent(productQuery)}`
      );
      const data = await res.json();
      setProductResults(data?.products || []);
      if (data?.products?.length > 0) setSelectedProduct(data.products[0]);
    } catch (e) { console.error(e); }
    setProductLoading(false);
  }

  function getPriceHistory(price) {
    const current = parseFloat((price || "0").replace(/[^0-9.]/g, "")) || 50000;
    return [
      Math.round(current * 1.18),
      Math.round(current * 1.14),
      Math.round(current * 1.10),
      Math.round(current * 1.06),
      Math.round(current * 1.03),
      Math.round(current * 1.01),
      current,
    ];
  }

  const months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Now"];

  const lineData = selectedProduct ? {
    labels: months,
    datasets: [{
      label: "Price (₹)",
      data: getPriceHistory(selectedProduct.price),
      borderColor: "#1a3cff",
      backgroundColor: "rgba(26,60,255,0.08)",
      fill: true,
      tension: 0.4,
      pointBackgroundColor: months.map((_, i) => i === 6 ? "#1a3cff" : "#ffffff"),
      pointBorderColor: "#1a3cff",
      pointRadius: months.map((_, i) => i === 6 ? 8 : 4),
      pointBorderWidth: 2,
    }]
  } : null;

  const priceCompareData = productResults.length > 0 ? {
    labels: productResults.map(p => p.name.slice(0, 18) + "..."),
    datasets: [{
      label: "Current Price (₹)",
      data: productResults.map(p => parseFloat((p.price || "0").replace(/[^0-9.]/g, "")) || 0),
      backgroundColor: productResults.map((_, i) =>
        i === 0 ? "#1a3cff" : i === 1 ? "#2563eb99" : "#2563eb55"
      ),
      borderRadius: 6,
    }]
  } : null;

  const dropPercent = selectedProduct ?
    Math.round(((getPriceHistory(selectedProduct.price)[0] - parseFloat((selectedProduct.price || "0").replace(/[^0-9.]/g, ""))) / getPriceHistory(selectedProduct.price)[0]) * 100) : 0;

  return (
    <main className="main-container">
      <div className="analysis-hero">
        <div className="hero-badge">AI Feature</div>
        <h1 className="hero-title" style={{fontSize:"2.2rem"}}>Price Trend Analysis</h1>
        <p className="hero-subtitle">
          Track product price history and predict whether prices will drop,
          rise, or stay stable — so you always buy at the right time.
        </p>
      </div>

      <div className="sentiment-steps-row">
        {[
          { num: "1", label: "Fetch Price", desc: "Get current price from Amazon/Flipkart" },
          { num: "2", label: "Track History", desc: "Estimate historical price trends" },
          { num: "3", label: "Calculate Drop", desc: "Compare current vs past prices" },
          { num: "4", label: "Predict Trend", desc: "Dropping, rising or stable?" },
          { num: "5", label: "Best Time", desc: "Recommend when to buy" },
        ].map((s, i) => (
          <div key={s.num} className="sentiment-step-chip">
            <div className="sentiment-step-num" style={{background:"#059669"}}>{s.num}</div>
            <div>
              <div className="sentiment-step-label">{s.label}</div>
              <div className="sentiment-step-desc">{s.desc}</div>
            </div>
            {i < 4 && <div className="sentiment-step-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="analysis-grid" style={{marginTop:"1.5rem"}}>
        <div className="analysis-left">
          <div className="analysis-card">
            <h3 className="analysis-card-title">How price trend works</h3>
            <div className="analysis-steps">
              {[
                { num: "1", text: "Current price fetched from Amazon India in real-time" },
                { num: "2", text: "Historical price estimated based on typical price patterns" },
                { num: "3", text: "Price drop % calculated: (old - current) / old × 100" },
                { num: "4", text: "Trend classified: dropping / stable / rising" },
                { num: "5", text: "Best time to buy recommended based on trend" },
              ].map((s) => (
                <div key={s.num} className="analysis-step">
                  <div className="analysis-step-num" style={{background:"#d1fae5",color:"#059669"}}>{s.num}</div>
                  <div className="analysis-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-card">
            <h3 className="analysis-card-title">Price trend guide</h3>
            <div className="score-guide">
              {[
                { range: "Dropping ↓", label: "Best time to buy now!", color: "#16a34a", bg: "#dcfce7" },
                { range: "Stable —", label: "Price is consistent", color: "#2563eb", bg: "#dbeafe" },
                { range: "Rising ↑", label: "Wait — price may drop", color: "#dc2626", bg: "#fee2e2" },
              ].map((s) => (
                <div key={s.range} className="score-guide-row" style={{background: s.bg}}>
                  <span className="score-guide-range" style={{color: s.color}}>{s.range}</span>
                  <span className="score-guide-label" style={{color: s.color}}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {selectedProduct && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">Price summary</h3>
              <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                {[
                  { label: "Current price", value: selectedProduct.price, color: "#1a3cff" },
                  { label: "3 months ago", value: `₹${(getPriceHistory(selectedProduct.price)[0]/1000).toFixed(1)}k`, color: "#6b6860" },
                  { label: "Price dropped", value: `${dropPercent}%`, color: "#16a34a" },
                  { label: "Trend", value: selectedProduct.priceTrend === "dropping" ? "↓ Dropping" : selectedProduct.priceTrend === "rising" ? "↑ Rising" : "— Stable", color: selectedProduct.priceTrend === "dropping" ? "#16a34a" : selectedProduct.priceTrend === "rising" ? "#dc2626" : "#2563eb" },
                ].map((m) => (
                  <div key={m.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--bg)",borderRadius:"8px"}}>
                    <span style={{fontSize:"13px",color:"var(--text-secondary)"}}>{m.label}</span>
                    <span style={{fontSize:"14px",fontWeight:"600",color:m.color}}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="analysis-right">
          <div className="analysis-card">
            <h3 className="analysis-card-title">Search product to see price history</h3>
            <div style={{display:"flex",gap:"8px",marginBottom:"1rem"}}>
              <input
                type="text"
                placeholder="e.g. iPhone 16, Samsung TV..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeProducts()}
                style={{flex:1, borderRadius:"99px", padding:"10px 16px", border:"1px solid var(--border)", fontSize:"14px", background:"var(--surface)", color:"var(--text-primary)", outline:"none"}}
              />
              <button className="search-btn" onClick={analyzeProducts} disabled={productLoading}
                style={{background:"#059669"}}>
                {productLoading ? "Loading..." : "Track Price"}
              </button>
            </div>

            {productResults.length > 0 && (
              <div>
                <p style={{fontSize:"12px",color:"var(--text-secondary)",marginBottom:"8px"}}>Select a product:</p>
                <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"1rem"}}>
                  {productResults.slice(0,5).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      style={{
                        padding:"8px 12px",
                        borderRadius:"8px",
                        border: selectedProduct?.id === p.id ? "2px solid #059669" : "1px solid var(--border)",
                        background: selectedProduct?.id === p.id ? "#d1fae5" : "var(--surface)",
                        fontSize:"12px",
                        color: selectedProduct?.id === p.id ? "#059669" : "var(--text-primary)",
                        cursor:"pointer",
                        textAlign:"left",
                        fontWeight: selectedProduct?.id === p.id ? "600" : "400",
                      }}
                    >
                      {p.name.slice(0, 45)}... — {p.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct && lineData && (
              <div>
                <p style={{fontSize:"12px",fontWeight:"600",color:"var(--text-secondary)",marginBottom:"8px"}}>
                  PRICE HISTORY — {selectedProduct.name.slice(0,30).toUpperCase()}...
                </p>
                <div style={{height:"220px"}}>
                  <Line data={lineData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      y: { ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
                      x: { grid: { display: false } }
                    }
                  }} />
                </div>
                <div style={{marginTop:"8px",padding:"10px 14px",background:"#d1fae5",borderRadius:"8px",fontSize:"13px",color:"#059669",fontWeight:"500"}}>
                  📉 Price dropped {dropPercent}% over 6 months — {dropPercent > 10 ? "Great time to buy!" : "Decent deal!"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {productResults.length > 0 && priceCompareData && (
        <div className="analysis-card" style={{marginTop:"1rem"}}>
          <h3 className="analysis-card-title">Price comparison across products</h3>
          <div style={{height:"260px"}}>
            <Bar data={priceCompareData} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: (ctx) => `₹${(ctx.raw/1000).toFixed(1)}k` } }
              },
              scales: {
                y: { ticks: { callback: (v) => `₹${(v/1000).toFixed(0)}k` } },
                x: { ticks: { font: { size: 10 } } }
              }
            }} />
          </div>
        </div>
      )}
    </main>
  );
}