"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <Link href="/" className="navbar-logo">SmartConsumer</Link>
          <div className="navbar-links">
            <Link href="/" className={`navbar-link ${pathname === "/" ? "active" : ""}`}>
              Home
            </Link>

            <div className="nav-dropdown-wrap" onMouseEnter={() => setShowDropdown(true)} onMouseLeave={() => setShowDropdown(false)}>
              <button className={`navbar-link nav-dropdown-btn ${pathname.startsWith("/analysis") ? "active" : ""}`}>
                Analysis ▾
              </button>
              {showDropdown && (
                <div className="nav-dropdown">
                  <Link href="/analysis/sentiment" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                    💬 Sentiment Analysis
                  </Link>
                  <Link href="/analysis/fake" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                    🔍 Fake Review Detection
                  </Link>
                  <Link href="/analysis/price" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                    📈 Price Trends
                  </Link>
                  <Link href="/analysis/image" className="nav-dropdown-item" onClick={() => setShowDropdown(false)}>
                    🖼️ Image Authenticity
                  </Link>
                </div>
              )}
            </div>

            <Link href="/about" className={`navbar-link ${pathname === "/about" ? "active" : ""}`}>
              About
            </Link>
            {user && (
              <Link href="/saved" className={`navbar-link ${pathname === "/saved" ? "active" : ""}`}>
                Saved
              </Link>
            )}
            {user ? (
              <button className="navbar-link logout-btn" onClick={handleLogout}>Logout</button>
            ) : (
              <button className="navbar-btn" onClick={() => setShowAuth(true)}>Login</button>
            )}
          </div>
        </div>
      </nav>
      {showAuth && (
        <AuthModal onClose={() => setShowAuth(false)} onLogin={(u) => setUser(u)} />
      )}
    </>
  );
}