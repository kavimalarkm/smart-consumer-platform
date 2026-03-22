"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function AuthModal({ onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    setLoading(true);
    setError("");
    setMessage("");

    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else {
        onLogin(data.user);
        onClose();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setMessage("Check your email to confirm your account!");
    }
    setLoading(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{isLogin ? "Login" : "Sign Up"}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
          />

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-message">{message}</p>}

          <button className="auth-submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>

          <p className="auth-switch">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button className="auth-switch-btn" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? " Sign Up" : " Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}