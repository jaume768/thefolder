// src/pages/profile/ProfileOffersPage.jsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import MisOfertasSection from "../../components/profile/MisOfertasSection";

export default function ProfileOffersPage() {
  const { userData } = useOutletContext();

  return (
    <MisOfertasSection
      userRole={userData?.role}
      professionalType={userData?.professionalType}
    />
  );
}
