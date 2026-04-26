import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { ReactElement } from "react";

export default function PrivateRoute({ children }: { children: ReactElement }) {
  const token = useAuthStore((s) => s.token);

  // Pas de token → redirige vers /login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Token présent → affiche la page demandée
  return children;
}