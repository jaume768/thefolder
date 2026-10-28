// components/controlPanel/editProfile/tabs/ProyectosHubTab.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Images, PanelTop } from "lucide-react";
import api from "../../../../services/api";
import GroupHubTab from "./GroupHubTab";

export default function ProyectosHubTab() {
  const { t } = useTranslation("profile");
  const navigate = useNavigate();

  // Classic ("default", o sin profileLayout todavía) no tiene páginas de
  // portfolio propias — mismo cálculo que PanelSidebar.jsx.
  const [profileLayout, setProfileLayout] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api.get("/api/users/profile")
      .then((res) => { if (!cancelled) setProfileLayout(res.data?.profileLayout || "default"); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);
  const pagesEnabled = profileLayout === null || profileLayout !== "default";

  const items = [
    {
      key: "unassigned",
      icon: Images,
      label: t("editProfile.nav.allProjects"),
      onClick: () => navigate("/myprofile/projects/unassigned"),
    },
    ...(pagesEnabled ? [{
      key: "pages",
      icon: PanelTop,
      label: t("editProfile.nav.portfolioPages"),
      onClick: () => navigate("/myprofile/projects/pages"),
    }] : []),
  ];

  return <GroupHubTab items={items} />;
}
