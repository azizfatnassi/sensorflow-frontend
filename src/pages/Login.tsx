import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const { data } = await api.post("/auth/token", formData);
      setToken(data.access_token);
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? "Identifiants incorrects";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Syne', sans-serif;
        }

        /* Left panel */
        .login-left {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: #0f0f0f;
          border-right: 1px solid #1f1f1f;
          overflow: hidden;
        }

        .login-left::after {
          content: '';
          position: absolute;
          bottom: -150px;
          right: -150px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0,255,163,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-left-inner {
          width: 100%;
          max-width: 340px;
        }

        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 3rem;
        }

        .login-brand-dot {
          width: 10px;
          height: 10px;
          background: #00ffa3;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        .login-brand-name {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        .login-form-title {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .login-form-sub {
          font-size: 0.82rem;
          color: #444;
          font-family: 'DM Mono', monospace;
          margin-bottom: 2.5rem;
        }

        .login-field {
          margin-bottom: 1.25rem;
        }

        .login-label {
          display: block;
          font-size: 0.7rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: 'DM Mono', monospace;
          margin-bottom: 0.5rem;
        }

        .login-input {
          width: 100%;
          background: #111;
          border: 1px solid #222;
          border-radius: 6px;
          padding: 0.8rem 1rem;
          font-size: 0.9rem;
          color: #fff;
          font-family: 'DM Mono', monospace;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .login-input:focus {
          border-color: #00ffa3;
          box-shadow: 0 0 0 3px rgba(0,255,163,0.06);
        }

        .login-input::placeholder { color: #333; }

        .login-btn {
          width: 100%;
          background: #00ffa3;
          color: #000;
          border: none;
          border-radius: 6px;
          padding: 0.85rem;
          font-size: 0.85rem;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: opacity 0.2s, transform 0.1s;
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .login-divider-line { flex: 1; height: 1px; background: #1f1f1f; }

        .login-divider-text {
          font-size: 0.7rem;
          color: #333;
          font-family: 'DM Mono', monospace;
        }

        .login-link {
          text-align: center;
          font-size: 0.8rem;
          color: #444;
          font-family: 'DM Mono', monospace;
        }

        .login-link a { color: #00ffa3; text-decoration: none; }

        /* Right panel — decorative */
        .login-right {
          position: relative;
          background: #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: 3rem;
        }

        .login-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,163,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,163,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .login-terminal {
          position: relative;
          background: #0f0f0f;
          border: 1px solid #1f1f1f;
          border-radius: 10px;
          width: 100%;
          max-width: 380px;
          overflow: hidden;
          box-shadow: 0 0 60px rgba(0,255,163,0.04);
        }

        .login-terminal-bar {
          background: #141414;
          border-bottom: 1px solid #1f1f1f;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .login-terminal-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .login-terminal-body {
          padding: 1.5rem;
          font-family: 'DM Mono', monospace;
          font-size: 0.78rem;
          line-height: 1.8;
        }

        .t-dim { color: #333; }
        .t-green { color: #00ffa3; }
        .t-yellow { color: #ffd700; }
        .t-white { color: #888; }
        .t-cursor {
          display: inline-block;
          width: 7px;
          height: 13px;
          background: #00ffa3;
          animation: blink 1s infinite;
          vertical-align: middle;
          margin-left: 2px;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .login-right { display: none; }
        }
      `}</style>

      <div className="login-root">
        {/* Left — Form */}
        <div className="login-left">
          <div className="login-left-inner">
            <div className="login-brand">
              <div className="login-brand-dot" />
              <span className="login-brand-name">SensorFlow</span>
            </div>

            <h1 className="login-form-title">Welcome back</h1>
            <p className="login-form-sub">Sign in to your monitoring dashboard</p>

            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label">Email address</label>
                <input
                  className="login-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="login-field">
                <label className="login-label">Password</label>
                <input
                  className="login-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <button className="login-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign in →"}
              </button>
            </form>

            <div className="login-divider">
              <div className="login-divider-line" />
              <span className="login-divider-text">no account yet?</span>
              <div className="login-divider-line" />
            </div>

            <p className="login-link">
              <Link to="/register">Create an account</Link>
            </p>
          </div>
        </div>

        {/* Right — Decorative terminal */}
        <div className="login-right">
          <div className="login-grid" />
          <div className="login-terminal">
            <div className="login-terminal-bar">
              <div className="login-terminal-dot" style={{ background: "#ff5f57" }} />
              <div className="login-terminal-dot" style={{ background: "#febc2e" }} />
              <div className="login-terminal-dot" style={{ background: "#28c840" }} />
            </div>
            <div className="login-terminal-body">
              <div><span className="t-dim">$</span> <span className="t-green">sensorflow</span> <span className="t-white">status</span></div>
              <div className="t-dim">───────────────────────</div>
              <div><span className="t-dim">●</span> <span className="t-white">devices online</span> <span className="t-green">12</span></div>
              <div><span className="t-dim">●</span> <span className="t-white">alerts active</span> <span className="t-yellow">3</span></div>
              <div><span className="t-dim">●</span> <span className="t-white">readings/min</span> <span className="t-green">247</span></div>
              <div><span className="t-dim">●</span> <span className="t-white">websocket</span> <span className="t-green">connected</span></div>
              <div className="t-dim">───────────────────────</div>
              <div><span className="t-dim">$</span> <span className="t-white">waiting for auth</span><span className="t-cursor" /></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
