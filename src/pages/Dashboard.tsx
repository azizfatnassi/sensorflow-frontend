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

// ── TYPES ──────────────────────────────────────────────
interface User {
  id: number;
  email: string;
}

interface Device {
  id: number;
  name: string;
  type: string;
  location: string;
  threshold_min: number | null;
  threshold_max: number | null;
  api_key?: string;
}

interface Reading {
  id: number;
  value: number;
  timestamp: string;
  device_id: number;
}

interface Alert {
  id: number;
  device_id: number;
  message: string;
  severity: string;
  resolved: boolean;
  created_at: string;
}

// ── COMPOSANT ──────────────────────────────────────────
export default function Dashboard() {

  // — User —
  const [user, setUser] = useState<User | null>(null);

  // — Devices —
  const [devices, setDevices]               = useState<Device[]>([]);
  const [showCreateDevice, setShowCreateDevice] = useState(false);
  const [newApiKey, setNewApiKey]           = useState<string | null>(null);
  const [newDevice, setNewDevice] = useState({
    name: "", type: "temperature",
    location: "", threshold_min: "", threshold_max: "",
  });

  // — Readings —
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [readings, setReadings]             = useState<Reading[]>([]);

  // — Alerts —
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const navigate = useNavigate();
  const logout   = useAuthStore((s) => s.logout);

  // ── FETCH USER ──────────────────────────────────────
  useEffect(() => {
    api.get("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => {
        toast.error("Session expirée");
        logout();
        navigate("/login");
      });
  }, []);

  // ── FETCH DEVICES ───────────────────────────────────
  const fetchDevices = useCallback(async () => {
    try {
      const { data } = await api.get("/devices");
      setDevices(data);
    } catch {
      toast.error("Erreur chargement devices");
    }
  }, []);

  useEffect(() => { fetchDevices(); }, [fetchDevices]);

  // ── FETCH ALERTS ────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    try {
      const { data } = await api.get("/alerts");
      // Le backend retourne soit {items: [...]} soit directement un tableau
      setAlerts(data.items ?? data);
    } catch {
      toast.error("Erreur chargement alertes");
    }
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  // ── FETCH READINGS (quand on clique sur un device) ──
  useEffect(() => {
    if (!selectedDevice) return;
    api.get(`/devices/${selectedDevice.id}/readings`)
      .then((res) => setReadings(res.data.items ?? res.data))
      .catch(() => toast.error("Erreur chargement readings"));
  }, [selectedDevice]);

  // ── WEBSOCKET ────────────────────────────────────────
  // Ce hook reçoit chaque message en temps réel
  useWebSocket((msg) => {
    if (msg.type === "new_reading") {
      // Ajoute la lecture au graphique si c'est le device sélectionné
      if (selectedDevice && msg.data.device_id === selectedDevice.id) {
        setReadings((prev) => [...prev, msg.data]);
      }
      toast.success(`Nouvelle lecture : ${msg.data.value}`);
    }

    if (msg.type === "new_alert") {
      // Ajoute l'alerte en haut de la liste
      setAlerts((prev) => [msg.data, ...prev]);
      toast.error(`Alerte : ${msg.data.message}`);
    }
  });

  // ── CRÉER UN DEVICE ──────────────────────────────────
  const handleCreateDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/devices", {
        name:          newDevice.name,
        type:          newDevice.type,
        location:      newDevice.location,
        threshold_min: newDevice.threshold_min ? Number(newDevice.threshold_min) : null,
        threshold_max: newDevice.threshold_max ? Number(newDevice.threshold_max) : null,
      });

      // La clé API n'est visible qu'une seule fois — on la stocke temporairement
      setNewApiKey(data.api_key);
      setShowCreateDevice(false);
      setNewDevice({ name: "", type: "temperature", location: "", threshold_min: "", threshold_max: "" });
      fetchDevices();
      toast.success("Device créé !");
    } catch (err: any) {
      toast.error(err.response?.data?.detail ?? "Erreur création device");
    }
  };

  // ── RÉSOUDRE UNE ALERTE ──────────────────────────────
  const handleResolveAlert = async (alertId: number) => {
    try {
      await api.patch(`/alerts/${alertId}/resolve`);
      // Mise à jour locale sans re-fetcher tout
      setAlerts((prev) =>
        prev.map((a) => a.id === alertId ? { ...a, resolved: true } : a)
      );
      toast.success("Alerte résolue");
    } catch {
      toast.error("Erreur résolution alerte");
    }
  };

  // ── LOGOUT ───────────────────────────────────────────
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ── DONNÉES GRAPHIQUE ────────────────────────────────
  const chartData = readings.map((r) => ({
    time:  new Date(r.timestamp).toLocaleTimeString(),
    value: r.value,
  }));

  // ── RENDU ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem" }}>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ margin: 0 }}>SensorFlow</h1>
          {user && (
            <p style={{ margin: 0, color: "#666" }}>Connecté : {user.email}</p>
          )}
        </div>
        <button onClick={handleLogout}>Se déconnecter</button>
      </div>

      {/* ── API KEY — visible une seule fois ── */}
      {newApiKey && (
        <div style={{
          background: "#fffbea", border: "1px solid #f0c040",
          borderRadius: 8, padding: "1rem", marginBottom: "1.5rem"
        }}>
          <strong>Clé API (visible une seule fois — copie-la maintenant) :</strong>
          <code style={{ display: "block", marginTop: 8, wordBreak: "break-all" }}>
            {newApiKey}
          </code>
          <button onClick={() => setNewApiKey(null)} style={{ marginTop: 8 }}>
            J'ai copié, fermer
          </button>
        </div>
      )}

      {/* ── DEVICES ── */}
      <section style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2>Mes Devices</h2>
          <button onClick={() => setShowCreateDevice(!showCreateDevice)}>
            {showCreateDevice ? "Annuler" : "+ Ajouter un device"}
          </button>
        </div>

        {/* Formulaire création */}
        {showCreateDevice && (
          <form onSubmit={handleCreateDevice} style={{
            border: "1px solid #eee", borderRadius: 8,
            padding: "1rem", marginBottom: "1rem"
          }}>
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <input
                placeholder="Nom du device"
                value={newDevice.name}
                onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                required
              />
              <select
                value={newDevice.type}
                onChange={(e) => setNewDevice({ ...newDevice, type: e.target.value })}
              >
                <option value="temperature">Température</option>
                <option value="humidity">Humidité</option>
                <option value="co2">CO2</option>
                <option value="pressure">Pression</option>
              </select>
              <input
                placeholder="Localisation"
                value={newDevice.location}
                onChange={(e) => setNewDevice({ ...newDevice, location: e.target.value })}
              />
              <input
                placeholder="Seuil minimum (optionnel)"
                type="number"
                value={newDevice.threshold_min}
                onChange={(e) => setNewDevice({ ...newDevice, threshold_min: e.target.value })}
              />
              <input
                placeholder="Seuil maximum (optionnel)"
                type="number"
                value={newDevice.threshold_max}
                onChange={(e) => setNewDevice({ ...newDevice, threshold_max: e.target.value })}
              />
              <button type="submit">Créer</button>
            </div>
          </form>
        )}

        {/* Liste des devices */}
        {devices.length === 0 ? (
          <p style={{ color: "#888" }}>Aucun device. Crée-en un !</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device)}
                style={{
                  border: selectedDevice?.id === device.id
                    ? "2px solid #4f46e5"
                    : "1px solid #eee",
                  borderRadius: 8, padding: "1rem", cursor: "pointer",
                }}
              >
                <strong>{device.name}</strong> — {device.type}
                {device.location && (
                  <span style={{ marginLeft: 8, color: "#888", fontSize: 13 }}>
                    📍 {device.location}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── READINGS CHART ── */}
      {selectedDevice && (
        <section style={{ marginBottom: "2rem" }}>
          <h2>Readings — {selectedDevice.name}</h2>
          {readings.length === 0 ? (
            <p style={{ color: "#888" }}>Aucune donnée pour ce device.</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4f46e5"
                  dot={false}
                  isAnimationActive={false} // désactivé pour le temps réel
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>
      )}

      {/* ── ALERTS ── */}
      <section>
        <h2>Alertes</h2>
        {alerts.length === 0 ? (
          <p style={{ color: "#888" }}>Aucune alerte.</p>
        ) : (
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{
                  border: `1px solid ${alert.severity === "critical" ? "#f87171" : "#fbbf24"}`,
                  borderRadius: 8, padding: "1rem",
                  opacity: alert.resolved ? 0.5 : 1,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{alert.message}</strong>
                    <p style={{ margin: "4px 0 0", fontSize: 13, color: "#888" }}>
                      {new Date(alert.created_at).toLocaleString()} — {alert.severity}
                      {alert.resolved && " — ✓ Résolue"}
                    </p>
                  </div>
                  {!alert.resolved && (
                    <button onClick={() => handleResolveAlert(alert.id)}>
                      Résoudre
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}