import React from "react";
import InsightsTab from "../../../components/controlPanel/editProfile/tabs/InsightsTab";
import { useProfileDraft } from "../../../contexts/ProfileDraftContext";

export default function AnaliticasPage() {
  const { draft } = useProfileDraft();

  return (
    <div className="nep-tab-body">
      <InsightsTab draft={draft} />
    </div>
  );
}
