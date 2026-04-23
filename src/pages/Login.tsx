import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const setToken = useAuthStore((s) => s.setToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // OAuth2 veut du form-data, pas du JSON
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "2rem" }}>
        <h1>SensorFlow</h1>
        <h2>Connexion</h2>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label><br />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <br />

          <div>
            <label htmlFor="password">Mot de passe</label><br />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <br />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        <p>Pas de compte ? <Link to="/register">S'inscrire</Link></p>
      </div>
    </div>
  );
}