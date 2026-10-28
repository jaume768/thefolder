import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initVisitTracking, trackPageView } from "../utils/visitTracking";

// Sin JSX propio — mismo patrón que RouteHistoryTracker.jsx. Dispara el
// ping de visita + el heartbeat de tiempo-en-la-web (ver
// utils/visitTracking.js) una sola vez, sin importar si hay sesión iniciada,
// y una página vista anónima en cada cambio de ruta.
export default function VisitTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    initVisitTracking();
  }, []);

  useEffect(() => {
    trackPageView(pathname);
  }, [pathname]);

  return null;
}
