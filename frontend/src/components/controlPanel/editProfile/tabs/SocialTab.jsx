// src/components/controlPanel/editProfile/tabs/SocialTab.jsx
import React from "react";
import { FaInstagram, FaLinkedinIn, FaBehance, FaTumblr, FaYoutube, FaPinterest } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";

export default function SocialTab({
  draft,
  extractUsername,
  handleSocialUsernameChange,
}) {
  return (
    <div>
      <div className="ux-card-main">
        <h2 className="ux-card-title-h2">Redes sociales</h2>
        <p className="ux-card-subtitle">
          Conecta tu perfil con tus redes profesionales y creativas.<br />
          Facilita que otros usuarios descubran tu trabajo y contacten contigo.
        </p>
      </div>

      <section id="card-redes" className="ux-card">
        <div id="sec-redes-links" className="ux-anchor-target">
          {/* Instagram */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-instagram">
              Instagram
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaInstagram />
              </div>

              <span className="ux-social-prefix">instagram.com/</span>

              <input
                id="social-instagram"
                name="social.instagram"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.instagram, "instagram.com/")}
                onChange={(e) => handleSocialUsernameChange(e, "instagram")}
              />
            </div>
          </div>

          {/* LinkedIn */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-linkedin">
              Linkedin
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaLinkedinIn />
              </div>

              <span className="ux-social-prefix">linkedin.com/in/</span>

              <input
                id="social-linkedin"
                name="social.linkedin"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.linkedin, "linkedin.com/in/")}
                onChange={(e) => handleSocialUsernameChange(e, "linkedin")}
              />
            </div>
          </div>

          {/* Behance */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-behance">
              Behance
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaBehance />
              </div>

              <span className="ux-social-prefix">behance.net/</span>

              <input
                id="social-behance"
                name="social.behance"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.behance, "behance.net/")}
                onChange={(e) => handleSocialUsernameChange(e, "behance")}
              />
            </div>
          </div>

          {/* TikTok */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-tiktok">
              TikTok
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaTiktok />
              </div>

              <span className="ux-social-prefix">tiktok.com/@</span>

              <input
                id="social-tiktok"
                name="social.tiktok"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.tiktok, "tiktok.com/")}
                onChange={(e) => handleSocialUsernameChange(e, "tiktok")}
              />
            </div>
          </div>

          {/* Tumblr */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-tumblr">
              Tumblr
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaTumblr />
              </div>

              <span className="ux-social-prefix">tumblr.com/</span>

              <input
                id="social-tumblr"
                name="social.tumblr"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.tumblr, "tumblr.com/")}
                onChange={(e) => handleSocialUsernameChange(e, "tumblr")}
              />
            </div>
          </div>

          {/* YouTube */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-youtube">
              Youtube
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaYoutube />
              </div>

              <span className="ux-social-prefix">youtube.com/</span>

              <input
                id="social-youtube"
                name="social.youtube"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.youtube, "youtube.com/")}
                onChange={(e) => handleSocialUsernameChange(e, "youtube")}
              />
            </div>
          </div>

          {/* Pinterest */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-pinterest">
              Pinterest
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <FaPinterest />
              </div>

              <span className="ux-social-prefix">pinterest.com/</span>

              <input
                id="social-pinterest"
                name="social.pinterest"
                className="ux-social-field"
                type="text"
                autoComplete="off"
                placeholder="Escribe tu usuario"
                value={extractUsername(draft?.social?.pinterest, "pinterest.com/")}
                onChange={(e) => handleSocialUsernameChange(e, "pinterest")}
              />
            </div>
          </div>
          {/* Substack */}
          <div className="ux-social-row">
            <label className="ux-social-label" htmlFor="social-substack">
              Substack
            </label>

            <div className="ux-social-input">
              <div className="ux-social-iconbox">
                <SiSubstack />
              </div>

              <input
                id="social-substack"
                name="social.substack"
                className="ux-social-field"
                type="url"
                autoComplete="off"
                placeholder="https://tuusuario.substack.com"
                value={draft?.social?.substack || ""}
                onChange={(e) => handleSocialUsernameChange(e, "substack")}
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}