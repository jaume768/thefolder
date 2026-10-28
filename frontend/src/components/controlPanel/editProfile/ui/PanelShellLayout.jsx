import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import PanelSidebar from "./PanelSidebar";
import { PanelShellProvider } from "../../../../contexts/PanelShellContext";
// El shell (sidebar + tab bar mobile) trae su propio CSS: antes solo lo
// importaban las páginas de dentro (lazy), así que la primera vez el sidebar
// se pintaba sin estilos hasta que llegaba el chunk de la página.
import "../../css/editProfileShell.css";
import { RouteSkeleton } from "../../../skeleton/PageSkeleton";

// activePage se deriva de la URL (una sola fuente de verdad) en vez de que
// cada página lo repita como prop — antes 8 copias del mismo valor.
function derivePanelActivePage(pathname) {
  if (pathname.startsWith("/myprofile/settings")) return "settings";
  if (pathname.startsWith("/myprofile/edit")) return "edit";
  if (pathname.startsWith("/myprofile/saved")) return "guardados";
  if (pathname.startsWith("/myprofile/community")) return "community";
  if (pathname.startsWith("/myprofile/projects")) return "proyectos";
  return "edit";
}

export default function PanelShellLayout() {
  const location = useLocation();
  const activePage = useMemo(
    () => derivePanelActivePage(location.pathname),
    [location.pathname]
  );

  const [binding, setBinding] = useState({});
  // Sub-página abierta (ver PanelShellContext.jsx) — aparte de binding para
  // que ProfileEditPage (que reescribe binding entero) no la pise.
  const [subPage, setSubPage] = useState(null);
  const contextValue = useMemo(
    () => ({ binding, setBinding, subPage, setSubPage }),
    [binding, subPage]
  );

  // Solo "edit" (los tabs de /myprofile/edit) tiene un índice real: "home" es
  // el índice, cualquier otro tab es detalle — eso lo decide ProfileEditPage
  // vía binding.mobileDetailOpen. El resto de páginas del panel (settings,
  // guardados, community, proyectos) no tienen índice propio: siempre son
  // pantalla de detalle en mobile, así que no necesitan registrar nada — solo
  // .nep-fixed-back-btn (universal) y su propio <h1 className="nep-main-title">
  // (que ya traen todas, ver ProfileSettingsPage.jsx etc.) hacen el resto.
  const mobileDetailOpen = activePage === "edit" ? binding.mobileDetailOpen : "true";

  // Mobile: la cabecera de detalle (.nep-detail-header) se esconde al bajar
  // y vuelve al subir — mismo comportamiento que MobileTopHeader (umbral de
  // 8px acumulados, siempre visible arriba del todo). Escucha en captura el
  // scroll de cualquier contenedor dentro de .nep-main (.nep-main-content,
  // .pl-scroll...). El CSS (solo ≤768px) la pliega con margin-top negativo,
  // así el contenido sube y ocupa su hueco.
  // body.nep-in-panel: en mobile el panel no lleva MobileTopHeader (ni su
  // hueco) — se sale al explorador con el "T/" de la barra de pestañas y
  // cada página trae su propia cabecera (ver editProfileShell.css).
  useEffect(() => {
    document.body.classList.add("nep-in-panel");
    return () => document.body.classList.remove("nep-in-panel");
  }, []);

  const mainRef = useRef(null);
  const [detailHeaderHidden, setDetailHeaderHidden] = useState(false);

  useEffect(() => {
    setDetailHeaderHidden(false);
  }, [location.pathname]);

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return undefined;
    const THRESHOLD = 8;
    let anchorY = 0;
    let ticking = false;

    const onScroll = (e) => {
      const el = e.target;
      if (!(el instanceof HTMLElement) || ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const header = main.querySelector(".nep-detail-header");
        if (!header) return;
        const y = el.scrollTop;
        if (y <= THRESHOLD) {
          anchorY = y;
          setDetailHeaderHidden(false);
          return;
        }
        const delta = y - anchorY;
        if (delta > THRESHOLD) {
          anchorY = y;
          // Solo si hay scroll de sobra: si no, al plegarla el contenedor
          // crece, el scroll se recorta y vuelve a salir (parpadeo).
          const h = header.offsetHeight;
          if (el.scrollHeight - el.clientHeight <= h + THRESHOLD * 2) return;
          if (h) main.style.setProperty("--nep-dh-h", `${h}px`);
          setDetailHeaderHidden(true);
        } else if (delta < -THRESHOLD) {
          anchorY = y;
          setDetailHeaderHidden(false);
        }
      });
    };

    main.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => main.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  return (
    <PanelShellProvider value={contextValue}>
      {/* data-mobile-detail se omite por completo (undefined) en /myprofile/edit
          hasta que ProfileEditPage lo registre — si quedara "false" colgando en
          otra página, el CSS de mobile le ocultaría .nep-main (ver plan). */}
      <div className="nep-shell" data-mobile-detail={mobileDetailOpen}>
        <PanelSidebar
          activePage={activePage}
          activeTab={binding.activeTab}
          onTabChange={binding.onTabChange}
          greetingUser={binding.greetingUser}
          subPage={subPage}
        />
        {/* nep-main--enter: entrada animada en cascada de cabecera y bloques
            de cada página (ver "Entrada animada" en editProfileShell.css).
            Comunidad se queda fuera. */}
        <main
          ref={mainRef}
          className={`nep-main${activePage !== "community" ? " nep-main--enter" : ""}`}
          data-detail-hidden={detailHeaderHidden ? "true" : undefined}
        >
          {/* Universal: vuelve a lo anterior sin importar si fue un cambio de
              página o (en /myprofile/edit) un cambio de pestaña — ambos
              empujan una entrada de historial real, así que history.back()
              deshace lo uno o lo otro indistintamente. Fijo en la esquina del
              panel (no del viewport), así nunca se mete en la zona del
              sidebar ni se mueve con el scroll de .nep-main-content. */}
          <button
            type="button"
            className="gf-back-btn nep-fixed-back-btn"
            onClick={() => window.history.back()}
            aria-label="Volver"
          >
            <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
          </button>
          {/* La página del panel (lazy) carga con su skeleton; el sidebar
              se queda. */}
          <Suspense fallback={<RouteSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </PanelShellProvider>
  );
}
