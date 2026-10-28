import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import "./DynamicGreeting.css";

function getGreetingKey() {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return "morning";
  if (h >= 12 && h < 20) return "afternoon";
  return "evening";
}

export default function DynamicGreeting({ user = {}, showAvatar = true }) {
  const { t } = useTranslation("profile");
  const phrases = t("editProfile.greeting.phrases", { returnObjects: true });
  const phrase = useMemo(
    () => phrases[Math.floor(Math.random() * phrases.length)],
    [phrases]
  );
  const greeting = t(`editProfile.greeting.${getGreetingKey()}`);
  const firstName = user.name?.trim().split(" ")[0] || "";

  return (
    <h1 className="dg-heading">
      <span className="dg-line">
        {greeting},{" "}
        <span className="dg-name">
          {showAvatar && (
            <img
              className="dg-avatar"
              src={user.avatar || "/multimedia/usuarioDefault.jpg"}
              alt=""
              aria-hidden="true"
            />
          )}
          {firstName}
        </span>.
      </span>
      <span className="dg-phrase">{phrase}</span>
    </h1>
  );
}
