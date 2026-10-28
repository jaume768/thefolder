// components/controlPanel/editProfile/tabs/PerfilHubTab.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, FileText, Share2 } from "lucide-react";
import { TAB_SLUGS } from "../../../../pages/profile/editProfileTabs";
import GroupHubTab from "./GroupHubTab";

export default function PerfilHubTab() {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const go = (tab) => navigate(`/myprofile/edit/${TAB_SLUGS[tab]}`);

  const items = [
    { key: "info", icon: User, label: t("editProfile.tabs.info"), description: t("editProfile.hubDesc.info"), onClick: () => go("info") },
    { key: "cv", icon: FileText, label: t("editProfile.tabs.cv"), description: t("editProfile.hubDesc.cv"), onClick: () => go("cv") },
    { key: "redes", icon: Share2, label: t("editProfile.tabs.social"), description: t("editProfile.hubDesc.redes"), onClick: () => go("redes") },
  ];

  return <GroupHubTab items={items} />;
}
