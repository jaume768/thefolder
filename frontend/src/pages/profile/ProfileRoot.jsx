// src/pages/profile/ProfileRoot.jsx
import React, { useEffect, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import axios from "axios";

const getCreativeTypeText = (type) => {
  switch (type) {
    case 1: return "Estudiante";
    case 2: return "Graduado";
    case 3: return "Estilista";
    case 4: return "Diseñador de marca";
    case 5: return "Otro";
    default: return "";
  }
};

export default function ProfileRoot() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sidebar: edición de foto perfil
  const profileImageInputRef = useRef(null);
  const [selectedProfileImage, setSelectedProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isEditingProfilePicture, setIsEditingProfilePicture] = useState(false);
  const [isUploadingProfilePicture, setIsUploadingProfilePicture] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("No token");
        const backendUrl = import.meta.env.VITE_BACKEND_URL;

        const res = await axios.get(`${backendUrl}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data;

        // Guardamos TODO lo del backend + añadimos campos UI que usabas antes
        setUserData({
          ...user,
          profilePicture: user.profile?.profilePicture || "/multimedia/usuarioDefault.jpg",
          creativeTypeText: getCreativeTypeText(user.creativeType),
          featuredHeaderImage: user.featuredHeaderImage || user.featuredHeaderImage || "",
        });
      } catch (e) {
        console.error("Error cargando perfil:", e);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleProfilePictureClick = () => {
    profileImageInputRef.current?.click();
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedProfileImage(URL.createObjectURL(file));
    setProfileImageFile(file);
    setIsEditingProfilePicture(true);
  };

  const handleCancelProfileImageEdit = () => {
    setSelectedProfileImage(null);
    setProfileImageFile(null);
    setIsEditingProfilePicture(false);
  };

  const handleSaveProfileImage = async () => {
    if (!profileImageFile) return;

    setIsUploadingProfilePicture(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const backendUrl = import.meta.env.VITE_BACKEND_URL;

      const formData = new FormData();
      formData.append("file", profileImageFile);

      const response = await fetch(`${backendUrl}/api/users/profile-picture`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error al actualizar foto:", data?.error || data);
        return;
      }

      // data.profilePicture suele venir como URL final
      setUserData((prev) => ({
        ...prev,
        profilePicture: data.profilePicture || prev.profilePicture,
      }));

      handleCancelProfileImageEdit();
    } catch (err) {
      console.error("Error en subida de foto:", err);
    } finally {
      setIsUploadingProfilePicture(false);
    }
  };

  if (loading) return <div className="loading-indicator">Cargando...</div>;
  if (!userData) return <div className="edit-profile-wrapper">No hay sesión.</div>;

  return (
    <Outlet context={{ userData, setUserData }} />
  );
}
