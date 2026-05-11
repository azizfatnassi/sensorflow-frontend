import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post("/auth/register", {
        email,
        password,
        full_name: fullName,
      });
      toast.success("Compte créé ! Connecte-toi.");
      navigate("/login");
    } catch (err: any) {
      const msg = err.response?.data?.detail ?? "Erreur lors de l'inscription";
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

        .reg-root {
          min-height: 100vh;
          background: #0a0a0a;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: 'Syne', sans-serif;
        }

        /* Left panel */
        .reg-left {
          position: relative;
          background: #0f0f0f;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 3rem;
          border-right: 1px solid #1f1f1f;
          overflow: hidden;
        }

        .reg-left::before {
          content: '';
          position: absolute;
          top: -200px;
          left: -200px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,255,163,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .reg-brand-dot {
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

        .reg-brand-name {
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'DM Mono', monospace;
        }

        .reg-left-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 2rem 0;
        }

        .reg-tagline {
          font-size: 2.8rem;
          font-weight: 700;
          color: #fff;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .reg-tagline span {
          color: #00ffa3;
        }

        .reg-desc {
          font-size: 0.95rem;
          color: #555;
          line-height: 1.7;
          max-width: 320px;
          font-family: 'DM Mono', monospace;
        }

        .reg-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 3rem;
        }

        .reg-stat {
          background: #141414;
          border: 1px solid #1f1f1f;
          border-radius: 8px;
          padding: 1rem;
        }

        .reg-stat-num {
          font-size: 1.5rem;
          font-weight: 700;
          color: #00ffa3;
          font-family: 'DM Mono', monospace;
        }

        .reg-stat-label {
          font-size: 0.7rem;
          color: #444;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-top: 4px;
        }

        .reg-left-footer {
          font-size: 0.75rem;
          color: #2a2a2a;
          font-family: 'DM Mono', monospace;
        }

        /* Right panel */
        .reg-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: #0a0a0a;
        }

        .reg-form-container {
          width: 100%;
          max-width: 380px;
        }

        .reg-form-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .reg-form-sub {
          font-size: 0.85rem;
          color: #444;
          font-family: 'DM Mono', monospace;
          margin-bottom: 2.5rem;
        }

        .reg-field {
          margin-bottom: 1.25rem;
        }

        .reg-label {
          display: block;
          font-size: 0.7rem;
          color: #555;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-family: 'DM Mono', monospace;
          margin-bottom: 0.5rem;
        }

        .reg-input {
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

        .reg-input:focus {
          border-color: #00ffa3;
          box-shadow: 0 0 0 3px rgba(0,255,163,0.06);
        }

        .reg-input::placeholder {
          color: #333;
        }

        .reg-btn {
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

        .reg-btn:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .reg-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .reg-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.8rem;
          color: #444;
          font-family: 'DM Mono', monospace;
        }

        .reg-link a {
          color: #00ffa3;
          text-decoration: none;
        }

        .reg-divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .reg-divider-line {
          flex: 1;
          height: 1px;
          background: #1f1f1f;
        }

        .reg-divider-text {
          font-size: 0.7rem;
          color: #333;
          font-family: 'DM Mono', monospace;
        }

        @media (max-width: 768px) {
          .reg-root { grid-template-columns: 1fr; }
          .reg-left { display: none; }
        }
      `}</style>

      <div className="reg-root">
        {/* Left Panel */}
        <div className="reg-left">
          <div className="reg-brand">
            <div className="reg-brand-dot" />
            <span className="reg-brand-name">SensorFlow</span>
          </div>

          <div className="reg-left-content">
            <h2 className="reg-tagline">
              Monitor your<br />
              devices in<br />
              <span>real-time.</span>
            </h2>
            <p className="reg-desc">
              Connect sensors, track readings,<br />
              get instant alerts when thresholds<br />
              are exceeded.
            </p>

            <div className="reg-stats">
              <div className="reg-stat">
                <div className="reg-stat-num">∞</div>
                <div className="reg-stat-label">Devices</div>
              </div>
              <div className="reg-stat">
                <div className="reg-stat-num">WS</div>
                <div className="reg-stat-label">Real-time</div>
              </div>
              <div className="reg-stat">
                <div className="reg-stat-num">JWT</div>
                <div className="reg-stat-label">Secured</div>
              </div>
              <div className="reg-stat">
                <div className="reg-stat-num">CSV</div>
                <div className="reg-stat-label">Export</div>
              </div>
            </div>
          </div>

          <div className="reg-left-footer">v1.0.0 — IoT Monitoring Platform</div>
        </div>

        {/* Right Panel */}
        <div className="reg-right">
          <div className="reg-form-container">
            <h1 className="reg-form-title">Create account</h1>
            <p className="reg-form-sub">Start monitoring your IoT devices</p>

            <form onSubmit={handleSubmit}>
              <div className="reg-field">
                <label className="reg-label">Full name</label>
                <input
                  className="reg-input"
                  type="text"
                  placeholder="Yassine Fatnassi"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="reg-field">
                <label className="reg-label">Email address</label>
                <input
                  className="reg-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="reg-field">
                <label className="reg-label">Password</label>
                <input
                  className="reg-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button className="reg-btn" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Create account →"}
              </button>
            </form>

            <div className="reg-divider">
              <div className="reg-divider-line" />
              <span className="reg-divider-text">already have an account?</span>
              <div className="reg-divider-line" />
            </div>

            <p className="reg-link">
              <Link to="/login">Sign in instead</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
