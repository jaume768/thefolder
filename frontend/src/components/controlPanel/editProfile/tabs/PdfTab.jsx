// src/components/controlPanel/editProfile/tabs/PdfTab.jsx
import React from "react";
import { File } from "lucide-react";
import { useTranslation } from "react-i18next";
import ComingSoonSection from "../ui/ComingSoonSection";

export default function PdfTab() {
  const { t } = useTranslation("profile");

  return (
    <ComingSoonSection
      icon={File}
      title={t("editProfile.tabs.pdf")}
      subtitle={t("editProfile.cvPortfolioSoon")}
    />
  );
}
