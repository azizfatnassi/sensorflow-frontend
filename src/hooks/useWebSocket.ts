import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";

interface WSMessage {
  type: "new_reading" | "new_alert";
  data: any;
}

export function useWebSocket(onMessage: (msg: WSMessage) => void) {
  const token = useAuthStore((s) => s.token);

  // useRef garde une référence stable au callback
  // sans ça, le WebSocket verrait toujours l'ancienne version de onMessage
  const onMessageRef = useRef(onMessage);
  useEffect(() => {
    onMessageRef.current = onMessage;
  });

  useEffect(() => {
    if (!token) return;

    // Le backend attend le JWT en query param (pas en header — limitation du protocol WS)
    const ws = new WebSocket(`ws://localhost:8000/ws?token=${token}`);

    ws.onopen    = () => console.log("WebSocket connecté");
    ws.onclose   = () => console.log("WebSocket fermé");
    ws.onerror   = (err) => console.error("WebSocket erreur", err);

    ws.onmessage = (event) => {
      const msg: WSMessage = JSON.parse(event.data);
      onMessageRef.current(msg); // appelle le callback avec le message reçu
    };

    // Cleanup : ferme la connexion quand le composant est démonté
    return () => ws.close();

  }, [token]); // se reconnecte si le token change
}