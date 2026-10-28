// src/components/controlPanel/editProfile/tabs/SocialTab.jsx
// "Redes" — mismo diseño que "Info de perfil" (InfoTab.jsx, ProfileInfo.css):
// secciones título+ayuda | campos, campos gris tenue sin borde. Las redes
// con usuario llevan el dominio fijo delante dentro del propio campo
// (.pi-prefixed); las de enlace completo (Tumblr, Substack, Are.na) van
// aparte. Mismos valores y mismo onChange que antes (RedesPage.jsx).
import { useTranslation } from "react-i18next";
import { FaInstagram, FaLinkedinIn, FaBehance, FaTumblr, FaYoutube, FaPinterest } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";
import { Section } from "../ui/ProfileFormSection";
import "./ProfileInfo.css";

const ARENA_ICON = "/iconos/are-na-logo.png";

const youtubeUsername = (url) => (url || "")
  .replace(/^https?:\/\/(?:www\.)?youtube\.com\/@?/, "")
  .replace(/\/$/, "")
  .replace(/^@/, "");

const tumblrValue = (url) => (/^https?:\/\/(?:www\.)?tumblr\.com\//.test(url || "") ? "" : (url || ""));

function SocialField({ id, network, label, icon, prefix, value, placeholder, type = "text", onChange }) {
  return (
    <div className="pi-field">
      <div className="pi-label-row">
        <label className="pi-label pi-label--icon" htmlFor={id}>
          {icon}
          {label}
        </label>
      </div>
      <div className={`pi-input pi-prefixed${prefix ? "" : " pi-prefixed--none"}`}>
        {prefix && <span className="pi-prefix" aria-hidden="true">{prefix}</span>}
        <input
          id={id}
          name={`social.${network}`}
          type={type}
          autoComplete="off"
          className="pi-prefixed-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

export default function SocialTab({
  draft,
  extractUsername,
  handleSocialUsernameChange,
}) {
  const { t } = useTranslation("profile");
  const social = draft?.social || {};
  const usernamePh = t("editProfile.placeholderUsername");

  const field = (network, props) => (
    <SocialField
      key={network}
      id={`social-${network}`}
      network={network}
      onChange={(e) => handleSocialUsernameChange(e, network)}
      {...props}
    />
  );

  return (
    <div className="pi-root">
      <Section
        id="sec-redes-perfiles"
        title={t("editProfile.socialPage.networksTitle")}
        help={t("editProfile.socialPage.networksHelp")}
      >
        {field("instagram", {
          label: "Instagram", icon: <FaInstagram aria-hidden="true" />, prefix: "instagram.com/@",
          placeholder: usernamePh, value: extractUsername(social.instagram, "instagram.com/"),
        })}
        {field("linkedin", {
          label: "LinkedIn", icon: <FaLinkedinIn aria-hidden="true" />, prefix: "linkedin.com/in/",
          placeholder: usernamePh, value: extractUsername(social.linkedin, "linkedin.com/in/"),
        })}
        {field("behance", {
          label: "Behance", icon: <FaBehance aria-hidden="true" />, prefix: "behance.net/",
          placeholder: usernamePh, value: extractUsername(social.behance, "behance.net/"),
        })}
        {field("tiktok", {
          label: "TikTok", icon: <FaTiktok aria-hidden="true" />, prefix: "tiktok.com/@",
          placeholder: usernamePh, value: extractUsername(social.tiktok, "tiktok.com/"),
        })}
        {field("youtube", {
          label: "YouTube", icon: <FaYoutube aria-hidden="true" />, prefix: "youtube.com/@",
          placeholder: usernamePh, value: youtubeUsername(social.youtube),
        })}
        {field("pinterest", {
          label: "Pinterest", icon: <FaPinterest aria-hidden="true" />, prefix: "pinterest.com/",
          placeholder: usernamePh, value: extractUsername(social.pinterest, "pinterest.com/"),
        })}
      </Section>

      <Section
        id="sec-redes-webs"
        title={t("editProfile.socialPage.webTitle")}
        help={t("editProfile.socialPage.webHelp")}
      >
        {field("tumblr", {
          label: "Tumblr", icon: <FaTumblr aria-hidden="true" />, type: "url",
          placeholder: "https://username.tumblr.com", value: tumblrValue(social.tumblr),
        })}
        {field("substack", {
          label: "Substack", icon: <SiSubstack aria-hidden="true" />, type: "url",
          placeholder: t("editProfile.placeholderSubstack"), value: social.substack || "",
        })}
        {field("arena", {
          label: "Are.na", icon: <img src={ARENA_ICON} alt="" aria-hidden="true" className="pi-label-img" />, type: "url",
          placeholder: t("editProfile.placeholderArena"), value: social.arena || "",
        })}
      </Section>
    </div>
  );
}
