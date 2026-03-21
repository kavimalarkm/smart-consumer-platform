"use client";
import { useState } from "react";
import SearchBar from "./components/SearchBar";
import ProductCard from "./components/ProductCard";

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);

async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:8000/search?query=${encodeURIComponent(query)}`
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
          <div className="results-header">
            <span className="results-label">
              {products.length} products analyzed for &ldquo;{query}&rdquo;
            </span>
          </div>
          <div className="product-grid">
            {products.map((p) => (
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