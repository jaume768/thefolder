// CompleteRegistrationCreativo.jsx
import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/thefolder-logotipo.png";
import "../css/complete-registration.css";

const CompleteRegistrationCreativo = () => {
  const { t } = useTranslation("onboarding");
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [userLoaded, setUserLoaded] = useState(false);
  const [error, setError] = useState("");

  // Campos (UI)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");

  // =========================
  // DRAFT localStorage (para no perder datos al volver atrás)
  // =========================
  const DRAFT_KEY = "onboardingBasicsDraft";

  const saveDraft = (draft) => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  };

  const loadDraft = () => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  // =========================
  // Botón volver atrás
  // =========================
  const handleBack = () => {
    saveDraft({ firstName, lastName, city, country, dateOfBirth });
    navigate(-1);
  };

  // =========================
  // Por si vienes con ?token=...
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
  // Cargar borrador al entrar
  // =========================
  useEffect(() => {
    const draft = loadDraft();
    if (!draft) return;

    if (draft.firstName) setFirstName(draft.firstName);
    if (draft.lastName) setLastName(draft.lastName);
    if (draft.city) setCity(draft.city);
    if (draft.country) setCountry(draft.country);
    if (draft.dateOfBirth) setDateOfBirth(draft.dateOfBirth);
  }, []);

  // =========================
  // Guardado automático mientras escribe
  // =========================
  useEffect(() => {
    saveDraft({ firstName, lastName, city, country, dateOfBirth });
  }, [firstName, lastName, city, country, dateOfBirth]);

  // =========================
  // Cargar perfil (sin pisar el draft)
  // OJO: tu backend guarda fullName, dateOfBirth, country, city
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setUserLoaded(true);
      return;
    }

    (async () => {
      try {
        const response = await fetch(`${backendUrl}/api/users/profile`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setUserLoaded(true);
          return;
        }

        const data = await response.json();
        const draft = loadDraft() || {};

        // Si viene fullName del backend, lo separamos en nombre/apellidos (simple)
        if (data?.fullName && !draft.firstName && !draft.lastName) {
          const parts = String(data.fullName).trim().split(/\s+/);
          const first = parts.shift() || "";
          const last = parts.join(" ");
          if (first) setFirstName(first);
          if (last) setLastName(last);
        }

        if (data?.city && !draft.city) setCity(data.city);
        if (data?.country && !draft.country) setCountry(data.country);

        if (data?.dateOfBirth && !draft.dateOfBirth) {
          setDateOfBirth(String(data.dateOfBirth).slice(0, 10)); // YYYY-MM-DD
        }

        setUserLoaded(true);
      } catch {
        setUserLoaded(true);
      }
    })();
  }, [backendUrl]);

  // =========================
  // Validación (igual que tu versión antigua)
  // =========================
  const isValid =
    firstName.trim().length >= 1 &&
    lastName.trim().length >= 1 &&
    city.trim().length >= 1 &&
    country.trim().length >= 1 &&
    !!dateOfBirth;

  // Validación edad 1..90 (igual que tu archivo que funciona)
  const isAgeValid = () => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

    return age >= 1 && age <= 90;
  };

  // =========================
  // Continuar: manda lo que el backend espera
  // =========================
  const handleNext = async () => {
    if (!isValid) {
      setError(t("errors.allFieldsRequired"));
      return;
    }
    if (!isAgeValid()) {
      setError(t("errors.invalidDate"));
      return;
    }

    setError("");

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    try {
      const token = localStorage.getItem("authToken");

      const response = await fetch(`${backendUrl}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName,
          dateOfBirth,
          country: country.trim(),
          city: city.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem(DRAFT_KEY); // limpio borrador
        navigate("/photo/registro/03");
      } else {
        setError(data.error || t("errors.saveFailed"));
      }
    } catch {
      setError(t("errors.connection"));
    }
  };

  return (
    <div className="ob-page">
      <div className="ob-top-brand">
        <button type="button" className="button header-left-link ob-top-logo">THEFOLDER /</button>
      </div>

      <div className="ob-center">
        <h1 className="complete-registration__title">{t("personal.title")}</h1>
        <p className="complete-registration__subtitle">
          {t("personal.subtitle")}
        </p>

        <div className="ob-form">
          <div className="ob-grid-2">
            <div className="ob-field">
              <label className="complete-registration__label">{t("personal.firstName")}</label>
              <input
                className="complete-registration__input"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={t("personal.firstNamePlaceholder")}
              />
            </div>

            <div className="ob-field">
              <label className="complete-registration__label">{t("personal.lastName")}</label>
              <input
                className="complete-registration__input"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={t("personal.lastNamePlaceholder")}
              />
            </div>
          </div>

          <div className="ob-label-row">{t("personal.location")}</div>

          <div className="ob-grid-2">
            <div className="ob-field">
              <input
                className="complete-registration__input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder={t("personal.cityPlaceholder")}
              />
            </div>

            <div className="ob-field">
              <input
                className="complete-registration__input"
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder={t("personal.countryPlaceholder")}
              />
            </div>
          </div>

          <div className="ob-mini-hint">
            {t("personal.publicHint")}
          </div>

          <div className="ob-field">
            <label className="complete-registration__label">{t("personal.dateOfBirth")}</label>
            <input
              className="complete-registration__input"
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
            <div className="ob-mini-hint">{t("personal.privateHint")}</div>
          </div>
        </div>

        {error && <p className="ob-error">{error}</p>}

        <div className="ob-buttons">
          <button className="complete-registration__button --back" onClick={handleBack}>
            ← {t("common.back")}
          </button>

          <button
            className="complete-registration__button --submit"
            onClick={handleNext}
            disabled={!userLoaded || !isValid}
          >
            {userLoaded ? t("common.continue") : t("common.loading")}
          </button>
        </div>

        <div className="ob-dots" aria-hidden="true">
          <span className="dot" />
          <span className="dot active" />
          <span className="dot" />
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistrationCreativo;
