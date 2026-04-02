"use client";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Link from "next/link";
import { User, Bookmark, ShoppingBag, LogOut, Mail, Calendar } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [savedProducts, setSavedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const { data } = await supabase
          .from("saved_products")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        setSavedProducts(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  async function handleDelete(id) {
    await supabase.from("saved_products").delete().eq("id", id);
    setSavedProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (loading) return (
    <main className="main-container">
      <div className="loading-state">
        <div className="loading-dots"><span></span><span></span><span></span></div>
        <p>Loading profile...</p>
      </div>
    </main>
  );

  if (!user) return (
    <main className="main-container">
      <div className="empty-state" style={{ paddingTop: "4rem" }}>
        <div style={{ fontSize: "48px", marginBottom: "1rem" }}>👤</div>
        <p className="empty-title">Please login to view your profile</p>
        <p className="empty-sub">Login or sign up to save products and access your profile.</p>
        <Link href="/" className="back-btn">Go to Home</Link>
      </div>
    </main>
  );

  const joinDate = new Date(user.created_at).toLocaleDateString("en-IN", {
    year: "numeric", month: "long", day: "numeric"
  });

  const amazonSaved = savedProducts.filter(p => p.platform === "Amazon").length;
  const flipkartSaved = savedProducts.filter(p => p.platform === "Flipkart").length;
  const avgSentiment = savedProducts.length > 0
    ? Math.round(savedProducts.reduce((a, b) => a + (b.sentiment || 0), 0) / savedProducts.length)
    : 0;

  return (
    <main className="main-container">

      {/* Profile Header */}
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius)",
        padding: "2rem",
        marginBottom: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
        flexWrap: "wrap",
      }}>
        <div style={{
          width: "72px", height: "72px",
          borderRadius: "50%",
          background: "var(--accent)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "28px", color: "white", fontWeight: "700",
          fontFamily: "'Syne', sans-serif",
          flexShrink: 0,
        }}>
          {user.email[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "20px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "4px" }}>
            {user.email.split("@")[0]}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            <Mail size={13} /> {user.email}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <Calendar size={12} /> Joined {joinDate}
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "var(--red-light)", color: "var(--red)",
            border: "1px solid var(--red)", borderRadius: "99px",
            padding: "8px 16px", fontSize: "13px", fontWeight: "600",
            cursor: "pointer", fontFamily: "'Syne', sans-serif",
          }}
        >
          <LogOut size={14} /> Logout
        </button>
      </div>

      {/* Stats Row */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
        gap: "12px",
        marginBottom: "1.5rem",
      }}>
        {[
          { icon: "🔖", label: "Saved Products", value: savedProducts.length, color: "var(--accent)" },
          { icon: "🛒", label: "Amazon Saved", value: amazonSaved, color: "#e65100" },
          { icon: "🏬", label: "Flipkart Saved", value: flipkartSaved, color: "#1565c0" },
          { icon: "📊", label: "Avg Sentiment", value: avgSentiment ? `${avgSentiment}%` : "N/A", color: "#16a34a" },
        ].map((s) => (
          <div key={s.label} style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            padding: "1.25rem",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "24px", marginBottom: "8px" }}>{s.icon}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "24px", fontWeight: "700", color: s.color, marginBottom: "4px" }}>
              {s.value}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "1.25rem" }}>
        {[
          { key: "overview", label: "Overview" },
          { key: "saved", label: `Saved Products (${savedProducts.length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: "8px 20px",
              borderRadius: "99px",
              border: activeTab === tab.key ? "none" : "1px solid var(--border)",
              background: activeTab === tab.key ? "var(--accent)" : "var(--surface)",
              color: activeTab === tab.key ? "white" : "var(--text-secondary)",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "600", marginBottom: "1rem", color: "var(--text-primary)" }}>
              Account Details
            </h3>
            {[
              { label: "Email", value: user.email },
              { label: "User ID", value: user.id.slice(0, 8) + "..." },
              { label: "Joined", value: joinDate },
              { label: "Auth Provider", value: "Email/Password" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: "13px" }}>
                <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{item.value}</span>
              </div>
            ))}
          </div>

          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "15px", fontWeight: "600", marginBottom: "1rem", color: "var(--text-primary)" }}>
              Recent Saved
            </h3>
            {savedProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem 0", color: "var(--text-secondary)", fontSize: "13px" }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🔖</div>
                No saved products yet
                <br />
                <Link href="/" style={{ color: "var(--accent)", fontWeight: "600", textDecoration: "none" }}>
                  Start searching →
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {savedProducts.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", background: "var(--bg)", borderRadius: "8px" }}>
                    {p.product_image && (
                      <img
                        src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(p.product_image)}`}
                        alt={p.product_name}
                        style={{ width: "36px", height: "36px", objectFit: "contain", borderRadius: "6px", background: "white" }}
                      />
                    )}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <p style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.product_name}
                      </p>
                      <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{p.product_price} · {p.platform}</p>
                    </div>
                  </div>
                ))}
                {savedProducts.length > 4 && (
                  <button onClick={() => setActiveTab("saved")} style={{ fontSize: "12px", color: "var(--accent)", fontWeight: "600", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                    View all {savedProducts.length} saved products →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Saved Products Tab */}
      {activeTab === "saved" && (
        <div>
          {savedProducts.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>🔖</div>
              <p className="empty-title">No saved products yet!</p>
              <p className="empty-sub">Search for products and click the bookmark icon to save them.</p>
              <Link href="/" className="back-btn">Start Searching</Link>
            </div>
          ) : (
            <div className="product-grid">
              {savedProducts.map((p) => (
                <div key={p.id} className="product-card">
                  {p.product_image && (
                    <div style={{ width: "100%", height: "140px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f6f2", borderRadius: "10px", marginBottom: "12px", overflow: "hidden" }}>
                      <img
                        src={`https://smart-consumer-backend.onrender.com/image-proxy?url=${encodeURIComponent(p.product_image)}`}
                        alt={p.product_name}
                        style={{ maxHeight: "120px", maxWidth: "80%", objectFit: "contain" }}
                      />
                    </div>
                  )}
                  <span className={`platform-badge ${p.platform === "Amazon" ? "platform-amazon" : "platform-flipkart"}`}>
                    {p.platform}
                  </span>
                  <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", margin: "8px 0", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {p.product_name}
                  </h2>
                  <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--accent)", marginBottom: "10px" }}>{p.product_price}</p>
                  <div className="scores">
                    <div className="score-row">
                      <span className="score-label">Sentiment</span>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${p.sentiment}%`, background: "#2563eb" }} />
                      </div>
                      <span className="score-value">{p.sentiment}%</span>
                    </div>
                    <div className="score-row">
                      <span className="score-label">Trust score</span>
                      <div className="score-bar-track">
                        <div className="score-bar-fill" style={{ width: `${p.trust_score}%`, background: "#16a34a" }} />
                      </div>
                      <span className="score-value">{p.trust_score}%</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px", marginTop: "12px" }}>
                    {p.product_url && (
                      <a href={p.product_url} target="_blank" rel="noopener noreferrer" className="view-btn" style={{ flex: 1, textAlign: "center" }}>
                        View on {p.platform} ↗
                      </a>
                    )}
                    <button className="delete-btn" onClick={() => handleDelete(p.id)} style={{ flex: "none", padding: "8px 12px" }}>
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}