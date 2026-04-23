// src/pages/profile/ProfileEditPage.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import NewEditProfileContent from "./NewEditProfileContent";

export default function ProfileEditPage() {
  const ctx = useOutletContext();
  const { t } = useTranslation("profile");

  if (!ctx) return <div className="loading-indicator">{t("loading")}</div>;

  const { userData, setUserData } = ctx;

  if (!userData) return <div className="edit-profile-wrapper">{t("loading")}</div>;

  return <NewEditProfileContent userData={userData} setUserData={setUserData} />;
}
