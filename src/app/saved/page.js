"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";

export default function SavedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("saved_products")
          .select("*")
          .order("created_at", { ascending: false });
        setProducts(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleDelete(id) {
    await supabase.from("saved_products").delete().eq("id", id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return (
    <main className="main-container">
      <div className="loading-state">
        <div className="loading-dots"><span></span><span></span><span></span></div>
        <p>Loading saved products...</p>
      </div>
    </main>
  );

  if (!user) return (
    <main className="main-container">
      <div className="empty-state">
        <p className="empty-title">Please login to view saved products</p>
        <Link href="/" className="back-btn">Go to Home</Link>
      </div>
    </main>
  );

  return (
    <main className="main-container">
      <div className="saved-header">
        <h1 className="hero-title" style={{fontSize: "2rem"}}>Saved Products</h1>
        <Link href="/" className="back-btn">← Back to Search</Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p className="empty-title">No saved products yet!</p>
          <p className="empty-sub">Search for products and click the bookmark icon to save them.</p>
          <Link href="/" className="back-btn">Start Searching</Link>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div key={p.id} className="product-card">
              {p.product_image && (
                <div className="product-image-wrap">
                  <img
                    src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(p.product_image)}`}
                    alt={p.product_name}
                    className="product-image"
                  />
                </div>
              )}
              <div className="card-top">
                <span className={`platform-badge ${p.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
                  {p.platform}
                </span>
                <h2 className="product-name">{p.product_name}</h2>
                <p className="product-price">{p.product_price}</p>
              </div>
              <div className="scores">
                <div className="score-row">
                  <span className="score-label">Sentiment</span>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{width:`${p.sentiment}%`, background:"#2563eb"}} />
                  </div>
                  <span className="score-value">{p.sentiment}%</span>
                </div>
                <div className="score-row">
                  <span className="score-label">Trust score</span>
                  <div className="score-bar-track">
                    <div className="score-bar-fill" style={{width:`${p.trust_score}%`, background:"#16a34a"}} />
                  </div>
                  <span className="score-value">{p.trust_score}%</span>
                </div>
              </div>
              <div className="card-actions">
                {p.product_url && (
                  <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="view-btn">
                    View on {p.platform}
                  </a>
                )}
                <button className="delete-btn" onClick={() => handleDelete(p.id)}>
                  🗑 Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}