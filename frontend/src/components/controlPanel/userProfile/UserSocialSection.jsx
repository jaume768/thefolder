// UserSocialSection.jsx
import React from 'react';
import {
  FaInstagram,
  FaLinkedin,
  FaBehance,
  FaTumblr,
  FaYoutube,
  FaPinterest,
} from 'react-icons/fa';
import { FaTiktok } from "react-icons/fa6";
import { SiSubstack } from "react-icons/si";
import { buildSocialMediaUrl } from '../../../utils/socialMediaUtils';

const UserSocialSection = ({ social }) => {
  // Solo renderizamos la sección si hay al menos una red social
  if (!social || Object.values(social).every((value) => !value)) return null;

  return (
    <section>
      <div className="user-extern-social-links">
        {social?.instagram && (
          <a
            href={buildSocialMediaUrl('instagram', social.instagram)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon instagram"
            aria-label="Instagram"
          >
            <FaInstagram size={24} />
          </a>
        )}

        {social?.linkedin && (
          <a
            href={buildSocialMediaUrl('linkedin', social.linkedin)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon linkedin"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={24} />
          </a>
        )}

        {social?.tiktok && (
          <a
            href={buildSocialMediaUrl('tiktok', social.tiktok)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon tiktok"
            aria-label="TikTok"
          >
            <FaTiktok size={24} />
          </a>
        )}

        {social?.behance && (
          <a
            href={buildSocialMediaUrl('behance', social.behance)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon behance"
            aria-label="Behance"
          >
            <FaBehance size={24} />
          </a>
        )}

        {social?.tumblr && (
          <a
            href={buildSocialMediaUrl('tumblr', social.tumblr)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon tumblr"
            aria-label="Tumblr"
          >
            <FaTumblr size={24} />
          </a>
        )}

        {social?.youtube && (
          <a
            href={buildSocialMediaUrl('youtube', social.youtube)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon youtube"
            aria-label="YouTube"
          >
            <FaYoutube size={24} />
          </a>
        )}

        {social?.pinterest && (
          <a
            href={buildSocialMediaUrl('pinterest', social.pinterest)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon pinterest"
            aria-label="Pinterest"
          >
            <FaPinterest size={24} />
          </a>
        )}

        {social?.substack && (
          <a
            href={buildSocialMediaUrl('substack', social.substack)}
            target="_blank"
            rel="noopener noreferrer"
            className="social-icon substack"
            aria-label="Substack"
          >
            <SiSubstack size={20} />
          </a>
        )}

      </div>
    </section>
  );
};

export default UserSocialSection;
