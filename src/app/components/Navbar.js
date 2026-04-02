"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AuthModal from "./AuthModal";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMobileOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">
            <span style={{ color: "var(--accent)" }}>Smart</span>Consumer
          </Link>

          {/* Desktop links */}
          <div className="navbar-links navbar-desktop">
            <Link href="/" className={`navbar-link ${pathname === "/" ? "active" : ""}`}>Home</Link>
            <div className="nav-dropdown-wrap" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
              <button className={`navbar-link nav-dropdown-btn ${pathname.startsWith("/analysis") ? "active" : ""}`}>
                Analysis ▾
              </button>
              {showDropdown && (
                <div className="nav-dropdown">
                  <Link href="/analysis/sentiment" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>💬 Sentiment Analysis</Link>
                  <Link href="/analysis/fake" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>🔍 Fake Review Detection</Link>
                  <Link href="/analysis/price" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>📈 Price Trends</Link>
                  <Link href="/analysis/image" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>🖼️ Image Authenticity</Link>
                </div>
              )}
            </div>
            <Link href="/about" className={`navbar-link ${pathname === "/about" ? "active" : ""}`}>About</Link>
            <Link href="/saved" className={`navbar-link ${pathname === "/saved" ? "active" : ""}`}>🔖 Saved</Link>
            {user && <Link href="/profile" className={`navbar-link ${pathname === "/profile" ? "active" : ""}`}>👤 Profile</Link>}
            {user ? (
              <button className="navbar-link logout-btn" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="navbar-btn" onClick={() => setShowAuth(true)}>Login</button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="mobile-menu">
            <Link href="/" className="mobile-link" onClick={() => setMobileOpen(false)}>🏠 Home</Link>
            <Link href="/analysis/sentiment" className="mobile-link" onClick={() => setMobileOpen(false)}>💬 Sentiment Analysis</Link>
            <Link href="/analysis/fake" className="mobile-link" onClick={() => setMobileOpen(false)}>🔍 Fake Review Detection</Link>
            <Link href="/analysis/price" className="mobile-link" onClick={() => setMobileOpen(false)}>📈 Price Trends</Link>
            <Link href="/analysis/image" className="mobile-link" onClick={() => setMobileOpen(false)}>🖼️ Image Authenticity</Link>
            <Link href="/about" className="mobile-link" onClick={() => setMobileOpen(false)}>ℹ️ About</Link>
            <Link href="/saved" className="mobile-link" onClick={() => setMobileOpen(false)}>🔖 Saved</Link>
            {user && <Link href="/profile" className="mobile-link" onClick={() => setMobileOpen(false)}>👤 Profile</Link>}
            {user ? (
              <button className="mobile-link mobile-logout" onClick={handleLogout}>🚪 Logout</button>
            ) : (
              <button className="mobile-link mobile-login" onClick={() => { setShowAuth(true); setMobileOpen(false); }}>🔑 Login</button>
            )}
          </div>
        )}
      </nav>

      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLogin={(u) => { setUser(u); setShowAuth(false); }} />
      )}
    </>
  );
}