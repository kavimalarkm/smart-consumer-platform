"use client";
import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ProductCard from "./components/ProductCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("rank");

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/search?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      setProducts(data.products);
      setSearched(true);
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  }

  function getSortedProducts() {
    const p = [...products];
    if (sortBy === "price_low") {
      return p.sort((a, b) => {
        const pa = parseFloat((a.price || "0").replace(/[^0-9.]/g, "")) || 0;
        const pb = parseFloat((b.price || "0").replace(/[^0-9.]/g, "")) || 0;
        return pa - pb;
      });
    }
    if (sortBy === "price_high") {
      return p.sort((a, b) => {
        const pa = parseFloat((a.price || "0").replace(/[^0-9.]/g, "")) || 0;
        const pb = parseFloat((b.price || "0").replace(/[^0-9.]/g, "")) || 0;
        return pb - pa;
      });
    }
    if (sortBy === "rating") {
      return p.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
    }
    if (sortBy === "trust") {
      return p.sort((a, b) => b.trustScore - a.trustScore);
    }
    return p.sort((a, b) => a.rank - b.rank);
  }

  return (
    <main className="main-container">
      <header className="hero">
        <div className="hero-badge">AI-Powered</div>
        <h1 className="hero-title">Smart Consumer Intelligence</h1>
        <p className="hero-subtitle">
          Stop guessing. Get data-driven product recommendations with fake review
          detection, price trends, and image authenticity checks.
        </p>
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
      </header>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p>Analyzing reviews, prices and images…</p>
        </div>
      )}

      {searched && !loading && (
        <>
          <div className="results-toolbar">
            <span className="results-label">
              {products.length} products analyzed for &ldquo;{query}&rdquo;
            </span>
            <div className="sort-buttons">
              <span className="sort-label">Sort by:</span>
              {[
                { key: "rank", label: "Best Match" },
                { key: "price_low", label: "Price ↑" },
                { key: "price_high", label: "Price ↓" },
                { key: "rating", label: "Rating" },
                { key: "trust", label: "Trust" },
              ].map((s) => (
                <button
                  key={s.key}
                  className={`sort-btn ${sortBy === s.key ? "sort-btn--active" : ""}`}
                  onClick={() => setSortBy(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="product-grid">
            {getSortedProducts().map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </>
      )}

      {!searched && !loading && (
        <div className="example-queries">
          <p className="eq-label">Try searching for</p>
          <div className="eq-chips">
            {[
              "Smartphone under ₹20000 with good camera",
              "Laptop under ₹50000 for students",
              "Wireless earbuds under ₹3000",
            ].map((q) => (
              <button key={q} className="eq-chip" onClick={() => setQuery(q)}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </main>
  );
}