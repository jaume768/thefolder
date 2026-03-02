// src/pages/profile/ProfileEditPage.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import NewEditProfileContent from "./NewEditProfileContent";


export default function ProfileEditPage() {
  const ctx = useOutletContext();

  // por seguridad: si algo falla arriba, no explota
  if (!ctx) return <div className="loading-indicator">Cargando...</div>;

  const { userData, setUserData } = ctx;

  if (!userData) return <div className="edit-profile-wrapper">Cargando perfil...</div>;

  return <NewEditProfileContent userData={userData} setUserData={setUserData} />;
}
