// components/controlPanel/saved/GuardadosParts.jsx
// Piezas de presentación de "Guardados" (pages/saved/GuardadosPage.jsx).
// Mismo lenguaje que el home del panel, "Tus proyectos" e "Info de perfil":
// Inter Tight, gris tenue #00000006, negro solo para lo principal y lo
// seleccionado, esquinas rectas, sombra solo en popovers. Estilos en
// pages/saved/Guardados.css (.gd-*).
import { useEffect, useRef, useState } from "react";
import {
  Bookmark, Check, ChevronDown, FolderInput, MoreHorizontal, Pencil, Trash2,
} from "lucide-react";

// ── Hooks ───────────────────────────────────────────────────────────────

// mobile ≤768 · tablet 769–992 · desktop >992 (mismos cortes que el panel).
const readBreakpoint = () => {
  if (typeof window === "undefined") return "desktop";
  if (window.matchMedia("(max-width: 768px)").matches) return "mobile";
  if (window.matchMedia("(max-width: 992px)").matches) return "tablet";
  return "desktop";
};

export function useBreakpoint() {
  const [bp, setBp] = useState(readBreakpoint);
  useEffect(() => {
    const onResize = () => setBp(readBreakpoint());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return bp;
}

const FOCUSABLE = 'button:not(:disabled), input:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

// Popovers y sheets: foco al primer elemento al abrir, Tab no sale de
// dentro, Escape y clic fuera cierran. onClose se lee de un ref para que el
// efecto corra solo al montar (llega como función nueva en cada render).
export function useDismiss(ref, onClose, { ignore } = {}) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const el = ref.current;
    const prevFocus = document.activeElement;
    const first = el?.querySelector("input:not(:disabled)") || el?.querySelector(FOCUSABLE);
    first?.focus();

    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); onCloseRef.current(); return; }
      if (e.key !== "Tab" || !el) return;
      const items = el.querySelectorAll(FOCUSABLE);
      if (!items.length) return;
      const a = items[0];
      const b = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    };
    const onDown = (e) => {
      if (el && el.contains(e.target)) return;
      if (ignore && e.target.closest?.(ignore)) return;
      onCloseRef.current();
    };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("mousedown", onDown);
      if (prevFocus && document.contains(prevFocus)) prevFocus.focus?.();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

// ── Carpeta ─────────────────────────────────────────────────────────────

// Portada: mosaico 1:1 de las 3 imágenes más recientes (1 grande a la
// izquierda, 2 apiladas a la derecha). Con 2: la 2.ª ocupa toda la derecha;
// con 1: llena el cuadrado; con 0: gris con un marcador.
export function FolderMosaic({ images }) {
  const shown = images.slice(0, 3);
  return (
    <span className={`gd-mosaic gd-mosaic--${shown.length}`} aria-hidden="true">
      {shown.length === 0
        ? <Bookmark size={22} strokeWidth={1.6} className="gd-mosaic-empty" />
        : shown.map((src, i) => <img key={`${src}-${i}`} src={src} alt="" loading="lazy" decoding="async" />)}
    </span>
  );
}

export function FolderCard({
  name, meta, images, onOpen, openLabel,
  actions,        // [{ key, label, icon, onClick }] — cuadrados blancos (desktop/tablet)
  onMore, moreLabel, // mobile: botón ··· que abre un sheet
  renaming, renameValue, onRenameChange, onRenameSubmit, onRenameCancel, renameLabel,
}) {
  return (
    <div className="gd-folder">
      <div className="gd-folder-cover">
        <button type="button" className="gd-folder-open" onClick={onOpen} aria-label={openLabel}>
          <FolderMosaic images={images} />
        </button>
        {actions?.length > 0 && (
          <div className="gd-hover-actions gd-hover-actions--bottom">
            {actions.map((a) => (
              <button key={a.key} type="button" className="gd-square" onClick={a.onClick} aria-label={a.label}>
                {a.icon}
                <span className="gd-tip" aria-hidden="true">{a.label}</span>
              </button>
            ))}
          </div>
        )}
        {onMore && (
          <button type="button" className="gd-square gd-more" onClick={onMore} aria-label={moreLabel}>
            <MoreHorizontal size={18} strokeWidth={1.6} aria-hidden="true" />
          </button>
        )}
      </div>
      <div className="gd-folder-caption">
        {renaming ? (
          <input
            className="gd-rename-input"
            value={renameValue}
            onChange={onRenameChange}
            aria-label={renameLabel}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); onRenameSubmit(); }
              if (e.key === "Escape") { e.preventDefault(); onRenameCancel(); }
            }}
            onBlur={onRenameSubmit}
          />
        ) : (
          <span className="gd-folder-name">{name}</span>
        )}
        <span className="gd-folder-meta">{meta}</span>
      </div>
    </div>
  );
}

export const folderActionIcons = {
  rename: <Pencil size={16} strokeWidth={1.6} aria-hidden="true" />,
  delete: <Trash2 size={16} strokeWidth={1.6} aria-hidden="true" />,
};

// ── Imagen ──────────────────────────────────────────────────────────────

export function ImageItem({
  item, t, showFolderTag, touch, selectionMode, selected, moveOpen,
  onOpen, onToggleSelect, onMove, onRemove, onMore, onLongPress,
  children, // popover "Mover a" (cuando está abierto)
}) {
  const pressTimer = useRef(null);
  const longPressed = useRef(false);
  const alt = item.title || (item.creatorUsername ? t("page.imageBy", { username: item.creatorUsername }) : "");

  const startPress = () => {
    if (!touch || selectionMode || !onLongPress) return;
    longPressed.current = false;
    pressTimer.current = setTimeout(() => { longPressed.current = true; onLongPress(); }, 500);
  };
  const cancelPress = () => clearTimeout(pressTimer.current);

  const handleClick = () => {
    if (longPressed.current) { longPressed.current = false; return; }
    if (selectionMode) onToggleSelect();
    else onOpen();
  };

  return (
    <div className={`gd-img${selected ? " is-selected" : ""}${moveOpen ? " is-open" : ""}${selectionMode ? " is-selecting" : ""}`}>
      <button
        type="button"
        className="gd-img-open"
        onClick={handleClick}
        onTouchStart={startPress}
        onTouchEnd={cancelPress}
        onTouchMove={cancelPress}
        onContextMenu={(e) => { if (touch) e.preventDefault(); }}
        aria-label={selectionMode ? t("page.selectImage") : (item.title || t("page.viewProject"))}
        aria-pressed={selectionMode ? selected : undefined}
      >
        <img src={item.imageUrl} alt={alt} loading="lazy" decoding="async" />
      </button>

      {selectionMode && (
        <span className={`gd-check${selected ? " is-on" : ""}`} aria-hidden="true">
          {selected && <Check size={14} strokeWidth={2.4} />}
        </span>
      )}

      {!selectionMode && showFolderTag && (
        <span className="gd-tag gd-tag--folder">{item.folderName || t("page.unsorted")}</span>
      )}

      {!selectionMode && !touch && (
        <div className="gd-hover-actions gd-hover-actions--top">
          <button type="button" className="gd-square gd-move-trigger" onClick={onMove} aria-label={t("page.moveToFolder")} aria-haspopup="menu" aria-expanded={moveOpen}>
            <FolderInput size={16} strokeWidth={1.6} aria-hidden="true" />
            <span className="gd-tip" aria-hidden="true">{t("page.moveToFolder")}</span>
          </button>
          <button type="button" className="gd-square" onClick={onRemove} aria-label={t("page.removeFromSaved")}>
            <Bookmark size={16} strokeWidth={1.6} fill="currentColor" aria-hidden="true" />
            <span className="gd-tip" aria-hidden="true">{t("page.removeFromSaved")}</span>
          </button>
        </div>
      )}

      {!selectionMode && !touch && item.creatorUsername && (
        <a
          className="gd-tag gd-tag--creator"
          href={`/${item.creatorUsername}`}
          onClick={(e) => e.stopPropagation()}
          aria-label={t("page.creatorProfile", { username: item.creatorUsername })}
        >
          @{item.creatorUsername}
        </a>
      )}

      {!selectionMode && touch && (
        <button type="button" className="gd-square gd-square--sm gd-more" onClick={onMore} aria-label={t("page.more")}>
          <MoreHorizontal size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      )}

      {children}
    </div>
  );
}

// ── "Mover a" (popover desktop, paso 2 del sheet en mobile) ─────────────
// Mismo componente que "Mover a página" de "Tus proyectos": una fila por
// carpeta (la actual en 600 con ✓), "Sin carpeta" y crear-y-mover abajo.

export function MoveOptions({ t, folders, currentFolderId, onSelect, onCreate, busy }) {
  const [name, setName] = useState("");
  const row = (id, label) => {
    const isCurrent = currentFolderId !== undefined && (currentFolderId ?? null) === id;
    return (
      <button
        key={id ?? "none"}
        type="button"
        role="menuitem"
        className={`gd-move-row${isCurrent ? " is-current" : ""}`}
        onClick={() => onSelect(id)}
        disabled={busy}
      >
        <span className="gd-move-row-label">{label}</span>
        {isCurrent && <Check size={14} strokeWidth={1.6} aria-hidden="true" />}
      </button>
    );
  };
  const submit = () => { const n = name.trim(); if (n && !busy) onCreate(n); };
  return (
    <div className="gd-move">
      <p className="gd-move-label">{t("page.moveTo")}</p>
      <div className="gd-move-list" role="menu">
        {folders.map((f) => row(f._id, f.name))}
        {row(null, t("page.unsorted"))}
      </div>
      <form className="gd-move-create" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input
          className="gd-move-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("page.newFolderInput")}
          aria-label={t("page.folderName")}
        />
        <button type="submit" className="gd-btn gd-btn--black gd-btn--sm" disabled={!name.trim() || busy}>
          {t("page.createAndMove")}
        </button>
      </form>
    </div>
  );
}

export function MovePopover({ onClose, className = "", ...props }) {
  const ref = useRef(null);
  useDismiss(ref, onClose, { ignore: ".gd-move-trigger, .gd-selbar-move-btn" });
  return (
    <div ref={ref} className={`gd-popover gd-popover--move ${className}`} role="dialog" aria-label={props.t("page.moveToFolder")}>
      <MoveOptions {...props} />
    </div>
  );
}

// ── Nombre de carpeta (crear / renombrar) ───────────────────────────────

export function FolderNameForm({ t, initialValue = "", submitLabel, onSubmit, onCancel, busy, wide }) {
  const [value, setValue] = useState(initialValue);
  const ok = value.trim() && value.trim() !== initialValue.trim();
  return (
    <form
      className={`gd-name-form${wide ? " gd-name-form--wide" : ""}`}
      onSubmit={(e) => { e.preventDefault(); if (ok && !busy) onSubmit(value.trim()); }}
    >
      <label className="gd-label" htmlFor="gd-folder-name">{t("page.folderName")}</label>
      <input
        id="gd-folder-name"
        className="gd-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("page.folderNamePlaceholder")}
        maxLength={60}
        autoComplete="off"
      />
      <div className="gd-name-actions">
        {!wide && <button type="button" className="gd-text-btn" onClick={onCancel}>{t("page.cancel")}</button>}
        <button type="submit" className={`gd-btn gd-btn--black${wide ? " gd-btn--block" : ""}`} disabled={!ok || busy}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

export function NamePopover({ onClose, className = "", ignore = "[data-gd-trigger]", ...props }) {
  const ref = useRef(null);
  useDismiss(ref, onClose, { ignore });
  return (
    <div ref={ref} className={`gd-popover gd-popover--name ${className}`} role="dialog" aria-label={props.submitLabel}>
      <FolderNameForm {...props} onCancel={onClose} />
    </div>
  );
}

// ── Sheet (mobile) ──────────────────────────────────────────────────────

export function Sheet({ label, onClose, children }) {
  const ref = useRef(null);
  useDismiss(ref, onClose);
  return (
    <div className="gd-overlay">
      <div ref={ref} className="gd-sheet" role="dialog" aria-modal="true" aria-label={label}>
        <span className="gd-sheet-handle" aria-hidden="true" />
        {children}
      </div>
    </div>
  );
}

// ── Toast ───────────────────────────────────────────────────────────────

export function Toast({ toast, raised }) {
  if (!toast) return null;
  return (
    <div className={`gd-toast${raised ? " is-raised" : ""}`} role="status">
      <span>{toast.message}</span>
      {toast.action && (
        <button type="button" className="gd-toast-action" onClick={toast.action.onClick}>
          {toast.action.label}
        </button>
      )}
    </div>
  );
}

// ── Barra de selección ──────────────────────────────────────────────────

export function SelectionBar({ t, count, moveOpen, onToggleMove, onRemove, onCancel, children }) {
  return (
    <div className="gd-selbar" role="toolbar" aria-label={t("page.selectionToolbar")}>
      <span className="gd-selbar-count">{t("page.selected", { count })}</span>
      <div className="gd-selbar-move">
        <button
          type="button"
          className="gd-selbar-btn gd-selbar-move-btn"
          onClick={onToggleMove}
          disabled={!count}
          aria-haspopup="menu"
          aria-expanded={moveOpen}
        >
          {t("page.moveToFolder")}
          <ChevronDown size={12} strokeWidth={1.6} aria-hidden="true" />
        </button>
        {children}
      </div>
      <button type="button" className="gd-selbar-btn" onClick={onRemove} disabled={!count}>
        {t("page.removeFromSaved")}
      </button>
      <button type="button" className="gd-selbar-btn gd-selbar-btn--muted" onClick={onCancel}>
        {t("page.cancel")}
      </button>
    </div>
  );
}

