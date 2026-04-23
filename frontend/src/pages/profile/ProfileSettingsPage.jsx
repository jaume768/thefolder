import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "../../components/controlPanel/css/UserProfileExtern.css";

const normalizeUsername = (value) =>
  String(value || '').replace(/\s+/g, '').toLowerCase();

export default function ProfileSettingsPage() {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const token = localStorage.getItem("authToken");
      const res = await axios.put(
        `${backendUrl}/api/users/change-username`,
        { username: v },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUserData(prev => ({ ...prev, username: res.data.user?.username || v }));
      setUsernameMsg({ type: "ok", text: t("settings.usernameUpdated") });
      setTimeout(() => cancelSection(), 1500);
    } catch (e) {
      setUsernameMsg({ type: "error", text: e?.response?.data?.error || t("settings.usernameError") });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
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
      const token = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.put(
        `${backendUrl}/api/users/change-password`,
        { currentPassword, newPassword, confirmPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      const token = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.put(
        `${backendUrl}/api/users/change-email`,
        { newEmail, password: emailPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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
      const token = localStorage.getItem("authToken");
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      await axios.delete(`${backendUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem("authToken");
      localStorage.removeItem("userRole");
      navigate("/");
    } catch (e) {
      setDeleteError(t("settings.deleteError"));
      setIsDeleting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────
  if (loading) return <div className="loading-indicator">{t("settings.loading")}</div>;
  if (!userData) return <div className="edit-profile-wrapper">{t("settings.noSession")}</div>;

  return (
    <div className="edit-profile-wrapper">

      <p className="creatives-subtitle --show-mobile">
        {t("settings.subtitle")}
      </p>

      <div className="creatives-hero-inner miPerfil-hero">
        <div className="guardados-header miPerfil-header">
          <h1 className="centerTitle guardados miPerfil-title">{t("settings.title")}</h1>
        </div>
      </div>

      <section id="card-settings">
        <div className="ux-editprofile-section">

          {/* ── 0. NOMBRE DE USUARIO ─────────────────────────────────────── */}
          <div className="ux-form-block">
            <div className="ux-settings-row">
              <div className="ux-settings-row-info">
                <label className="ux-form-label">{t("settings.username")}</label>
                <p className="ux-settings-current-value">@{userData?.username || "—"}</p>
              </div>

              {editingSection !== "username" && (
                <button
                  type="button"
                  className="ux-link-btn"
                  onClick={() => openSection("username")}
                >
                  {t("settings.change")}
                </button>
              )}
            </div>

            {editingSection === "username" && (
              <div className="ux-settings-edit-area">
                <p className="ux-form-hint" style={{ marginBottom: 10 }}>
                  {t("settings.usernameHint")}
                </p>

                {/* Input estilo registro: thefolder.es/username */}
                <div className="ux-username-field">
                  <span className="ux-username-prefix">thefolder.es/</span>
                  <input
                    className="ux-username-input"
                    value={newUsername}
                    onChange={e => { setNewUsername(normalizeUsername(e.target.value)); setUsernameTaken(false); }}
                    onKeyDown={e => { if (e.key === ' ') e.preventDefault(); }}
                    onPaste={e => { e.preventDefault(); setNewUsername(normalizeUsername(e.clipboardData.getData('text'))); }}
                    maxLength={20}
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck={false}
                    placeholder={userData?.username || t("settings.usernamePlaceholder")}
                  />
                  <span
                    className={[
                      'ux-username-status',
                      usernameChecking ? 'is-checking' : '',
                      usernameTaken ? 'is-bad' : '',
                      (newUsername && !usernameLocalError && !usernameChecking && !usernameTaken) ? 'is-ok' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    {usernameChecking ? '…' : usernameTaken ? '×' : (newUsername && !usernameLocalError && !usernameChecking && !usernameTaken) ? '✓' : ''}
                  </span>
                </div>

                {usernameLocalError && newUsername && (
                  <p className="ux-msg-error">{usernameLocalError}</p>
                )}
                {usernameTaken && !usernameChecking && !usernameLocalError && (
                  <p className="ux-msg-error">{t("settings.usernameTaken")}</p>
                )}
                {usernameMsg.text && (
                  <p className={usernameMsg.type === "ok" ? "ux-msg-ok" : "ux-msg-error"}>
                    {usernameMsg.text}
                  </p>
                )}

                <div className="ux-settings-actions">
                  <button
                    type="button"
                    className="ux-btn-primary"
                    onClick={handleChangeUsername}
                    disabled={!newUsername || !!usernameLocalError || usernameChecking || usernameTaken}
                  >
                    {t("settings.saveUsername")}
                  </button>
                  <button type="button" className="ux-btn-ghost" onClick={cancelSection}>
                    {t("settings.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 1. EMAIL ─────────────────────────────────────────────────── */}
          <div className="ux-form-block">
            <div className="ux-settings-row">
              <div className="ux-settings-row-info">
                <label className="ux-form-label">{t("settings.email")}</label>
                <p className="ux-settings-current-value">{userData?.email || "—"}</p>
              </div>

              {editingSection !== "email" && (
                <button
                  type="button"
                  className="ux-link-btn"
                  onClick={() => openSection("email")}
                >
                  {t("settings.change")}
                </button>
              )}
            </div>

            {editingSection === "email" && (
              <div className="ux-settings-edit-area">
                <div className="ux-form-column" style={{ gridTemplateColumns: "1fr" }}>
                  <div className="ux-form-field">
                    <label className="ux-form-label" htmlFor="newEmail">{t("settings.newEmail")}</label>
                    <input
                      id="newEmail"
                      type="email"
                      className="ux-input"
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder={t("settings.emailPlaceholder")}
                      autoComplete="email"
                    />
                  </div>

                  {!isGoogleUser && (
                    <div className="ux-form-field">
                      <label className="ux-form-label" htmlFor="emailPassword">
                        {t("settings.confirmCurrentPassword")}
                      </label>
                      <input
                        id="emailPassword"
                        type="password"
                        className="ux-input"
                        value={emailPassword}
                        onChange={e => setEmailPassword(e.target.value)}
                        placeholder={t("settings.currentPasswordPlaceholder")}
                        autoComplete="current-password"
                      />
                    </div>
                  )}
                </div>

                {emailMsg.text && (
                  <p className={emailMsg.type === "ok" ? "ux-msg-ok" : "ux-msg-error"}>
                    {emailMsg.text}
                  </p>
                )}

                <div className="ux-settings-actions">
                  <button type="button" className="ux-btn-primary" onClick={handleChangeEmail}>
                    {t("settings.saveEmail")}
                  </button>
                  <button type="button" className="ux-btn-ghost" onClick={cancelSection}>
                    {t("settings.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. CONTRASEÑA ────────────────────────────────────────────── */}
          <div className="ux-form-block">
            <div className="ux-settings-row">
              <div className="ux-settings-row-info">
                <label className="ux-form-label">{t("settings.password")}</label>
                <p className="ux-settings-current-value">••••••••</p>
              </div>

              {editingSection !== "password" && (
                <button
                  type="button"
                  className="ux-link-btn"
                  onClick={() => openSection("password")}
                >
                  {t("settings.change")}
                </button>
              )}
            </div>

            {editingSection === "password" && (
              <div className="ux-settings-edit-area">
                <div className="ux-form-column" style={{ gridTemplateColumns: "1fr" }}>
                  {!isGoogleUser && (
                    <div className="ux-form-field">
                      <label className="ux-form-label" htmlFor="currentPwd">{t("settings.currentPassword")}</label>
                      <input
                        id="currentPwd"
                        type="password"
                        className="ux-input"
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder={t("settings.currentPasswordPlaceholder")}
                        autoComplete="current-password"
                      />
                    </div>
                  )}

                  <div className="ux-form-field">
                    <label className="ux-form-label" htmlFor="newPwd">{t("settings.newPassword")}</label>
                    <input
                      id="newPwd"
                      type="password"
                      className="ux-input"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder={t("settings.newPasswordPlaceholder")}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="ux-form-field">
                    <label className="ux-form-label" htmlFor="confirmPwd">{t("settings.confirmNewPassword")}</label>
                    <input
                      id="confirmPwd"
                      type="password"
                      className="ux-input"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder={t("settings.confirmPasswordPlaceholder")}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                {passwordMsg.text && (
                  <p className={passwordMsg.type === "ok" ? "ux-msg-ok" : "ux-msg-error"}>
                    {passwordMsg.text}
                  </p>
                )}

                <div className="ux-settings-actions">
                  <button type="button" className="ux-btn-primary" onClick={handleChangePassword}>
                    {t("settings.savePassword")}
                  </button>
                  <button type="button" className="ux-btn-ghost" onClick={cancelSection}>
                    {t("settings.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── 3. CERRAR SESIÓN ─────────────────────────────────────────── */}
          <div className="ux-form-block">
            <div className="ux-settings-row">
              <div className="ux-settings-row-info">
                <label className="ux-form-label">{t("settings.session")}</label>
                <p className="ux-settings-current-value">{t("settings.connectedAs", { email: userData?.email })}</p>
              </div>
              <button type="button" className="ux-link-btn" onClick={handleLogout}>
                {t("settings.logout")}
              </button>
            </div>
          </div>

          {/* ── 4. ELIMINAR CUENTA ───────────────────────────────────────── */}
          <div className="ux-form-block">
            <div className="ux-settings-row">
              <div className="ux-settings-row-info">
                <label className="ux-form-label">{t("settings.deleteAccount")}</label>
                <p className="ux-settings-current-value">
                  {t("settings.deleteAccountWarning")}
                </p>
              </div>
              <button
                type="button"
                className="ux-link-btn danger"
                onClick={() => { setIsDeleteModalOpen(true); setDeleteError(""); }}
              >
                {t("settings.delete")}
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── Modal confirmar eliminación ──────────────────────────────────── */}
      {isDeleteModalOpen && (
        <div
          className="filters-modal-overlay"
          onMouseDown={e => { if (e.target === e.currentTarget) setIsDeleteModalOpen(false); }}
        >
          <div className="filters-modal-panel ux-delete-modal" onMouseDown={e => e.stopPropagation()}>
            <div className="filters-panel-header">
              <div className="filters-panel-title">{t("settings.deleteModalTitle")}</div>
              <button
                type="button"
                className="filters-panel-close"
                onClick={() => setIsDeleteModalOpen(false)}
                aria-label={t("settings.close")}
              >
                <img src="/iconos/close.svg" alt={t("settings.close")} className="image-icon" />
              </button>
            </div>

            <div className="ux-delete-modal-body">
              <p>
                {t("settings.deleteModalBody1")}
              </p>
              <p><strong>{t("settings.deleteModalBody2")}</strong></p>

              {deleteError && <p className="ux-msg-error">{deleteError}</p>}

              <div className="ux-settings-actions">
                <button
                  type="button"
                  className="ux-btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                >
                  {isDeleting ? t("settings.deleting") : t("settings.deleteConfirm")}
                </button>
                <button
                  type="button"
                  className="ux-btn-ghost"
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  {t("settings.deleteCancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}