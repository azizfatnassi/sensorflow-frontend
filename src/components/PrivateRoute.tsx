import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAuthStore((s) => s.token);

  // Pas de token → redirige vers /login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Token présent → affiche la page demandée
  return children;
}