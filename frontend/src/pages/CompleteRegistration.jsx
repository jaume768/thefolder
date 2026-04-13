import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./css/complete-registration.css";

const CompleteRegistration = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userLoaded, setUserLoaded] = useState(false);
  const [error, setError] = useState("");

  const [username, setUsername] = useState("");
  const [checking, setChecking] = useState(false);
  const [isTaken, setIsTaken] = useState(false);

  const inputRef = useRef(null);

  // =========================
  // (mantengo esto por si vienes de Google callback con ?token=...)
  // =========================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("authToken", token);
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  // =========================
  // Espera a que el usuario exista / perfil accesible
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${backendUrl}/api/users/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data?.username) setUsername(data.username);

          setUserLoaded(true);
          clearInterval(intervalId);
        }
      } catch (err) {
      }
    }, 500);

    return () => clearInterval(intervalId);
  }, [backendUrl]);

  // =========================
  // Normalización + bloqueo de espacios
  // - sin espacios
  // - trim
  // - opcional: minúsculas
  // =========================
  const normalizeUsername = (value) => {
    const noSpaces = value.replace(/\s+/g, "");
    return noSpaces.toLowerCase();
  };

  // =========================
  // Validación local (sin servidor)
  // =========================
  const localValidationError = useMemo(() => {
    const v = username.trim();
    if (!v) return "Escribe un nombre de usuario.";
    if (v.length > 20) return "Máximo 20 caracteres.";
    if (!/^[a-z0-9._-]+$/.test(v)) return "Usa solo letras, números y . _ -";
    return "";
  }, [username]);

  // =========================
  // Check disponibilidad (con debounce) -> AUTOMÁTICO AL ESCRIBIR
  // Requiere endpoint:
  // GET  /api/users/check-username?username=...
  // Devuelve: { available: true/false }
  // =========================
    useEffect(() => {
    const v = username.trim();

    setError("");

    if (!v || localValidationError) {
        setIsTaken(false);
        setChecking(false);
        return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
        setIsTaken(false);
        setChecking(false);
        return;
    }

    const controller = new AbortController();

    const timeout = setTimeout(async () => {
        setChecking(true);

        try {
        const res = await fetch(
            `${backendUrl}/api/users/check-username?username=${encodeURIComponent(v)}`,
            {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal,
            }
        );

        if (!res.ok) {
            setIsTaken(false);
            setChecking(false);
            return;
        }

        const data = await res.json();
        setIsTaken(data?.available === false);
        setChecking(false);
        } catch (e) {
        if (e.name !== "AbortError") {
            setIsTaken(false);
            setChecking(false);
        }
        }
    }, 350);

    return () => {
        clearTimeout(timeout);
        controller.abort();
    };
    }, [username, backendUrl, localValidationError]);


  const isOk = !!username && !localValidationError && !checking && !isTaken;
  const canContinue = userLoaded && isOk;

  // =========================
  // Guardar username + rol fijo Creativo (comentado lo viejo)
  // =========================
  const handleNext = async () => {
    if (localValidationError) {
      setError(localValidationError);
      return;
    }
    if (isTaken) {
      setError("Ese nombre de usuario ya está en uso.");
      return;
    }
    if (!userLoaded) {
      setError("Aún estamos preparando tu cuenta, por favor espera un momento...");
      return;
    }

    setError("");

    // (TEMPORAL) rol fijo
    const role = "Creativo";

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${backendUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          username: username.trim(),
          // profileCompleted: true, // (comentado) solo si tu backend lo admite
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("role", role);
        localStorage.setItem("username", username.trim());
        navigate("/creativo/registro");
      } else {
        if (
          String(data?.error || "").toLowerCase().includes("usuario") ||
          String(data?.error || "").toLowerCase().includes("username")
        ) {
          setIsTaken(true);
        }
        setError(data?.error || "No se pudo guardar tu perfil.");
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-top-brand">
        <button type="button" className="button header-left-link ob-top-logo">THEFOLDER /</button>
      </div>

      <div className="ob-center">
        <h1 className="ob-title">Elige tu nombre de usuario</h1>

        <p className="ob-subtitle">
          Este será tu nombre público.<br />
          Podrás compartir tu enlace con empresas y profesionales del sector.
        </p>

        <div
          className={`ob-username ${username ? "has-value" : ""}`}
          onClick={() => inputRef.current?.focus()}
        >
          <span className="ob-prefix">thefolder.es/</span>

          <input
            ref={inputRef}
            className="ob-input"
            value={username}
            onChange={(e) => {
              const next = normalizeUsername(e.target.value);
              setUsername(next);
            }}
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
              if (e.key === "Enter" && canContinue) handleNext();
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text");
              setUsername(normalizeUsername(text));
            }}
            maxLength={20}
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            aria-label="Nombre de usuario"
          />

          {/* Icono estado (solo aparece si hay input válido o está checking) */}
          <span
            className={[
              "ob-status",
              checking ? "is-checking" : "",
              isTaken ? "is-bad" : "",
              isOk ? "is-ok" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            {checking ? "…" : isTaken ? "×" : isOk ? "✓" : ""}
          </span>

          <span className="ob-underline" />
        </div>

        <div className="ob-hint">
          Usa un nombre profesional, sin espacios y fácil de recordar.
          <br />
          Por el momento este nombre <strong>NO se podrá modificar</strong>.
        </div>

        {localValidationError && username && (
          <p className="ob-error">{localValidationError}</p>
        )}

        {isTaken && !checking && !localValidationError && (
          <p className="ob-error">Ese nombre ya está en uso. Prueba con otro.</p>
        )}

        {error && <p className="ob-error">{error}</p>}

        <button className="ob-cta" disabled={!canContinue} onClick={handleNext}>
          {userLoaded ? "EMPEZAR" : "CARGANDO..."}
        </button>

        <div className="ob-dots" aria-hidden="true">
          <span className="dot active" />
          <span className="dot" />
          <span className="dot" />
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistration;