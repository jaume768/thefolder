import React from "react";
import { useNavigate } from "react-router-dom";

export default function PeopleTagsList({
  people = [],
  taggedUsersInfo = {},
  getInitials,
  onOpenExternal,
  variant = "cards",
}) {
  const navigate = useNavigate();

  const safeInitials = (name) => {
    if (typeof getInitials === "function") return getInitials(name);
    const clean = String(name || "").trim().replace(/^@/, "");
    return clean ? clean[0].toUpperCase() : "?";
  };

  const filtered = (people || []).filter(
    (p) => String(p?.name || "").trim() !== "" || String(p?.username || "").trim() !== ""
  );

  if (!filtered.length) return null;

  return (
    <ul className={`personas__lista ${variant === "cards" ? "personas__lista--cards" : ""}`}>
      {filtered.map((person, idx) => {
        const rawName = String(person?.name || "").trim();
        const usernameFromField = String(person?.username || "").trim();

        // legacy: si alguien guardó name="@marii"
        const usernameFromName = rawName.startsWith("@") ? rawName : "";

        const username = String(usernameFromField || usernameFromName)
          .trim()
          .replace(/^@/, "");

        const info = username ? taggedUsersInfo?.[username] : null;

        // ✅ criterio robusto
        const isRegistered =
          person?.isRegistered === true ||
          (typeof info?.exists === "boolean" ? info.exists : false) ||
          !!username;

        const role = String(person?.role || "").trim();

        const socialUrl = String(person?.socialUrl || "").trim();
        const isExternalClickable = !isRegistered && !!socialUrl;

        const avatarUrl =
          info?.profilePicture ||
          person.profilePicture ||
          person.avatar ||
          person.photo ||
          person.image ||
          null;

        const displayUserText = isRegistered
          ? (rawName || (username ? `@${username}` : "—")).toLowerCase()
          : (rawName || (username ? `@${username}` : "—"));

        const clickable = (isRegistered && !!username) || isExternalClickable;
        const clickableClass = [
          clickable ? "is-clickable" : "",
          isExternalClickable ? "is-external" : "",
        ].filter(Boolean).join(" ");

        const handleClick = (e) => {
          e.preventDefault();

          if (isRegistered && username) {
            navigate(`/${username}`)
            window.scrollTo(0, 0);
            return;
          }

          if (isExternalClickable) {
            if (typeof onOpenExternal === "function") {
              onOpenExternal({ url: socialUrl, name: rawName || "Enlace externo" });
            } else {
              window.open(socialUrl, "_blank", "noopener,noreferrer");
            }
          }
        };

        return (
          <li key={`${username || rawName}-${idx}`} className="personas__item personas__item--card">
            <button
              type="button"
              className={`tagged-person ${clickableClass}`}
              onClick={handleClick}
            >
              <span className="tagged-person__hovercard" aria-hidden="true">
                <span className="tagged-person__hovercard-inner">
                  {isRegistered ? (
                    avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="tagged-person__hover-avatar"
                        loading="lazy"
                      />
                    ) : (
                      <span className="tagged-person__hover-fallback">
                        {safeInitials(displayUserText)}
                      </span>
                    )
                  ) : isExternalClickable ? (
                    <span className="tagged-person__hover-external">[link externo ↗]</span>
                  ) : null}
                </span>
              </span>

              <div className="tagged-person__meta">
                <div className="tagged-person__role">
                  {role || "Rol"} <span>/</span>
                </div>

                <div className="tagged-person__user">
                  {displayUserText}
                  {(isRegistered && username) && <span> →</span>}
                  {(!isRegistered && isExternalClickable) && <span> ↗</span>}
                </div>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
