import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft } from 'lucide-react';
import ProjectsOrganizerPanel from '../../components/controlPanel/proyectos/ProjectsOrganizerPanel';
import { usePanelShellBinding } from '../../contexts/PanelShellContext';
import api from '../../services/api';

const VALID_OP_TABS = ['pages', 'unassigned'];
const DEFAULT_OP_TAB = 'pages';

// Ruta completa /myprofile/projects/:opTab — cada pestaña (páginas/todos
// los proyectos) vive en su propia URL, igual que /myprofile/edit/:tab (ver
// editProfileTabs.js). Un :opTab desconocido (link viejo, typo) redirige a
// la pestaña por defecto en vez de romper la página. Solo el topbar + el
// binding con PanelSidebar viven aquí — todo el cuerpo (grids,
// crear/renombrar/borrar página, mover/editar/borrar proyecto, reorder...)
// vive en ProjectsOrganizerPanel.jsx, compartido con el overlay equivalente
// del quick action de DaisyFilm (OrganizeProjectsOverlay.jsx).
export default function OrganizeProjectsPage() {
  const { t } = useTranslation('projects');
  const { t: tCommon } = useTranslation('common');
  const navigate = useNavigate();
  const { opTab } = useParams();

  const activeOpTab = VALID_OP_TABS.includes(opTab) ? opTab : DEFAULT_OP_TAB;

  // Classic ("default", o sin profileLayout aún — mismo fallback que
  // ProfileAppearanceTab.jsx) no tiene páginas de portfolio propias. null =
  // todavía no se sabe (primer render); solo se redirige una vez resuelto,
  // para no expulsar a alguien de "pages" antes de confirmar que sí es
  // Classic.
  const [pagesEnabled, setPagesEnabled] = useState(null);
  useEffect(() => {
    let cancelled = false;
    api.get('/api/users/profile')
      .then((res) => {
        if (cancelled) return;
        const profileLayout = res.data?.profileLayout;
        setPagesEnabled(!!profileLayout && profileLayout !== 'default');
      })
      .catch(() => { if (!cancelled) setPagesEnabled(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!VALID_OP_TABS.includes(opTab)) {
      navigate(`/myprofile/projects/${DEFAULT_OP_TAB}`, { replace: true });
      return;
    }
    if (opTab === 'pages' && pagesEnabled === false) {
      navigate('/myprofile/projects/unassigned', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opTab, pagesEnabled]);

  const setActiveOpTab = (tab) => navigate(`/myprofile/projects/${tab}`);

  const { setBinding } = usePanelShellBinding();
  useEffect(() => {
    setBinding({ activeTab: activeOpTab, onTabChange: setActiveOpTab });
    return () => setBinding({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setBinding, activeOpTab]);

  // "Tus proyectos" trae su propia cabecera (desktop) y top bar (mobile) —
  // ver ProjectsLibrary.jsx — así que aquí no se pinta la de siempre.
  if (activeOpTab === 'unassigned') {
    return <ProjectsOrganizerPanel activeTab="unassigned" pagesEnabled={pagesEnabled !== false} variant="library" />;
  }

  return (
    <>
      {/* Mobile: mismo .nep-detail-header que /myprofile/edit (chevron +
          título + relleno) en vez de .nep-topbar — esta página no tiene un
          "índice" propio al que volver (a diferencia de /myprofile/edit),
          así que el chevron simplemente deshace la navegación, igual que el
          .nep-fixed-back-btn universal que sustituye (PanelShellLayout.jsx).
          .nep-topbar se queda para desktop (ver editProfileShell.css: se
          oculta solo en mobile, solo donde existe .nep-detail-header). */}
      <div className="nep-detail-header">
        <button
          type="button"
          className="nep-detail-header-back"
          onClick={() => window.history.back()}
          aria-label={tCommon('actions.back')}
        >
          <ChevronLeft size={20} strokeWidth={1.8} aria-hidden="true" />
        </button>
        <span className="nep-detail-header-title">
          {activeOpTab === 'pages' ? t('title') : t('unassignedTitle')}
        </span>
        <div className="nep-detail-header-close" aria-hidden="true" />
      </div>

      {/* Título, subtítulo y botones: cabecera común dentro del panel
          (withPageHeader), ver ProjectsOrganizerPanel.jsx. */}
      <ProjectsOrganizerPanel activeTab={activeOpTab} pagesEnabled={pagesEnabled !== false} withPageHeader />
    </>
  );
}
