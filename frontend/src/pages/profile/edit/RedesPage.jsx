import React from "react";
import AutosaveStatus from "../../../components/controlPanel/editProfile/ui/AutosaveStatus";
import { PageHeaderActions } from "../../../components/controlPanel/editProfile/ui/PanelPageHeader";
import SocialTab from "../../../components/controlPanel/editProfile/tabs/SocialTab";
import { useProfileDraft } from "../../../contexts/ProfileDraftContext";

const extractUsername = (url, prefix) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    const parts = url.split(prefix);
    if (parts.length > 1) return parts[1].replace(/\/$/, "");
  }
  if (!url.includes("http") && !url.includes(prefix)) return url;
  return url;
};

const buildSocialUrl = (network, usernameRaw) => {
  const username = (usernameRaw || "").trim();
  if (!username) return "";

  switch (network) {
    case "instagram":
      return `https://www.instagram.com/${username}/`;
    case "linkedin":
      return `https://www.linkedin.com/in/${username}/`;
    case "behance":
      return `https://www.behance.net/${username}/`;
    case "youtube":
      return `https://www.youtube.com/@${username.replace(/^@/, "")}`;
    case "pinterest":
      return `https://www.pinterest.com/${username}/`;
    default:
      return username;
  }
};

export default function RedesPage() {
  const { draft, setDraft, setIsDirty, autosaveStatus, setAutosaveStatus, isDirty, handleSaveAll } = useProfileDraft();

  const setSocialField = (key, value) => {
    setDraft((prev) => ({
      ...prev,
      social: {
        ...(prev?.social || {}),
        [key]: value,
      },
    }));
    setIsDirty(true);
  };

  const handleSocialUsernameChange = (e, network) => {
    // Tumblr, Substack y Are.na aceptan URL completa — se guardan tal cual
    if (network === "tumblr" || network === "substack" || network === "arena") {
      setSocialField(network, e.target.value);
      return;
    }
    const fullUrl = buildSocialUrl(network, e.target.value);
    setSocialField(network, fullUrl);
  };

  return (
    <div className="nep-tab-body">
      <SocialTab
        draft={draft}
        extractUsername={extractUsername}
        handleSocialUsernameChange={handleSocialUsernameChange}
      />
      {/* Estado de autoguardado: en la cabecera común de la página */}
        <PageHeaderActions>
          <AutosaveStatus
            autosaveStatus={autosaveStatus}
            isDirty={isDirty}
            onRetry={() => { setAutosaveStatus("saving"); handleSaveAll(); }}
          />
        </PageHeaderActions>
    </div>
  );
}
