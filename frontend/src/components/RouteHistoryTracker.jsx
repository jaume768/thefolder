import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { recordRouteChange } from "../utils/lastVisitedRoute";

// Sin JSX propio — mismo patrón que RouteTitle.jsx (montado una vez en
// App.jsx, solo reacciona a cambios de ruta). Ver lastVisitedRoute.js.
export default function RouteHistoryTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    recordRouteChange(pathname);
  }, [pathname]);

  return null;
}
