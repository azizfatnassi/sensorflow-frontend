import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";
import { useWebSocket } from "../hooks/useWebSocket";

interface User { id: number; email: string; full_name?: string; }
interface Device {
  id: number; name: string; type: string; location: string;
  threshold_min: number | null; threshold_max: number | null; api_key?: string;
}
interface Reading { id: number; value: number; timestamp: string; device_id: number; }
interface Alert {
  id: number; device_id: number; message: string;
  severity: string; resolved: boolean; created_at: string;
}

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .db-root {
    min-height: 100vh;
    background: #0a0a0a;
    font-family: 'Syne', sans-serif;
    color: #fff;
  }

  /* ── NAVBAR ── */
  .db-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    background: #0f0f0f;
    border-bottom: 1px solid #1a1a1a;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .db-nav-brand {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .db-nav-dot {
    width: 8px; height: 8px;
    background: #00ffa3;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }

  .db-nav-name {
    font-size: 0.9rem;
    font-weight: 600;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    font-family: 'DM Mono', monospace;
    color: #fff;
  }

  .db-nav-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .db-nav-user {
    font-size: 0.75rem;
    color: #444;
    font-family: 'DM Mono', monospace;
  }

  .db-nav-user span { color: #00ffa3; }

  .db-logout-btn {
    background: transparent;
    border: 1px solid #222;
    color: #555;
    padding: 0.4rem 1rem;
    border-radius: 5px;
    font-size: 0.75rem;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    transition: all 0.2s;
  }
  .db-logout-btn:hover { border-color: #ff4444; color: #ff4444; }

  /* ── LAYOUT ── */
  .db-body { display: grid; grid-template-columns: 280px 1fr; min-height: calc(100vh - 57px); }

  /* ── SIDEBAR ── */
  .db-sidebar {
    background: #0f0f0f;
    border-right: 1px solid #1a1a1a;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .db-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .db-sidebar-title {
    font-size: 0.65rem;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-family: 'DM Mono', monospace;
  }

  .db-add-btn {
    background: #00ffa3;
    color: #000;
    border: none;
    border-radius: 4px;
    padding: 0.3rem 0.7rem;
    font-size: 0.7rem;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .db-add-btn:hover { opacity: 0.85; }

  .db-device-card {
    background: #141414;
    border: 1px solid #1a1a1a;
    border-radius: 8px;
    padding: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  .db-device-card:hover { border-color: #2a2a2a; background: #161616; }
  .db-device-card.active { border-color: #00ffa3; background: rgba(0,255,163,0.04); }

  .db-device-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #fff;
    margin-bottom: 4px;
  }

  .db-device-meta {
    font-size: 0.7rem;
    color: #444;
    font-family: 'DM Mono', monospace;
  }

  .db-device-type {
    display: inline-block;
    background: #1f1f1f;
    color: #00ffa3;
    font-size: 0.6rem;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }

  .db-empty-devices {
    font-size: 0.75rem;
    color: #2a2a2a;
    font-family: 'DM Mono', monospace;
    text-align: center;
    padding: 2rem 0;
  }

  /* ── CREATE FORM ── */
  .db-create-form {
    background: #111;
    border: 1px solid #1f1f1f;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }

  .db-form-input, .db-form-select {
    width: 100%;
    background: #0a0a0a;
    border: 1px solid #1f1f1f;
    border-radius: 5px;
    padding: 0.6rem 0.75rem;
    font-size: 0.78rem;
    color: #fff;
    font-family: 'DM Mono', monospace;
    outline: none;
    transition: border-color 0.2s;
  }
  .db-form-input:focus, .db-form-select:focus { border-color: #00ffa3; }
  .db-form-input::placeholder { color: #2a2a2a; }
  .db-form-select option { background: #111; }

  .db-form-submit {
    background: #00ffa3;
    color: #000;
    border: none;
    border-radius: 5px;
    padding: 0.6rem;
    font-size: 0.75rem;
    font-weight: 700;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .db-form-submit:hover { opacity: 0.85; }

  /* ── MAIN CONTENT ── */
  .db-main { padding: 2rem; display: flex; flex-direction: column; gap: 2rem; overflow: auto; }

  /* ── API KEY BANNER ── */
  .db-apikey-banner {
    background: rgba(0,255,163,0.05);
    border: 1px solid rgba(0,255,163,0.2);
    border-radius: 8px;
    padding: 1rem 1.25rem;
  }
  .db-apikey-label {
    font-size: 0.7rem;
    color: #00ffa3;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: 'DM Mono', monospace;
    margin-bottom: 0.5rem;
  }
  .db-apikey-code {
    font-family: 'DM Mono', monospace;
    font-size: 0.78rem;
    color: #fff;
    word-break: break-all;
    background: #0a0a0a;
    border-radius: 5px;
    padding: 0.6rem 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #1a1a1a;
  }
  .db-apikey-close {
    background: transparent;
    border: 1px solid #222;
    color: #444;
    padding: 0.3rem 0.75rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    transition: all 0.2s;
  }
  .db-apikey-close:hover { border-color: #444; color: #fff; }

  /* ── SECTION ── */
  .db-section-title {
    font-size: 0.65rem;
    color: #333;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    font-family: 'DM Mono', monospace;
    margin-bottom: 1rem;
  }

  /* ── CHART ── */
  .db-chart-card {
    background: #0f0f0f;
    border: 1px solid #1a1a1a;
    border-radius: 10px;
    padding: 1.5rem;
  }

  .db-chart-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .db-chart-title {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
  }

  .db-chart-badge {
    font-size: 0.65rem;
    color: #00ffa3;
    font-family: 'DM Mono', monospace;
    background: rgba(0,255,163,0.08);
    padding: 3px 8px;
    border-radius: 3px;
  }

  .db-no-data {
    font-size: 0.78rem;
    color: #2a2a2a;
    font-family: 'DM Mono', monospace;
    text-align: center;
    padding: 3rem 0;
  }

  /* ── ALERTS ── */
  .db-alert-item {
    background: #0f0f0f;
    border: 1px solid #1a1a1a;
    border-radius: 8px;
    padding: 1rem 1.25rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    transition: opacity 0.2s;
  }
  .db-alert-item.resolved { opacity: 0.35; }
  .db-alert-item.critical { border-left: 3px solid #ff4444; }
  .db-alert-item.warning { border-left: 3px solid #ffd700; }

  .db-alert-msg {
    font-size: 0.85rem;
    color: #ccc;
    margin-bottom: 4px;
  }

  .db-alert-meta {
    font-size: 0.68rem;
    color: #333;
    font-family: 'DM Mono', monospace;
  }

  .db-severity-badge {
    font-size: 0.6rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-family: 'DM Mono', monospace;
    padding: 2px 7px;
    border-radius: 3px;
    font-weight: 600;
  }
  .db-severity-badge.critical { background: rgba(255,68,68,0.12); color: #ff4444; }
  .db-severity-badge.warning { background: rgba(255,215,0,0.1); color: #ffd700; }

  .db-resolve-btn {
    background: transparent;
    border: 1px solid #222;
    color: #444;
    padding: 0.35rem 0.75rem;
    border-radius: 4px;
    font-size: 0.7rem;
    font-family: 'DM Mono', monospace;
    cursor: pointer;
    white-space: nowrap;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .db-resolve-btn:hover { border-color: #00ffa3; color: #00ffa3; }

  .db-alerts-list { display: flex; flex-direction: column; gap: 0.6rem; }

  /* Tooltip */
  .recharts-tooltip-wrapper { font-family: 'DM Mono', monospace !important; }
`;

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [showCreateDevice, setShowCreateDevice] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: "", device_type: "temperature", unit: "°C",
    location: "", threshold_min: "", threshold_max: "",
  });
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => { toast.error("Session expirée"); logout(); navigate("/login"); });
  }, []);

  const fetchDevices = useCallback(async () => {
    try { const { data } = await api.get("/devices"); setDevices(data); }
    catch { toast.error("Erreur chargement devices"); }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  const fetchAlerts = useCallback(async () => {
    try { const { data } = await api.get("/alerts"); setAlerts(data.items ?? data); }
    catch { toast.error("Erreur chargement alertes"); }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  useEffect(() => {
    if (!selectedDevice) return;
    api.get(`/devices/${selectedDevice.id}/readings`)
      .then((res) => setReadings(res.data.items ?? res.data))
      .catch(() => toast.error("Erreur chargement readings"));
  }, [selectedDevice]);

  useWebSocket((msg) => {
    if (msg.type === "new_reading") {
      if (selectedDevice && msg.data.device_id === selectedDevice.id)
        setReadings((prev) => [...prev, msg.data]);
      toast.success(`New reading: ${msg.data.value}`);
    }
    if (msg.type === "new_alert") {
      setAlerts((prev) => [msg.data, ...prev]);
      toast.error(`Alert: ${msg.data.message}`);
    }
  });

  const handleCreateDevice = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/devices", {
        name: newDevice.name,
        device_type: newDevice.device_type,
        unit: newDevice.unit,
        location: newDevice.location,
        threshold_min: newDevice.threshold_min ? Number(newDevice.threshold_min) : null,
        threshold_max: newDevice.threshold_max ? Number(newDevice.threshold_max) : null,
      });
      setNewApiKey(data.api_key);
      setShowCreateDevice(false);
      setNewDevice({ name: "", device_type: "temperature", unit: "°C", location: "", threshold_min: "", threshold_max: "" });
      fetchDevices();
      toast.success("Device created!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail ?? "Error creating device");
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`);
      setAlerts((prev) => prev.map((a) => a.id === alertId ? { ...a, resolved: true } : a));
      toast.success("Alert resolved");
    } catch { toast.error("Error resolving alert"); }
  };

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleTimeString(),
    value: r.value,
  }));

  const activeAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <>
      <style>{STYLES}</style>
      <div className="db-root">

        {/* ── NAVBAR ── */}
        <nav className="db-nav">
          <div className="db-nav-brand">
            <div className="db-nav-dot" />
            <span className="db-nav-name">SensorFlow</span>
          </div>
          <div className="db-nav-right">
            {user && (
              <span className="db-nav-user">
                logged in as <span>{user.email}</span>
              </span>
            )}
            <button className="db-logout-btn" onClick={() => { logout(); navigate("/login"); }}>
              Sign out
            </button>
          </div>
        </nav>

        <div className="db-body">

          {/* ── SIDEBAR ── */}
          <aside className="db-sidebar">
            <div className="db-sidebar-header">
              <span className="db-sidebar-title">Devices ({devices.length})</span>
              <button className="db-add-btn" onClick={() => setShowCreateDevice(!showCreateDevice)}>
                {showCreateDevice ? "✕" : "+ Add"}
              </button>
            </div>

            {showCreateDevice && (
              <form className="db-create-form" onSubmit={handleCreateDevice}>
                <input className="db-form-input" placeholder="Device name" value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })} required />
                <select className="db-form-select" value={newDevice.device_type}
                  onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}>
                  <option value="temperature">Temperature</option>
                  <option value="humidity">Humidity</option>
                  <option value="co2">CO2</option>
                  <option value="pressure">Pressure</option>
                </select>
                <input className="db-form-input" placeholder="Unit (e.g. °C)" value={newDevice.unit}
                  onChange={(e) => setNewDevice({ ...newDevice, unit: e.target.value })} required />
                <input className="db-form-input" placeholder="Location" value={newDevice.location}
                  onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })} />
                <input className="db-form-input" placeholder="Min threshold" type="number"
                  value={newDevice.threshold_min}
                  onChange={(e) => setNewDevice({ ...newDevice, threshold_min: e.target.value })} />
                <input className="db-form-input" placeholder="Max threshold" type="number"
                  value={newDevice.threshold_max}
                  onChange={(e) => setNewDevice({ ...newDevice, threshold_max: e.target.value })} />
                <button className="db-form-submit" type="submit">Create device</button>
              </form>
            )}

            {devices.length === 0 && !showCreateDevice && (
              <p className="db-empty-devices">No devices yet.<br />Click + Add to start.</p>
            )}

            {devices.map((device) => (
              <div key={device.id}
                className={`db-device-card ${selectedDevice?.id === device.id ? "active" : ""}`}
                onClick={() => setSelectedDevice(device)}>
                <div className="db-device-type">{device.type || "sensor"}</div>
                <div className="db-device-name">{device.name}</div>
                {device.location && (
                  <div className="db-device-meta">📍 {device.location}</div>
                )}
              </div>
            ))}
          </aside>

          {/* ── MAIN ── */}
          <main className="db-main">

            {/* API Key Banner */}
            {newApiKey && (
              <div className="db-apikey-banner">
                <div className="db-apikey-label">⚠ API Key — visible once, copy it now</div>
                <div className="db-apikey-code">{newApiKey}</div>
                <button className="db-apikey-close" onClick={() => setNewApiKey(null)}>
                  I've copied it — close
                </button>
              </div>
            )}

            {/* Chart */}
            <div className="db-chart-card">
              <div className="db-chart-header">
                <div className="db-chart-title">
                  {selectedDevice ? `Readings — ${selectedDevice.name}` : "Select a device"}
                </div>
                {selectedDevice && (
                  <span className="db-chart-badge">LIVE</span>
                )}
              </div>

              {!selectedDevice && (
                <p className="db-no-data">← Select a device from the sidebar to view readings</p>
              )}

              {selectedDevice && readings.length === 0 && (
                <p className="db-no-data">No readings yet for this device</p>
              )}

              {selectedDevice && readings.length > 0 && (
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
                    <XAxis dataKey="time" tick={{ fill: "#333", fontSize: 11, fontFamily: "DM Mono" }} />
                    <YAxis tick={{ fill: "#333", fontSize: 11, fontFamily: "DM Mono" }} />
                    <Tooltip
                      contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: 6, fontFamily: "DM Mono", fontSize: 12 }}
                      labelStyle={{ color: "#555" }}
                      itemStyle={{ color: "#00ffa3" }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#00ffa3" dot={false} strokeWidth={2} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Alerts */}
            <div>
              <div className="db-section-title">
                Alerts {activeAlerts > 0 && `— ${activeAlerts} active`}
              </div>

              {alerts.length === 0 && (
                <p className="db-no-data" style={{ padding: "1rem 0" }}>No alerts. All systems nominal.</p>
              )}

              <div className="db-alerts-list">
                {alerts.map((alert) => (
                  <div key={alert.id}
                    className={`db-alert-item ${alert.severity} ${alert.resolved ? "resolved" : ""}`}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                        <span className={`db-severity-badge ${alert.severity}`}>{alert.severity}</span>
                        {alert.resolved && <span style={{ fontSize: "0.65rem", color: "#333", fontFamily: "DM Mono" }}>resolved</span>}
                      </div>
                      <div className="db-alert-msg">{alert.message}</div>
                      <div className="db-alert-meta">{new Date(alert.created_at).toLocaleString()}</div>
                    </div>
                    {!alert.resolved && (
                      <button className="db-resolve-btn" onClick={() => handleResolveAlert(alert.id)}>
                        Resolve
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </main>
        </div>
      </div>
    </>
  );
}
