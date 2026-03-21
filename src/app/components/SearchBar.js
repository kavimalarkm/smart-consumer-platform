"use client";
import { Search } from "lucide-react";

export default function SearchBar({ query, setQuery, onSearch }) {
  function handleKey(e) {
    if (e.key === "Enter") onSearch();
  }

  return (
    <div className="search-wrap">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="e.g. Smartphone under ₹20000 with good camera"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="search-btn" onClick={onSearch}>
          Analyze
        </button>
      </div>
    </div>
  );
}