import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { X, Check, Trash2, LogOut } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import PageSkeleton from "../../components/skeleton/PageSkeleton";
import PanelPageHeader from "../../components/controlPanel/editProfile/ui/PanelPageHeader";
import { Section, Field } from "../../components/controlPanel/editProfile/ui/ProfileFormSection";
import ConfirmDialog from "../../components/controlPanel/proyectos/ConfirmDialog";

import "../../components/controlPanel/css/UserProfileExtern.css";
import "../../components/controlPanel/css/editProfileShell.css";
import "../../components/controlPanel/editProfile/tabs/ProfileInfo.css";
import "./ProfileSettingsPage.css";

// Idiomas disponibles (los mismos que LanguageSwitcher.jsx marca como
// available) — nombre en su propio idioma, no traducido.
const LANGUAGES = [["es", "Español"], ["en", "English"]];

const normalizeUsername = (value) =>
  String(value || '').replace(/\s+/g, '').toLowerCase();

export default function ProfileSettingsPage() {
  const { t, i18n } = useTranslation("profile");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const { logout: authLogout } = useAuth();

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Estados de edición ───────────────────────────────────────────────────
  const [editingSection, setEditingSection] = useState(null); // "username" | "password" | "email" | null

  // Username
  const [newUsername, setNewUsername]           = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameTaken, setUsernameTaken]       = useState(false);
  const [usernameMsg, setUsernameMsg]           = useState({ type: "", text: "" });

  const usernameLocalError = useMemo(() => {
    const v = newUsername.trim();
    if (!v) return '';
    if (v.length > 20) return t('settings.validation.max20Chars');
    if (!/^[a-z0-9-]+$/.test(v)) return t('settings.validation.lowercaseNumbersHyphens');
    if (v.startsWith('-') || v.endsWith('-')) return t('settings.validation.noStartEndHyphen');
    if (v.includes('--')) return t('settings.validation.noDoubleHyphen');
    return '';
  }, [newUsername, t]);

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Email
  const [newEmail, setNewEmail]               = useState("");
  const [emailPassword, setEmailPassword]     = useState("");

  // Feedback por sección
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" }); // type: "error"|"ok"
  const [emailMsg, setEmailMsg]       = useState({ type: "", text: "" });

  // Modal eliminar cuenta
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting]               = useState(false);
  const [deleteError, setDeleteError]             = useState("");

  const isGoogleUser = useMemo(() => !!userData?.googleId, [userData?.googleId]);

  // ── Fetch usuario ────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) { navigate("/?showRegister=true"); return; }

        const res = await api.get('/api/users/profile');
        setUserData(res.data?.user || res.data);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigate]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const openSection = (key) => {
    setEditingSection(key);
    setPasswordMsg({ type: "", text: "" });
    setEmailMsg({ type: "", text: "" });
    setUsernameMsg({ type: "", text: "" });
    setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    setNewEmail(""); setEmailPassword("");
    setNewUsername(""); setUsernameTaken(false);
  };

  const cancelSection = () => {
    setEditingSection(null);
    setPasswordMsg({ type: "", text: "" });
    setEmailMsg({ type: "", text: "" });
    setUsernameMsg({ type: "", text: "" });
  };

  // ── Disponibilidad de username (debounce) ────────────────────────────────
  useEffect(() => {
    if (editingSection !== "username") return;
    const v = newUsername.trim();
    setUsernameMsg({ type: "", text: "" });
    if (!v || usernameLocalError) { setUsernameTaken(false); setUsernameChecking(false); return; }

    const controller = new AbortController();
    const token = localStorage.getItem("authToken");
    const t = setTimeout(async () => {
      setUsernameChecking(true);
      try {
        const res = await fetch(
          `${backendUrl}/api/users/check-username?username=${encodeURIComponent(v)}`,
          { headers: { Authorization: `Bearer ${token}` }, signal: controller.signal }
        );
        if (res.ok) {
          const data = await res.json();
          setUsernameTaken(data?.available === false);
        }
      } catch (e) {
        if (e.name !== 'AbortError') setUsernameTaken(false);
      } finally {
        setUsernameChecking(false);
      }
    }, 350);

    return () => { clearTimeout(t); controller.abort(); };
  }, [newUsername, usernameLocalError, editingSection, backendUrl]);

  // ── Cambiar username ─────────────────────────────────────────────────────
  const handleChangeUsername = async () => {
    setUsernameMsg({ type: "", text: "" });
    const v = newUsername.trim();
    if (!v || usernameLocalError) {
      setUsernameMsg({ type: "error", text: usernameLocalError || t("settings.validation.invalidUsername") });
      return;
    }
    if (usernameTaken) {
      setUsernameMsg({ type: "error", text: t("settings.validation.usernameTaken") });
      return;
    }
    try {
      const res = await api.put('/api/users/change-username', { username: v });
      setUserData(prev => ({ ...prev, username: res.data.user?.username || v }));
      setUsernameMsg({ type: "ok", text: t("settings.usernameUpdated") });
      setTimeout(() => cancelSection(), 1500);
    } catch (e) {
      setUsernameMsg({ type: "error", text: e?.response?.data?.error || t("settings.usernameError") });
    }
  };

  const handleLogout = () => {
    authLogout();
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // ── Cambiar contraseña ───────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPasswordMsg({ type: "", text: "" });

    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: t("settings.passwordMinLength") });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: t("settings.passwordsDontMatch") });
      return;
    }

    try {
      await api.put('/api/users/change-password', { currentPassword, newPassword, confirmPassword });
      setPasswordMsg({ type: "ok", text: t("settings.passwordUpdated") });
      setTimeout(() => cancelSection(), 1500);
    } catch (e) {
      setPasswordMsg({ type: "error", text: e?.response?.data?.error || t("settings.passwordError") });
    }
  };

  // ── Cambiar email ────────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    setEmailMsg({ type: "", text: "" });

    if (!newEmail || !newEmail.includes("@")) {
      setEmailMsg({ type: "error", text: t("settings.emailInvalid") });
      return;
    }
    if (newEmail.toLowerCase() === (userData?.email || "").toLowerCase()) {
      setEmailMsg({ type: "error", text: t("settings.emailMustDiffer") });
      return;
    }

    try {
      const res = await api.put('/api/users/change-email', { newEmail, password: emailPassword });
      setUserData(prev => ({ ...prev, email: res.data.email }));
      setEmailMsg({ type: "ok", text: t("settings.emailUpdated") });
      setTimeout(() => cancelSection(), 1500);
    } catch (e) {
      setEmailMsg({ type: "error", text: e?.response?.data?.error || t("settings.emailError") });
    }
  };

  // ── Eliminar cuenta ──────────────────────────────────────────────────────
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");
      await api.delete('/api/users/profile');
      authLogout();
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (e) {
      // El diálogo se cierra y el error se queda en la propia sección.
      setDeleteError(t("settings.deleteError"));
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return <PageSkeleton variant="panel" />;
  if (!userData) return <div className="nep-main-content">{t("settings.noSession")}</div>;

  const currentLang = i18n.language?.toLowerCase().startsWith("es") ? "es" : "en";
  const usernameOk = !!newUsername && !usernameLocalError && !usernameChecking && !usernameTaken;

  // Mensaje de resultado bajo los campos de una sección (error / ok)
  const renderMsg = (msg) => msg.text && (
    <p className={`st-msg st-msg--${msg.type === "ok" ? "ok" : "error"}`} role="status">{msg.text}</p>
  );

  // Guardar (negro, como los CTA del panel) + Cancelar (texto)
  const renderActions = (saveLabel, onSave, disabled = false) => (
    <div className="st-actions">
      <button type="button" className="nep-ph-btn nep-ph-btn--black" onClick={onSave} disabled={disabled}>
        {saveLabel}
      </button>
      <button type="button" className="pi-text-btn" onClick={cancelSection}>
        {t("settings.cancel")}
      </button>
    </div>
  );

  // Valor actual en solo lectura + "Cambiar" (mismo .pi-readonly que el
  // email de Info de perfil). Sin `section`, solo lectura.
  const renderReadonly = (value, section) => (
    <div className="pi-readonly">
      <span className="pi-readonly-value">{value}</span>
      {section && editingSection !== section && (
        <button type="button" className="pi-readonly-link st-readonly-btn" onClick={() => openSection(section)}>
          {t("settings.change")}
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="nep-main-content">
        {/* Cabecera común del panel, sin botones: "Cerrar sesión" vive en la
            sección Sesión (arriba confundía, parecía la acción principal). */}
        <PanelPageHeader
          title={t("editProfile.nav.settings")}
          subtitle={t("settings.subtitle")}
        />

        {/* Mismo diseño que Info de perfil / CV / Redes (ProfileInfo.css):
            filas título+ayuda | campos, campos gris tenue sin borde. */}
        <div className="nep-tab-body">
          <div className="pi-root st-root">

            {/* ── Nombre de usuario ── */}
            <Section id="sec-st-username" title={t("settings.username")} help={t("settings.usernameHint")}>
              <Field>
                {renderReadonly(`thefolder.es/${userData?.username || "-"}`, "username")}
              </Field>

              {editingSection === "username" && (
                <>
                  <Field id="st-new-username" label={t("settings.newUsername")}>
                    <div className="pi-input pi-prefixed">
                      <span className="pi-prefix" aria-hidden="true">thefolder.es/</span>
                      <input
                        id="st-new-username"
                        className="pi-prefixed-input"
                        value={newUsername}
                        onChange={e => { setNewUsername(normalizeUsername(e.target.value)); setUsernameTaken(false); }}
                        onKeyDown={e => { if (e.key === " ") e.preventDefault(); }}
                        onPaste={e => { e.preventDefault(); setNewUsername(normalizeUsername(e.clipboardData.getData("text"))); }}
                        maxLength={20}
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        autoFocus
                        placeholder={userData?.username || t("settings.usernamePlaceholder")}
                      />
                      <span
                        className={`st-status${usernameTaken ? " is-bad" : ""}${usernameOk ? " is-ok" : ""}`}
                        aria-hidden="true"
                      >
                        {usernameChecking
                          ? <span className="pi-spinner" />
                          : usernameTaken
                            ? <X size={16} strokeWidth={2} />
                            : usernameOk ? <Check size={16} strokeWidth={2} /> : null}
                      </span>
                    </div>
                  </Field>

                  {usernameLocalError && newUsername && <p className="st-msg st-msg--error">{usernameLocalError}</p>}
                  {usernameTaken && !usernameChecking && !usernameLocalError && (
                    <p className="st-msg st-msg--error">{t("settings.usernameTaken")}</p>
                  )}
                  {renderMsg(usernameMsg)}
                  {renderActions(
                    t("settings.saveUsername"),
                    handleChangeUsername,
                    !newUsername || !!usernameLocalError || usernameChecking || usernameTaken
                  )}
                </>
              )}
            </Section>

            {/* ── Email ── */}
            <Section id="sec-st-email" title={t("settings.email")} help={t("settings.help.email")}>
              <Field>
                {renderReadonly(userData?.email || "-", "email")}
              </Field>

              {editingSection === "email" && (
                <>
                  <div className={isGoogleUser ? undefined : "pi-grid-2"}>
                    <Field id="st-new-email" label={t("settings.newEmail")}>
                      <input
                        id="st-new-email"
                        type="email"
                        className="pi-input"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder={t("settings.emailPlaceholder")}
                        autoComplete="email"
                        autoFocus
                      />
                    </Field>
                    {!isGoogleUser && (
                      <Field id="st-email-password" label={t("settings.confirmCurrentPassword")}>
                        <input
                          id="st-email-password"
                          type="password"
                          className="pi-input"
                          value={emailPassword}
                          onChange={e => setEmailPassword(e.target.value)}
                          placeholder={t("settings.currentPasswordPlaceholder")}
                          autoComplete="current-password"
                        />
                      </Field>
                    )}
                  </div>
                  {renderMsg(emailMsg)}
                  {renderActions(t("settings.saveEmail"), handleChangeEmail)}
                </>
              )}
            </Section>

            {/* ── Contraseña ── */}
            <Section id="sec-st-password" title={t("settings.password")} help={t("settings.help.password")}>
              <Field>
                {renderReadonly("••••••••", "password")}
              </Field>

              {editingSection === "password" && (
                <>
                  {!isGoogleUser && (
                    <Field id="st-current-password" label={t("settings.currentPassword")}>
                      <input
                        id="st-current-password"
                        type="password"
                        className="pi-input"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder={t("settings.currentPasswordPlaceholder")}
                        autoComplete="current-password"
                        autoFocus
                      />
                    </Field>
                  )}
                  <div className="pi-grid-2">
                    <Field id="st-new-password" label={t("settings.newPassword")}>
                      <input
                        id="st-new-password"
                        type="password"
                        className="pi-input"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder={t("settings.newPasswordPlaceholder")}
                        autoComplete="new-password"
                      />
                    </Field>
                    <Field id="st-confirm-password" label={t("settings.confirmNewPassword")}>
                      <input
                        id="st-confirm-password"
                        type="password"
                        className="pi-input"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder={t("settings.confirmPasswordPlaceholder")}
                        autoComplete="new-password"
                      />
                    </Field>
                  </div>
                  {renderMsg(passwordMsg)}
                  {renderActions(t("settings.savePassword"), handleChangePassword)}
                </>
              )}
            </Section>

            {/* ── Idioma: mismo control segmentado que Disponibilidad (CV) ── */}
            <Section id="sec-st-language" title={t("settings.language")} help={t("settings.help.language")}>
              <div className="pi-field">
                {/* Sin etiqueta propia: el título de la sección ya dice "Idioma" */}
                <div className="pi-segmented pi-segmented--half" role="radiogroup" aria-labelledby="sec-st-language-title">
                  {LANGUAGES.map(([code, label]) => (
                    <button
                      key={code}
                      type="button"
                      role="radio"
                      aria-checked={currentLang === code}
                      className={`pi-segment${currentLang === code ? " is-on" : ""}`}
                      onClick={() => i18n.changeLanguage(code)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── Sesión: con quién estás conectado + "Cerrar sesión" ── */}
            <Section id="sec-st-session" title={t("settings.session")} help={t("settings.help.session")}>
              <Field>
                {renderReadonly(userData?.email || "-")}
              </Field>
              <div>
                <button type="button" className="pi-btn" onClick={handleLogout}>
                  <LogOut size={14} strokeWidth={1.8} aria-hidden="true" />
                  {t("settings.logout")}
                </button>
              </div>
            </Section>

            {/* ── Eliminar cuenta ── */}
            <Section id="sec-st-delete" title={t("settings.deleteAccount")} help={t("settings.deleteAccountWarning")}>
              <div>
                <button
                  type="button"
                  className="pi-btn st-danger-btn"
                  onClick={() => { setIsDeleteModalOpen(true); setDeleteError(""); }}
                >
                  <Trash2 size={14} strokeWidth={1.8} aria-hidden="true" />
                  {t("settings.deleteAccount")}
                </button>
              </div>
              {deleteError && <p className="st-msg st-msg--error">{deleteError}</p>}
            </Section>

          </div>
        </div>
      </div>

      {/* Confirmar eliminación: mismo diálogo que borrar proyecto / carpeta */}
      {isDeleteModalOpen && (
        <ConfirmDialog
          title={t("settings.deleteModalTitle")}
          warning={`${t("settings.deleteModalBody1")} ${t("settings.deleteModalBody2")}`}
          confirmLabel={isDeleting ? t("settings.deleting") : t("settings.deleteConfirm")}
          cancelLabel={t("settings.deleteCancel")}
          onConfirm={handleDeleteAccount}
          onCancel={() => { if (!isDeleting) setIsDeleteModalOpen(false); }}
          busy={isDeleting}
        />
      )}
    </>
  );
}
