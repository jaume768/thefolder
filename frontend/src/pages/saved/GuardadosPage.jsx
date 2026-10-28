// pages/saved/GuardadosPage.jsx
// "Guardados" — las imágenes que el usuario guarda de otros creativos,
// ordenadas en carpetas. Una sola página con dos vistas:
//   · Carpetas            (/myprofile/saved)
//   · Todas las imágenes  (/myprofile/saved?vista=imagenes), filtrable por carpeta
//     (/myprofile/saved?carpeta=<id>, o ?carpeta=sin para "Sin carpeta").
// /myprofile/saved/folder/:id (enlaces antiguos) redirige a ?carpeta=<id>.
//
// Modelo de datos (backend): una imagen guardada está en UN sitio —
// User.favorites (= "Sin carpeta") o en los items de UNA carpeta.
// /api/folders/add la saca de favorites; /api/folders/remove la devuelve;
// borrar una carpeta devuelve sus imágenes a favorites. Por eso quitar de
// Guardados una imagen que está en carpeta son 2 llamadas (sacar de la
// carpeta + borrar de favorites), y deshacer, las inversas.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Bookmark, ChevronLeft, ExternalLink, FolderInput, Plus } from "lucide-react";
import api from "../../services/api";
import PanelPageHeader from "../../components/controlPanel/editProfile/ui/PanelPageHeader";
import ConfirmDialog from "../../components/controlPanel/proyectos/ConfirmDialog";
import {
  useBreakpoint, FolderCard, folderActionIcons, ImageItem, MoveOptions, MovePopover,
  FolderNameForm, NamePopover, Sheet, Toast, SelectionBar,
} from "../../components/controlPanel/saved/GuardadosParts";
import "./Guardados.css";

const UNSORTED = "sin";
const TOAST_MS = 3000;
const UNDO_MS = 5000;

const keyOf = (postId, imageUrl) => `${postId}::${imageUrl}`;
const byDateDesc = (a, b) => new Date(b.date || 0) - new Date(a.date || 0);

const normalizeFavorite = (fav) => {
  const postId = String(fav.postId || fav._id || "");
  const imageUrl = fav.savedImage || fav.mainImage || fav.imageUrl || "";
  return {
    key: keyOf(postId, imageUrl), postId, imageUrl, folderId: null,
    title: fav.title || "", creatorUsername: fav.creatorUsername || "", date: fav.savedAt,
  };
};

const normalizeFolder = (f) => ({
  _id: String(f._id),
  name: f.name,
  items: (f.items || []).map((it) => {
    const postId = String(it.postId || "");
    return {
      key: keyOf(postId, it.imageUrl), postId, imageUrl: it.imageUrl, folderId: String(f._id),
      title: it.postTitle || "", creatorUsername: it.creatorUsername || "", date: it.addedAt,
    };
  }).filter((it) => it.postId && it.imageUrl),
});

// Enlaces antiguos /myprofile/saved/folder/:folderId → /myprofile/saved?carpeta=<id>
export function GuardadosFolderRedirect() {
  const { folderId } = useParams();
  return <Navigate to={`/myprofile/saved?carpeta=${encodeURIComponent(folderId || "")}`} replace />;
}

export default function GuardadosPage() {
  const { t } = useTranslation("saved");
  const navigate = useNavigate();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const touch = bp !== "desktop"; // tablet y mobile: sin hover → botón ···

  // ── Datos ──
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]); // "Sin carpeta"
  const [folders, setFolders] = useState([]);     // más reciente primero

  const fetchAll = useCallback(async () => {
    try {
      const [favRes, folderRes] = await Promise.all([
        api.get("/api/users/favorites"),
        api.get("/api/folders"),
      ]);
      setFavorites((favRes.data?.favorites || []).map(normalizeFavorite).filter((it) => it.postId && it.imageUrl));
      setFolders([...(folderRes.data?.folders || [])].reverse().map(normalizeFolder));
    } catch {
      showToast(t("page.loadError"));
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Vista y filtro (en la URL, para poder enlazar una carpeta) ──
  const [params, setParams] = useSearchParams();
  const carpeta = params.get("carpeta");
  const view = carpeta || params.get("vista") === "imagenes" ? "images" : "folders";
  const filter = carpeta || "all";

  const goFolders = () => setParams({});
  const goImages = (f = "all") => setParams(f === "all" ? { vista: "imagenes" } : { carpeta: f });

  // Carpeta del enlace que ya no existe → "Todas"
  useEffect(() => {
    if (loading || !carpeta || carpeta === UNSORTED) return;
    if (!folders.some((f) => f._id === carpeta)) goImages("all");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, carpeta, folders]);

  // ── Derivados ──
  const folderNameById = useMemo(() => new Map(folders.map((f) => [f._id, f.name])), [folders]);

  const allImages = useMemo(() => (
    [...favorites, ...folders.flatMap((f) => f.items)]
      .map((it) => ({ ...it, folderName: it.folderId ? folderNameById.get(it.folderId) || "" : "" }))
      .sort(byDateDesc)
  ), [favorites, folders, folderNameById]);

  const visibleImages = useMemo(() => {
    if (filter === "all") return allImages;
    if (filter === UNSORTED) return allImages.filter((it) => !it.folderId);
    return allImages.filter((it) => it.folderId === filter);
  }, [allImages, filter]);

  const activeFolder = filter !== "all" && filter !== UNSORTED ? folders.find((f) => f._id === filter) : null;
  // Dentro de una carpeta (o "Sin carpeta"): sub-página de Guardados con su
  // "volver a todas las carpetas" (sidebar en desktop, top bar en mobile).
  const inFolder = view === "images" && filter !== "all";
  const folderTitle = activeFolder ? activeFolder.name : t("page.unsorted");
  const imagesLabel = (n) => t("page.images", { count: n });
  const coverOf = (items) => [...items].sort(byDateDesc).map((it) => it.imageUrl);

  // ── Toast ──
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  function showToast(message, action, ms = action ? UNDO_MS : TOAST_MS) {
    clearTimeout(toastTimer.current);
    setToast({ message, action });
    toastTimer.current = setTimeout(() => setToast(null), ms);
  }
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  // ── UI abierta ──
  const [namePopover, setNamePopover] = useState(null); // 'header' | 'tile' | 'rename'
  const [movePopoverKey, setMovePopoverKey] = useState(null);
  const [renaming, setRenaming] = useState({ id: null, value: "" });
  const [sheet, setSheet] = useState(null); // {type:'newFolder'|'folder'|'renameFolder'|'image', ...}
  const [confirm, setConfirm] = useState(null); // {type:'deleteFolder', folder} | {type:'removeMany', items}
  const [busy, setBusy] = useState(false);

  // ── Selección múltiple ──
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const [bulkMoveOpen, setBulkMoveOpen] = useState(false);

  const exitSelection = () => { setSelectionMode(false); setSelected(new Set()); setBulkMoveOpen(false); };
  const toggleSelected = (key) => setSelected((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  const selectedItems = allImages.filter((it) => selected.has(it.key));

  // Salir de la selección al cambiar de vista
  useEffect(() => { if (view !== "images") exitSelection(); }, [view]);

  // ── Acciones: carpetas ──
  const createFolder = async (name) => {
    setBusy(true);
    try {
      const res = await api.post("/api/folders", { name });
      const folder = normalizeFolder(res.data.folder);
      setFolders((prev) => [folder, ...prev]);
      showToast(t("page.folderCreated"));
      return folder;
    } catch {
      showToast(t("page.error"));
      return null;
    } finally {
      setBusy(false);
    }
  };

  const renameFolder = async (id, name) => {
    const prevName = folderNameById.get(id);
    if (!name || name === prevName) return;
    setFolders((prev) => prev.map((f) => (f._id === id ? { ...f, name } : f)));
    try {
      await api.put(`/api/folders/${id}`, { name });
      showToast(t("page.folderRenamed"));
    } catch {
      setFolders((prev) => prev.map((f) => (f._id === id ? { ...f, name: prevName } : f)));
      showToast(t("page.error"));
    }
  };

  const deleteFolder = async (folder) => {
    setBusy(true);
    try {
      await api.delete(`/api/folders/${folder._id}`);
      // Sus imágenes vuelven a "Sin carpeta" (igual que hace el backend)
      const freed = folder.items.map((it) => ({ ...it, folderId: null, date: new Date().toISOString() }));
      setFavorites((prev) => [...freed, ...prev.filter((p) => !freed.some((f) => f.key === p.key))]);
      setFolders((prev) => prev.filter((f) => f._id !== folder._id));
      if (filter === folder._id) goImages("all");
      setConfirm(null);
      showToast(t("page.folderDeleted"));
    } catch {
      showToast(t("page.error"));
    } finally {
      setBusy(false);
    }
  };

  // ── Acciones: imágenes ──
  // Refleja un movimiento en el estado local (sin recargar).
  const applyMove = (items, targetId) => {
    const keys = new Set(items.map((it) => it.key));
    const now = new Date().toISOString();
    const moved = items.map((it) => ({ ...it, folderId: targetId, date: now }));
    setFavorites((prev) => {
      const rest = prev.filter((it) => !keys.has(it.key));
      return targetId ? rest : [...moved, ...rest];
    });
    setFolders((prev) => prev.map((f) => {
      const rest = f.items.filter((it) => !keys.has(it.key));
      return f._id === targetId ? { ...f, items: [...moved, ...rest] } : (rest.length === f.items.length ? f : { ...f, items: rest });
    }));
  };

  const moveItems = async (items, targetId) => {
    const toMove = items.filter((it) => (it.folderId ?? null) !== (targetId ?? null));
    setMovePopoverKey(null);
    setBulkMoveOpen(false);
    setSheet(null);
    if (!toMove.length) return;
    setBusy(true);
    applyMove(toMove, targetId);
    const targetName = targetId ? folderNameById.get(targetId) || "" : t("page.unsorted");
    try {
      await Promise.all(toMove.map(async (it) => {
        if (it.folderId) await api.post("/api/folders/remove", { folderId: it.folderId, postId: it.postId, imageUrl: it.imageUrl });
        if (targetId) await api.post("/api/folders/add", { folderId: targetId, postId: it.postId, imageUrl: it.imageUrl });
      }));
      showToast(toMove.length === 1
        ? t("page.movedTo", { name: targetName })
        : t("page.movedManyTo", { count: toMove.length, name: targetName }));
      if (selectionMode) exitSelection();
    } catch {
      showToast(t("page.error"));
      fetchAll(); // vuelve al estado real del servidor
    } finally {
      setBusy(false);
    }
  };

  const createAndMove = async (items, name) => {
    const folder = await createFolder(name);
    if (folder) await moveItems(items, folder._id);
  };

  // Quitar de Guardados, con "Deshacer" durante 5 s.
  const pendingRemoval = useRef(Promise.resolve());

  const restoreItems = async (items) => {
    clearTimeout(toastTimer.current);
    setToast(null);
    await pendingRemoval.current.catch(() => {});
    setFavorites((prev) => [...items.filter((it) => !it.folderId), ...prev].sort(byDateDesc));
    setFolders((prev) => prev.map((f) => {
      const back = items.filter((it) => it.folderId === f._id);
      return back.length ? { ...f, items: [...back, ...f.items].sort(byDateDesc) } : f;
    }));
    try {
      for (const it of items) {
        await api.post(`/api/users/favorites/${it.postId}`, { imageUrl: it.imageUrl });
        if (it.folderId) await api.post("/api/folders/add", { folderId: it.folderId, postId: it.postId, imageUrl: it.imageUrl });
      }
    } catch {
      showToast(t("page.error"));
      fetchAll();
    }
  };

  const removeItems = (items) => {
    if (!items.length) return;
    const keys = new Set(items.map((it) => it.key));
    setSheet(null);
    setConfirm(null);
    setMovePopoverKey(null);
    setFavorites((prev) => prev.filter((it) => !keys.has(it.key)));
    setFolders((prev) => prev.map((f) => (f.items.some((it) => keys.has(it.key)) ? { ...f, items: f.items.filter((it) => !keys.has(it.key)) } : f)));
    if (selectionMode) exitSelection();

    pendingRemoval.current = Promise.all(items.map(async (it) => {
      if (it.folderId) await api.post("/api/folders/remove", { folderId: it.folderId, postId: it.postId, imageUrl: it.imageUrl });
      await api.delete(`/api/users/favorites/${it.postId}`, { data: { imageUrl: it.imageUrl } });
    }));
    pendingRemoval.current.catch(() => { showToast(t("page.error")); fetchAll(); });

    showToast(
      items.length === 1 ? t("page.removed") : t("page.removedMany", { count: items.length }),
      { label: t("page.undo"), onClick: () => restoreItems(items) },
    );
  };

  const openPost = (item) => navigate(`/post/${item.postId}`, { state: { clickedImageUrl: item.imageUrl } });

  // ── Render: piezas ──
  const newFolderButton = (anchor, className = "") => (
    <span className="gd-anchor">
      <button
        type="button"
        className={className || "nep-ph-btn nep-ph-btn--black"}
        onClick={() => (isMobile ? setSheet({ type: "newFolder" }) : setNamePopover((v) => (v === anchor ? null : anchor)))}
        aria-haspopup="dialog"
        data-gd-trigger
        aria-expanded={namePopover === anchor}
      >
        <Plus size={14} strokeWidth={1.6} aria-hidden="true" />
        {t("page.newFolder")}
      </button>
      {namePopover === anchor && (
        <NamePopover
          t={t}
          className={anchor === "header" ? "gd-popover--right" : ""}
          submitLabel={t("page.create")}
          onSubmit={async (name) => { const f = await createFolder(name); if (f) setNamePopover(null); }}
          onClose={() => setNamePopover(null)}
          busy={busy}
        />
      )}
    </span>
  );

  const headerActions = !loading && (
    <>
      {view === "images" && !selectionMode && allImages.length > 0 && (
        <button type="button" className="nep-ph-btn nep-ph-btn--grey" onClick={() => setSelectionMode(true)}>
          {t("page.select")}
        </button>
      )}
      {newFolderButton("header")}
    </>
  );

  const folderCards = folders.map((f) => {
    const isRenaming = renaming.id === f._id;
    return (
      <FolderCard
        key={f._id}
        name={f.name}
        meta={imagesLabel(f.items.length)}
        images={coverOf(f.items)}
        onOpen={() => goImages(f._id)}
        openLabel={t("page.openFolder", { name: f.name })}
        actions={isMobile ? null : [
          { key: "rename", label: t("page.rename"), icon: folderActionIcons.rename, onClick: () => setRenaming({ id: f._id, value: f.name }) },
          { key: "delete", label: t("page.deleteFolder"), icon: folderActionIcons.delete, onClick: () => setConfirm({ type: "deleteFolder", folder: f }) },
        ]}
        onMore={isMobile ? () => setSheet({ type: "folder", folder: f }) : null}
        moreLabel={t("page.more")}
        renaming={isRenaming}
        renameValue={renaming.value}
        renameLabel={t("page.folderName")}
        onRenameChange={(e) => setRenaming((r) => ({ ...r, value: e.target.value }))}
        onRenameSubmit={() => {
          if (!isRenaming) return;
          const name = renaming.value.trim();
          setRenaming({ id: null, value: "" });
          if (name) renameFolder(f._id, name);
        }}
        onRenameCancel={() => setRenaming({ id: null, value: "" })}
      />
    );
  });

  const renderFoldersView = () => (
    <div className="gd-folders">
      {folderCards}
      {favorites.length > 0 && (
        <FolderCard
          name={t("page.unsorted")}
          meta={t("page.unsortedImages", { count: favorites.length })}
          images={coverOf(favorites)}
          onOpen={() => goImages(UNSORTED)}
          openLabel={t("page.openFolder", { name: t("page.unsorted") })}
        />
      )}
      {/* "Nueva carpeta": siempre la última (en mobile está el "+" de arriba) */}
      <div className="gd-new-tile-wrap gd-anchor">
        <button
          type="button"
          className="gd-new-tile"
          onClick={() => setNamePopover((v) => (v === "tile" ? null : "tile"))}
          aria-haspopup="dialog"
        data-gd-trigger
          aria-expanded={namePopover === "tile"}
        >
          <Plus size={22} strokeWidth={1.6} aria-hidden="true" />
          <span>{t("page.newFolder")}</span>
        </button>
        {namePopover === "tile" && (
          <NamePopover
            t={t}
            submitLabel={t("page.create")}
            onSubmit={async (name) => { const f = await createFolder(name); if (f) setNamePopover(null); }}
            onClose={() => setNamePopover(null)}
            busy={busy}
          />
        )}
      </div>
    </div>
  );

  const chip = (id, label, count) => (
    <button
      key={id}
      type="button"
      className={`gd-chip${filter === id ? " is-on" : ""}`}
      aria-pressed={filter === id}
      onClick={() => goImages(id)}
    >
      {label} <span className="gd-count">{count}</span>
    </button>
  );

  const renderImagesView = () => (
    <div className="gd-images">
      {/* "Todas las carpetas": ya no es un botón aquí, es el `back` de la
          cabecera (icono de Guardados en el sidebar → flecha al hover). */}
      <div className="gd-chips-row">
        <div className="gd-chips" role="group" aria-label={t("page.filters")}>
          {chip("all", t("page.all"), allImages.length)}
          {folders.map((f) => chip(f._id, f.name, f.items.length))}
          {favorites.length > 0 && chip(UNSORTED, t("page.unsorted"), favorites.length)}
        </div>
        {activeFolder && (
          <div className="gd-folder-actions gd-anchor">
            <button
              type="button"
              className="gd-text-btn gd-text-btn--dark"
              data-gd-trigger
              onClick={() => (isMobile ? setSheet({ type: "renameFolder", folder: activeFolder }) : setNamePopover((v) => (v === "rename" ? null : "rename")))}
            >
              {t("page.rename")}
            </button>
            <button type="button" className="gd-text-btn gd-text-btn--dark" onClick={() => setConfirm({ type: "deleteFolder", folder: activeFolder })}>
              {t("page.deleteFolder")}
            </button>
            {namePopover === "rename" && (
              <NamePopover
                t={t}
                className="gd-popover--right"
                initialValue={activeFolder.name}
                submitLabel={t("page.save")}
                onSubmit={(name) => { setNamePopover(null); renameFolder(activeFolder._id, name); }}
                onClose={() => setNamePopover(null)}
                busy={busy}
              />
            )}
          </div>
        )}
      </div>

      {visibleImages.length === 0 ? (
        <div className="gd-empty">
          <Bookmark size={32} strokeWidth={1.6} aria-hidden="true" />
          <p className="gd-empty-title">{t("page.emptyFolderTitle")}</p>
          <p className="gd-empty-text">{t("page.emptyFolderText")}</p>
        </div>
      ) : (
        <div className="gd-masonry">
          {visibleImages.map((item) => (
            <ImageItem
              key={item.key}
              item={item}
              t={t}
              touch={touch}
              showFolderTag={filter === "all" && !isMobile}
              selectionMode={selectionMode}
              selected={selected.has(item.key)}
              moveOpen={movePopoverKey === item.key}
              onOpen={() => openPost(item)}
              onToggleSelect={() => toggleSelected(item.key)}
              onMove={() => setMovePopoverKey((k) => (k === item.key ? null : item.key))}
              onRemove={() => removeItems([item])}
              onMore={() => setSheet({ type: "image", item, step: "actions" })}
              onLongPress={() => { setSelectionMode(true); setSelected(new Set([item.key])); }}
            >
              {movePopoverKey === item.key && (
                <MovePopover
                  t={t}
                  folders={folders}
                  currentFolderId={item.folderId}
                  onSelect={(id) => moveItems([item], id)}
                  onCreate={(name) => createAndMove([item], name)}
                  onClose={() => setMovePopoverKey(null)}
                  busy={busy}
                />
              )}
            </ImageItem>
          ))}
        </div>
      )}
    </div>
  );

  const renderSkeleton = () => (
    <div className={view === "images" ? "gd-masonry" : "gd-folders"} aria-hidden="true">
      {Array.from({ length: 8 }).map((_, i) => (
        view === "images"
          ? <span key={i} className="gd-skel gd-skel--img" style={{ height: [220, 300, 260, 340][i % 4] }} />
          : (
            <span key={i} className="gd-folder">
              <span className="gd-skel gd-skel--square" />
              <span className="gd-skel gd-skel--line" />
            </span>
          )
      ))}
    </div>
  );

  const isEmpty = !loading && allImages.length === 0 && folders.length === 0;

  // ── Sheets (mobile; las de imagen también en tablet) ──
  const renderSheet = () => {
    if (!sheet) return null;
    const close = () => setSheet(null);

    if (sheet.type === "newFolder" || sheet.type === "renameFolder") {
      const renamingFolder = sheet.type === "renameFolder" ? sheet.folder : null;
      return (
        <Sheet label={renamingFolder ? t("page.renameFolder") : t("page.newFolder")} onClose={close}>
          <h2 className="gd-sheet-title">{renamingFolder ? t("page.renameFolder") : t("page.newFolder")}</h2>
          <FolderNameForm
            t={t}
            wide
            initialValue={renamingFolder?.name || ""}
            submitLabel={renamingFolder ? t("page.save") : t("page.create")}
            onSubmit={async (name) => {
              if (renamingFolder) { close(); renameFolder(renamingFolder._id, name); return; }
              const f = await createFolder(name);
              if (f) close();
            }}
            onCancel={close}
            busy={busy}
          />
        </Sheet>
      );
    }

    if (sheet.type === "folder") {
      return (
        <Sheet label={sheet.folder.name} onClose={close}>
          <p className="gd-sheet-heading">{sheet.folder.name}</p>
          <div className="gd-sheet-actions">
            <button type="button" className="gd-sheet-row" onClick={() => setSheet({ type: "renameFolder", folder: sheet.folder })}>
              {folderActionIcons.rename}
              <span>{t("page.renameFolder")}</span>
            </button>
            <button type="button" className="gd-sheet-row gd-sheet-row--danger" onClick={() => { close(); setConfirm({ type: "deleteFolder", folder: sheet.folder }); }}>
              {folderActionIcons.delete}
              <span>{t("page.deleteFolder")}</span>
            </button>
          </div>
          <button type="button" className="gd-btn gd-btn--grey gd-btn--block gd-sheet-cancel" onClick={close}>{t("page.cancel")}</button>
        </Sheet>
      );
    }

    // Imagen
    const { item } = sheet;
    const live = allImages.find((it) => it.key === item.key) || item;
    return (
      <Sheet label={live.title || t("page.moveToFolder")} onClose={close}>
        <div className="gd-sheet-image">
          <span className="gd-sheet-thumb"><img src={live.imageUrl} alt="" /></span>
          {live.creatorUsername
            ? <a className="gd-sheet-user" href={`/${live.creatorUsername}`}>@{live.creatorUsername}</a>
            : <span className="gd-sheet-user">{live.title}</span>}
        </div>

        {sheet.step === "move" ? (
          <MoveOptions
            t={t}
            folders={folders}
            currentFolderId={live.folderId}
            onSelect={(id) => moveItems([live], id)}
            onCreate={(name) => createAndMove([live], name)}
            busy={busy}
          />
        ) : (
          <div className="gd-sheet-actions">
            <button type="button" className="gd-sheet-row" onClick={() => setSheet({ ...sheet, step: "move" })}>
              <FolderInput size={16} strokeWidth={1.6} aria-hidden="true" />
              <span>{t("page.moveToFolder")}</span>
              <span className="gd-sheet-row-aside">{live.folderName || t("page.unsorted")}</span>
            </button>
            <button type="button" className="gd-sheet-row" onClick={() => { close(); openPost(live); }}>
              <ExternalLink size={16} strokeWidth={1.6} aria-hidden="true" />
              <span>{t("page.viewProject")}</span>
            </button>
            <button type="button" className="gd-sheet-row" onClick={() => removeItems([live])}>
              <Bookmark size={16} strokeWidth={1.6} fill="currentColor" aria-hidden="true" />
              <span>{t("page.removeFromSaved")}</span>
            </button>
          </div>
        )}
        <button type="button" className="gd-btn gd-btn--grey gd-btn--block gd-sheet-cancel" onClick={close}>{t("page.cancel")}</button>
      </Sheet>
    );
  };

  return (
    <>
      {/* Top bar mobile — mismo .nep-detail-header/.pl-topbar que "Tus proyectos" */}
      {/* Dentro de una carpeta (o "Sin carpeta"), ‹ vuelve a todas las
          carpetas y el título es el de la carpeta: en mobile la cabecera
          común (con su ←) está oculta, este es el único "volver". */}
      <div className="nep-detail-header pl-topbar">
        <button
          type="button"
          className="pl-topbar-back"
          onClick={inFolder ? goFolders : () => window.history.back()}
          aria-label={inFolder ? t("page.backToFolders") : t("page.back")}
        >
          <ChevronLeft size={20} strokeWidth={1.6} aria-hidden="true" />
        </button>
        <span className="pl-topbar-title">{inFolder ? folderTitle : t("page.title")}</span>
        <div className="pl-topbar-right">
          <button type="button" className="gd-topbar-plus" onClick={() => setSheet({ type: "newFolder" })} aria-label={t("page.newFolder")}>
            <Plus size={20} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className={`nep-main-content gd-scroll${selectionMode ? " is-selecting" : ""}`}>
        <div className="gd-page">
          <PanelPageHeader
            className="gd-head"
            title={t("page.title")}
            subtitle={t("page.subtitle")}
            actions={headerActions}
            // Dentro de una carpeta (o "Sin carpeta"): sub-página de Guardados.
            // En desktop el "volver a todas las carpetas" vive en el sidebar
            // (icono de Guardados → flecha al hover), como en Proyectos y
            // Plantillas; en tablet/mobile, la ← encima del título.
            back={inFolder ? {
              parent: "saved",
              label: t("page.backToFolders"),
              onClick: goFolders,
              current: folderTitle,
            } : undefined}
          />

          {!isEmpty && (
            <div className="gd-switch" role="tablist" aria-label={t("page.views")}>
              <button type="button" role="tab" aria-selected={view === "folders"} className={`gd-tab${view === "folders" ? " is-on" : ""}`} onClick={goFolders}>
                {t("page.tabFolders")} <span className="gd-count">{folders.length}</span>
              </button>
              <button type="button" role="tab" aria-selected={view === "images"} className={`gd-tab${view === "images" ? " is-on" : ""}`} onClick={() => goImages(filter)}>
                {t("page.tabImages")} <span className="gd-count">{allImages.length}</span>
              </button>
            </div>
          )}

          {loading ? renderSkeleton() : isEmpty ? (
            <div className="gd-empty">
              <Bookmark size={32} strokeWidth={1.6} aria-hidden="true" />
              <p className="gd-empty-title">{t("page.emptyTitle")}</p>
              <p className="gd-empty-text">{t("page.emptyText")}</p>
              <button type="button" className="gd-btn gd-btn--grey" onClick={() => navigate("/explorer")}>{t("page.explore")}</button>
            </div>
          ) : view === "folders" ? renderFoldersView() : renderImagesView()}
        </div>
      </div>

      {selectionMode && (
        <SelectionBar
          t={t}
          count={selected.size}
          moveOpen={bulkMoveOpen}
          onToggleMove={() => setBulkMoveOpen((v) => !v)}
          onRemove={() => (selectedItems.length > 1
            ? setConfirm({ type: "removeMany", items: selectedItems })
            : removeItems(selectedItems))}
          onCancel={exitSelection}
        >
          {bulkMoveOpen && (
            <MovePopover
              t={t}
              className="gd-popover--up"
              folders={folders}
              currentFolderId={undefined}
              onSelect={(id) => moveItems(selectedItems, id)}
              onCreate={(name) => createAndMove(selectedItems, name)}
              onClose={() => setBulkMoveOpen(false)}
              busy={busy}
            />
          )}
        </SelectionBar>
      )}

      <Toast toast={toast} raised={selectionMode} />

      {renderSheet()}

      {confirm?.type === "deleteFolder" && (
        <ConfirmDialog
          title={t("page.deleteTitle", { name: confirm.folder.name })}
          warning={t("page.deleteText")}
          confirmLabel={t("page.delete")}
          cancelLabel={t("page.cancel")}
          onConfirm={() => deleteFolder(confirm.folder)}
          onCancel={() => setConfirm(null)}
          busy={busy}
        />
      )}
      {confirm?.type === "removeMany" && (
        <ConfirmDialog
          title={t("page.removeManyTitle", { count: confirm.items.length })}
          warning={t("page.removeManyText")}
          confirmLabel={t("page.remove")}
          cancelLabel={t("page.cancel")}
          onConfirm={() => removeItems(confirm.items)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </>
  );
}
