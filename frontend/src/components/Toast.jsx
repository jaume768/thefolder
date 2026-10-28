import { Check, X, Info } from "lucide-react";
import "./css/Toast.css";

// Aviso de éxito/error/info compartido — sustituye a las implementaciones
// sueltas (.guardados-notification, .op-notification, .notification,
// .user-extern-notification) que cada página tenía por su cuenta. Acepta
// directamente el shape de estado que ya usaban: { show, message, type }.
export default function Toast({ notification }) {
  if (!notification?.show) return null;

  const type = notification.type || "info";

  return (
    <div className={`app-toast app-toast--${type}`} role="status">
      <span className="app-toast-icon">
        {type === "success" ? (
          <Check size={14} strokeWidth={2.5} aria-hidden="true" />
        ) : type === "error" ? (
          <X size={14} strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Info size={14} strokeWidth={2} aria-hidden="true" />
        )}
      </span>
      <p className="app-toast-message">{notification.message}</p>
    </div>
  );
}
