"use client";
import { useState, useEffect } from "react";
import SearchBar from "./components/SearchBar";
import ProductCard from "./components/ProductCard";
import CompareModal from "./components/CompareModal";

export default function Home() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState("rank");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [darkMode, setDarkMode] = useState(false);
  const [history, setHistory] = useState([]);
  const [compareList, setCompareList] = useState([]);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  async function handleSearch(q) {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setLoading(true);
    try {
      const res = await fetch(
        `https://smart-consumer-backend.onrender.com/search?query=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setProducts(data.products);
      setSearched(true);
      setHistory((prev) => {
        const updated = [searchQuery, ...prev.filter((h) => h !== searchQuery)];
        return updated.slice(0, 5);
      });
    } catch (error) {
      console.error("API error:", error);
    } finally {
      setLoading(false);
    }
  }

  function handleCompare(product) {
    setCompareList((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        return prev.filter((p) => p.id !== product.id);
      }
      if (prev.length >= 2) return prev;
      return [...prev, product];
    });
  }

  function getSortedProducts() {
    let p = [...products];
    if (filterPlatform !== "all") {
      p = p.filter((x) => x.platform === filterPlatform);
    }
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
    if (sortBy === "rating")
      return p.sort((a, b) => parseFloat(b.rating || 0) - parseFloat(a.rating || 0));
    if (sortBy === "trust")
      return p.sort((a, b) => b.trustScore - a.trustScore);
    return p.sort((a, b) => a.rank - b.rank);
  }

  return (
    <main className="main-container">
      <button className="dark-mode-btn" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? "☀️ Light" : "🌙 Dark"}
      </button>

      {compareList.length > 0 && (
        <div className="compare-bar">
          <span>{compareList.length} product{compareList.length > 1 ? "s" : ""} selected</span>
          {compareList.length === 2 && (
            <button className="compare-now-btn" onClick={() => setShowCompare(true)}>
              Compare Now
            </button>
          )}
          <button className="compare-clear-btn" onClick={() => setCompareList([])}>
            Clear
          </button>
        </div>
      )}

      {showCompare && compareList.length === 2 && (
        <CompareModal products={compareList} onClose={() => setShowCompare(false)} />
      )}

      <header className="hero">
        <div className="hero-badge">AI-Powered</div>
        <h1 className="hero-title">Smart Consumer Intelligence</h1>
        <p className="hero-subtitle">
          Stop guessing. Get data-driven product recommendations with fake review
          detection, price trends, and image authenticity checks.
        </p>
        <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch} />
        {history.length > 0 && (
          <div className="search-history">
            <span className="history-label">Recent:</span>
            {history.map((h) => (
              <button key={h} className="history-chip" onClick={() => handleSearch(h)}>
                🕐 {h}
              </button>
            ))}
          </div>
        )}
      </header>

      {loading && (
        <div className="loading-state">
          <div className="loading-dots">
            <span></span><span></span><span></span>
          </div>
          <p>Analyzing reviews, prices and images…</p>
        </div>
      )}

      {searched && !loading && (
        <>
          <div className="results-toolbar">
            <span className="results-label">
              <span className="results-count">{getSortedProducts().length}</span>
              &nbsp;products found for &ldquo;{query}&rdquo;
            </span>
            <div className="toolbar-right">
              <div className="filter-buttons">
                <span className="sort-label">Platform:</span>
                {[
                  { key: "all", label: "All" },
                  { key: "Amazon", label: "Amazon" },
                  { key: "Flipkart", label: "Flipkart" },
                ].map((f) => (
                  <button
                    key={f.key}
                    className={`sort-btn ${filterPlatform === f.key ? "sort-btn--active" : ""}`}
                    onClick={() => setFilterPlatform(f.key)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="sort-buttons">
                <span className="sort-label">Sort:</span>
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
          </div>
          <div className="product-grid">
          {getSortedProducts().map((p, i) => (
  <ProductCard
    key={p.id}
    product={p}
    onCompare={handleCompare}
    isComparing={!!compareList.find((c) => c.id === p.id)}
    isBestDeal={i === 0}
  />
))}
          </div>
        </>
      )}

     {!searched && !loading && (
  <div className="home-sections">
    <div className="stats-row">
      <div className="stat-card">
        <div className="stat-number">10+</div>
        <div className="stat-label">Products per search</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">2</div>
        <div className="stat-label">Platforms compared</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">AI</div>
        <div className="stat-label">Powered analysis</div>
      </div>
      <div className="stat-card">
        <div className="stat-number">Free</div>
        <div className="stat-label">Always free</div>
      </div>
    </div>

    <div className="trending-section">
      <p className="trending-title">🔥 Trending Searches</p>
      <div className="trending-grid">
        {[
          { emoji: "📱", label: "iPhone 16" },
          { emoji: "💻", label: "Laptop under 50000" },
          { emoji: "🎧", label: "Wireless earbuds" },
          { emoji: "📺", label: "Smart TV 43 inch" },
          { emoji: "⌚", label: "Smart watch" },
          { emoji: "📷", label: "DSLR camera" },
          { emoji: "🎮", label: "Gaming chair" },
          { emoji: "👟", label: "Nike shoes" },
        ].map((item) => (
          <button
            key={item.label}
            className="trending-chip"
            onClick={() => handleSearch(item.label)}
          >
            <span className="trending-emoji">{item.emoji}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>

    <div className="example-queries">
      <p className="eq-label">Or try these example searches</p>
      <div className="eq-chips">
        {[
          "Smartphone under ₹20000 with good camera",
          "Laptop under ₹50000 for students",
          "Wireless earbuds under ₹3000",
        ].map((q) => (
          <button key={q} className="eq-chip" onClick={() => handleSearch(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  </div>
)}
    </main>
  );
}