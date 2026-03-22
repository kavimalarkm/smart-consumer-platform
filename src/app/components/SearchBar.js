"use client";
import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

const SUGGESTIONS = [
  "iPhone 16", "Samsung Galaxy S24", "OnePlus 13",
  "MacBook Air M3", "Dell Inspiron 15", "HP Pavilion laptop",
  "Sony WH-1000XM5", "boAt Airdopes", "JBL earbuds",
  "Samsung 55 inch TV", "Mi Smart TV", "LG OLED TV",
  "Nike Air Max", "Adidas running shoes", "Puma sneakers",
  "Canon DSLR camera", "Sony mirrorless camera", "GoPro Hero",
  "Apple Watch Series 10", "Samsung Galaxy Watch", "Noise smartwatch",
  "iPad Pro", "Samsung Galaxy Tab", "Lenovo Tab",
  "Gaming chair", "Mechanical keyboard", "Gaming mouse",
  "Air purifier", "Robot vacuum cleaner", "Smart speaker",
];

export default function SearchBar({ query, setQuery, onSearch }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleChange(e) {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length > 1) {
      const filtered = SUGGESTIONS.filter((s) =>
        s.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 6));
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }

  function handleSelect(suggestion) {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  }

  function handleKey(e) {
    if (e.key === "Enter") {
      setShowSuggestions(false);
      onSearch();
    }
  }

  return (
    <div className="search-wrap" ref={ref}>
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          className="search-input"
          type="text"
          placeholder="e.g. Smartphone under ₹20000 with good camera"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKey}
          onFocus={() => {
            if (suggestions.length > 0) setShowSuggestions(true);
          }}
        />
        <button className="search-btn" onClick={() => { setShowSuggestions(false); onSearch(); }}>
          Analyze
        </button>
      </div>

      {showSuggestions && (
        <div className="suggestions-dropdown">
          {suggestions.map((s) => (
            <button
              key={s}
              className="suggestion-item"
              onClick={() => handleSelect(s)}
            >
              <Search size={13} className="suggestion-icon" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}