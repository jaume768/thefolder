import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SITE_URL = 'https://thefolder.es';
const SUFFIX = '| THEFOLDER';

// Paths where the page component sets its own title/canonical
const DYNAMIC_PREFIXES = [
  '/post/',
  '/tags/',
  '/article/',
  '/JobOfferDetail/',
  '/EducationalOfferDetail/',
  '/profile/',
];

// Páginas fuera del panel — títulos estáticos (no dependen del idioma
// del panel de usuario, son las páginas públicas del sitio).
const STATIC_PAGES = {
  '/explorer': {
    title: 'Explorador',
    description: 'Explora los mejores portfolios y proyectos creativos de moda en THEFOLDER.',
  },
  '/creatives': {
    title: 'Creativos',
    description: 'Directorio de creativos de moda: diseñadores, estilistas, fotógrafos y más profesionales del sector.',
  },
  '/offers': {
    title: 'Ofertas',
    description: 'Ofertas de trabajo en moda y diseño. Conecta con las mejores empresas del sector.',
  },
  '/createPost': {
    title: 'Nuevo post',
    description: null,
  },
  '/createOffer': {
    title: 'Nueva oferta',
    description: null,
  },
  '/createEducationalOffer': {
    title: 'Nueva oferta formativa',
    description: null,
  },
  '/industry': {
    title: 'Industria',
    description: 'Marcas, empresas y profesionales del sector de la moda en THEFOLDER.',
  },
  '/fashion': {
    title: 'Moda',
    description: 'Lo mejor de la moda y el diseño en THEFOLDER.',
  },
  '/blog': {
    title: 'Blog',
    description: 'Artículos, tendencias y novedades del mundo de la moda en el blog de THEFOLDER.',
  },
  '/magazine': {
    title: 'Revista',
    description: 'La revista de moda de THEFOLDER: editoriales, tendencias y perfiles de creativos.',
  },
  '/legal': {
    title: 'Aviso legal',
    description: 'Aviso legal de THEFOLDER.',
  },
  '/privacy': {
    title: 'Privacidad',
    description: 'Política de privacidad de THEFOLDER.',
  },
  '/cookies': {
    title: 'Cookies',
    description: 'Política de cookies de THEFOLDER.',
  },
  '/terminos': {
    title: 'Términos',
    description: 'Términos y condiciones de uso de THEFOLDER.',
  },
  '/contact': {
    title: 'Contacto',
    description: 'Contacta con el equipo de THEFOLDER.',
  },
  '/about': {
    title: 'Acerca de',
    description: 'Conoce THEFOLDER, la plataforma de referencia para creativos y profesionales de la moda.',
  },
  '/templates': {
    title: 'Plantillas',
    description: 'Descubre las plantillas de portfolio disponibles en THEFOLDER para mostrar tu trabajo creativo.',
  },
  '/': {
    title: null, // keep index.html default
    description: null,
  },
  '/login': {
    title: null,
    description: null,
  },
};

const STATIC_PREFIX_PAGES = [
  ['/offers/',           { title: 'Ofertas',   description: null }],
  ['/offer/',            { title: 'Ver oferta', description: null }],
  ['/edit-offer/',       { title: 'Editar oferta', description: null }],
  ['/edit-educational-offer/', { title: 'Editar oferta formativa', description: null }],
];

function getPage(pathname, pages, prefixPages) {
  if (pages[pathname] !== undefined) return { page: pages[pathname], canonical: pathname };

  for (const [prefix, page] of prefixPages) {
    if (pathname.startsWith(prefix)) return { page, canonical: pathname };
  }

  return null;
}

export default function RouteTitle() {
  const { pathname } = useLocation();
  const { t: tSaved } = useTranslation('saved');
  const { t: tCommunity } = useTranslation('community');
  const { t: tProfile } = useTranslation('profile');
  const { t: tOffers } = useTranslation('offers');

  const isDynamic = DYNAMIC_PREFIXES.some(p => pathname.startsWith(p));

  // Páginas del panel — el título del navegador debe seguir el idioma
  // activo, igual que el <h1> que se ve en cada una de ellas.
  const match = useMemo(() => {
    if (isDynamic) return null;

    const PAGES = {
      ...STATIC_PAGES,
      '/myprofile/community': { title: tCommunity('title'), description: null },
      '/myprofile/saved': { title: tSaved('title'), description: null },
      '/myprofile/edit': { title: tProfile('editProfile.nav.profile'), description: null },
      '/myprofile/offers': { title: tOffers('myOffers.title'), description: null },
      '/myprofile/settings': { title: tProfile('editProfile.nav.settings'), description: null },
      '/profile': { title: tProfile('editProfile.nav.profile'), description: null },
    };

    const PREFIX_PAGES = [
      ...STATIC_PREFIX_PAGES,
      ['/myprofile/saved/folder/', { title: tSaved('title'), description: null }],
      ['/myprofile/projects/', { title: tProfile('editProfile.nav.projects'), description: null }],
      ['/myprofile/',{ title: tProfile('editProfile.nav.profile'), description: null }],
    ];

    return getPage(pathname, PAGES, PREFIX_PAGES);
  }, [pathname, isDynamic, tSaved, tCommunity, tProfile, tOffers]);

  const page = match?.page ?? null;
  const canonical = match?.canonical ?? null;

  useEffect(() => {
    if (isDynamic || !page) return;
    if (!page.title) return; // keep index.html default (e.g. '/')
    document.title = `${page.title} ${SUFFIX}`;
  }, [pathname, isDynamic, page]);

  if (!page || isDynamic) return null;

  return (
    <Helmet>
      {canonical && <link rel="canonical" href={`${SITE_URL}${canonical}`} />}
      {page.description && <meta name="description" content={page.description} />}
    </Helmet>
  );
}
