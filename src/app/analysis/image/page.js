"use client";
import { useState } from "react";

export default function ImagePage() {
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function analyzeImage() {
    if (!imageUrl && !imageFile) return;
    setLoading(true);
    setResult(null);
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
      setResult(data);
    } catch (err) {
      setResult({ error: "Could not connect to server", score: 0, verdict: "Failed", flags: [] });
    } finally {
      setLoading(false);
    }
  }

  const scoreColor = result
    ? result.score >= 75 ? "#16a34a"
    : result.score >= 50 ? "#d97706"
    : "#dc2626"
    : "#059669";

  const scoreBg = result
    ? result.score >= 75 ? "#dcfce7"
    : result.score >= 50 ? "#fef3c7"
    : "#fee2e2"
    : "#d1fae5";

  return (
    <main className="main-container">
      <div className="analysis-hero">
        <div className="hero-badge">AI Feature</div>
        <h1 className="hero-title" style={{ fontSize: "2.2rem" }}>Image Authenticity</h1>
        <p className="hero-subtitle">
          Detect whether a product image is real, edited, or a stock photo —
          so you never get misled by fake listings.
        </p>
      </div>

      <div className="sentiment-steps-row">
        {[
          { num: "1", label: "Upload Image", desc: "Paste URL or upload file" },
          { num: "2", label: "Fetch & Read", desc: "Backend downloads image" },
          { num: "3", label: "Check Metadata", desc: "Scan EXIF camera data" },
          { num: "4", label: "Pixel Analysis", desc: "Brightness, noise, sharpness" },
          { num: "5", label: "Auth Score", desc: "0–100% authenticity result" },
        ].map((s, i) => (
          <div key={s.num} className="sentiment-step-chip">
            <div className="sentiment-step-num" style={{ background: "#059669" }}>{s.num}</div>
            <div>
              <div className="sentiment-step-label">{s.label}</div>
              <div className="sentiment-step-desc">{s.desc}</div>
            </div>
            {i < 4 && <div className="sentiment-step-arrow">→</div>}
          </div>
        ))}
      </div>

      <div className="analysis-grid" style={{ marginTop: "1.5rem" }}>
        <div className="analysis-left">
          <div className="analysis-card">
            <h3 className="analysis-card-title">How image authenticity works</h3>
            <div className="analysis-steps">
              {[
                { num: "1", text: "Image is fetched from URL or uploaded directly from your device" },
                { num: "2", text: "EXIF metadata checked — real photos have camera info, stock photos don't" },
                { num: "3", text: "Pixel color variation analyzed — fake images often have unnaturally flat colors" },
                { num: "4", text: "Image dimensions and aspect ratio checked for stock photo patterns" },
                { num: "5", text: "Final authenticity score calculated from all checks combined" },
              ].map((s) => (
                <div key={s.num} className="analysis-step">
                  <div className="analysis-step-num" style={{ background: "#d1fae5", color: "#059669" }}>{s.num}</div>
                  <div className="analysis-step-text">{s.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="analysis-card">
            <h3 className="analysis-card-title">Score guide</h3>
            <div className="score-guide">
              {[
                { range: "75–100%", label: "Likely authentic", color: "#16a34a", bg: "#dcfce7" },
                { range: "50–74%", label: "Possibly edited", color: "#d97706", bg: "#fef3c7" },
                { range: "0–49%", label: "Likely fake or stock photo", color: "#dc2626", bg: "#fee2e2" },
              ].map((s) => (
                <div key={s.range} className="score-guide-row" style={{ background: s.bg }}>
                  <span className="score-guide-range" style={{ color: s.color }}>{s.range}</span>
                  <span className="score-guide-label" style={{ color: s.color }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {result && !result.error && (
            <div className="analysis-card">
              <h3 className="analysis-card-title">Analysis summary</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { label: "Authenticity score", value: `${result.score}%`, color: scoreColor },
                  { label: "Verdict", value: result.verdict, color: scoreColor },
                  { label: "Issues found", value: result.flags.length === 0 ? "None" : `${result.flags.length} flag(s)`, color: result.flags.length === 0 ? "#16a34a" : "#dc2626" },
                ].map((m) => (
                  <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg)", borderRadius: "8px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{m.label}</span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: m.color }}>{m.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="analysis-right">
          <div className="analysis-card">
            <h3 className="analysis-card-title">Check a product image</h3>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Option 1 — Paste an image URL
            </p>
            <div style={{ display: "flex", gap: "8px", marginBottom: "1rem" }}>
              <input
                type="text"
                placeholder="e.g. https://example.com/product.jpg"
                value={imageUrl}
                onChange={(e) => { setImageUrl(e.target.value); setImageFile(null); }}
                onKeyDown={(e) => e.key === "Enter" && analyzeImage()}
                style={{ flex: 1, borderRadius: "99px", padding: "10px 16px", border: "1px solid var(--border)", fontSize: "14px", background: "var(--surface)", color: "var(--text-primary)", outline: "none" }}
              />
            </div>

            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "8px" }}>
              Option 2 — Upload an image from your device
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1.25rem" }}>
              <label style={{ background: "var(--surface)", border: "1.5px solid var(--border)", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "600", color: "var(--text-secondary)", cursor: "pointer", transition: "all 0.2s" }}>
                Choose file
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => { setImageFile(e.target.files[0]); setImageUrl(""); }}
                />
              </label>
              {imageFile && (
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                  {imageFile.name}
                </span>
              )}
            </div>

            <button
              onClick={analyzeImage}
              disabled={loading || (!imageUrl && !imageFile)}
              style={{ width: "100%", background: loading || (!imageUrl && !imageFile) ? "var(--border)" : "#059669", color: "white", border: "none", borderRadius: "99px", padding: "11px", fontFamily: "inherit", fontSize: "14px", fontWeight: "600", cursor: loading || (!imageUrl && !imageFile) ? "not-allowed" : "pointer", transition: "background 0.2s" }}
            >
              {loading ? "Analyzing..." : "Analyze Image"}
            </button>

            {result && !result.error && (
              <div style={{ marginTop: "1.25rem" }}>
                <div style={{ padding: "14px", background: scoreBg, borderRadius: "10px", marginBottom: "10px" }}>
                  <div style={{ fontSize: "13px", fontWeight: "600", color: scoreColor, marginBottom: "4px" }}>
                    {result.verdict}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700", color: scoreColor }}>
                    {result.score}%
                  </div>
                  <div style={{ fontSize: "12px", color: scoreColor, opacity: 0.8 }}>
                    authenticity score
                  </div>
                </div>

                {result.flags.length > 0 && (
                  <div>
                    <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Issues detected
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {result.flags.map((f) => (
                        <span key={f} style={{ fontSize: "12px", padding: "4px 10px", borderRadius: "99px", background: "#fef3c7", color: "#92400e", fontWeight: "500" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {result.flags.length === 0 && (
                  <div style={{ padding: "10px 14px", background: "#d1fae5", borderRadius: "8px", fontSize: "13px", color: "#059669", fontWeight: "500" }}>
                    ✓ No issues detected — image appears authentic!
                  </div>
                )}
              </div>
            )}

            {result && result.error && (
              <div style={{ marginTop: "1rem", padding: "10px 14px", background: "#fee2e2", borderRadius: "8px", fontSize: "13px", color: "#dc2626" }}>
                {result.error}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}