import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios";

export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // JSON cette fois — pas de URLSearchParams
      await api.post("/auth/register", { email, password });
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "2rem" }}>
        <h1>SensorFlow</h1>
        <h2>Créer un compte</h2>

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
            {isLoading ? "Création..." : "S'inscrire"}
          </button>
        </form>

        <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </div>
    </div>
  );
}