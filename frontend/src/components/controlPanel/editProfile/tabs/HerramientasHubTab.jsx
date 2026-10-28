// components/controlPanel/editProfile/tabs/HerramientasHubTab.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart2, Briefcase, File } from "lucide-react";
import { TAB_SLUGS } from "../../../../pages/profile/editProfileTabs";
import GroupHubTab from "./GroupHubTab";

export default function HerramientasHubTab() {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();
  const go = (tab) => navigate(`/myprofile/edit/${TAB_SLUGS[tab]}`);

  const items = [
    { key: "analiticas", icon: BarChart2, label: t("editProfile.nav.insights"), description: t("editProfile.hubDesc.analiticas"), onClick: () => go("analiticas") },
    { key: "kit", icon: Briefcase, label: t("editProfile.nav.applicationKit"), description: t("editProfile.hubDesc.kit"), soon: true, onClick: () => go("kit") },
    { key: "pdf", icon: File, label: t("editProfile.tabs.pdf"), description: t("editProfile.hubDesc.pdf"), soon: true, onClick: () => go("pdf") },
  ];

  return <GroupHubTab items={items} />;
}
