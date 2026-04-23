import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import axios from 'axios';

// Namespaces
import commonES from './locales/es/common.json';
import commonEN from './locales/en/common.json';
import homeES from './locales/es/home.json';
import homeEN from './locales/en/home.json';
import authES from './locales/es/auth.json';
import authEN from './locales/en/auth.json';
import onboardingES from './locales/es/onboarding.json';
import onboardingEN from './locales/en/onboarding.json';
import explorerES from './locales/es/explorer.json';
import explorerEN from './locales/en/explorer.json';
import offersES from './locales/es/offers.json';
import offersEN from './locales/en/offers.json';
import postES from './locales/es/post.json';
import postEN from './locales/en/post.json';
import profileES from './locales/es/profile.json';
import profileEN from './locales/en/profile.json';
import blogES from './locales/es/blog.json';
import blogEN from './locales/en/blog.json';
import magazineES from './locales/es/magazine.json';
import magazineEN from './locales/en/magazine.json';
import landingES from './locales/es/landing.json';
import landingEN from './locales/en/landing.json';
import industryES from './locales/es/industry.json';
import industryEN from './locales/en/industry.json';
import communityES from './locales/es/community.json';
import communityEN from './locales/en/community.json';
import savedES from './locales/es/saved.json';
import savedEN from './locales/en/saved.json';
import creativesES from './locales/es/creatives.json';
import creativesEN from './locales/en/creatives.json';
import fashionES from './locales/es/fashion.json';
import fashionEN from './locales/en/fashion.json';
import modalsES from './locales/es/modals.json';
import modalsEN from './locales/en/modals.json';
import legalES from './locales/es/legal.json';
import legalEN from './locales/en/legal.json';

const resources = {
  es: {
    common: commonES,
    home: homeES,
    auth: authES,
    onboarding: onboardingES,
    explorer: explorerES,
    offers: offersES,
    post: postES,
    profile: profileES,
    blog: blogES,
    magazine: magazineES,
    landing: landingES,
    industry: industryES,
    community: communityES,
    saved: savedES,
    creatives: creativesES,
    fashion: fashionES,
    modals: modalsES,
    legal: legalES,
  },
  en: {
    common: commonEN,
    home: homeEN,
    auth: authEN,
    onboarding: onboardingEN,
    explorer: explorerEN,
    offers: offersEN,
    post: postEN,
    profile: profileEN,
    blog: blogEN,
    magazine: magazineEN,
    landing: landingEN,
    industry: industryEN,
    community: communityEN,
    saved: savedEN,
    creatives: creativesEN,
    fashion: fashionEN,
    modals: modalsEN,
    legal: legalEN,
  },
};

// Normaliza cualquier variante (en-US, en-GB…) a 'en' o 'es'
const normalizeLang = (lng) => {
  if (!lng) return 'es';
  const base = String(lng).toLowerCase().split('-')[0];
  return base === 'en' ? 'en' : 'es';
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    load: 'languageOnly',
    ns: ['common', 'home', 'auth', 'onboarding', 'explorer', 'offers', 'post', 'profile', 'blog', 'magazine', 'landing', 'industry', 'community', 'saved', 'creatives', 'fashion', 'modals', 'legal'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React ya protege contra XSS
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    react: {
      useSuspense: false,
    },
  });

// Forzar normalización si el detector guardó algo tipo 'en-US'
const detected = i18n.language;
const normalized = normalizeLang(detected);
if (detected !== normalized) {
  i18n.changeLanguage(normalized);
}

// Mantener <html lang="..."> y axios Accept-Language sincronizados
const syncLocale = (lng) => {
  const normalized = normalizeLang(lng);
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', normalized);
  }
  // Todas las requests llevan el idioma activo para que el backend
  // (emails, errores, etc.) pueda responder en el idioma correcto.
  axios.defaults.headers.common['Accept-Language'] = normalized;
};
syncLocale(i18n.language);
i18n.on('languageChanged', syncLocale);

export default i18n;
