// components/credits/CreditPersonField.jsx
// "¿Quién es?" de un crédito de proyecto (peopleTags), igual en los tres
// sitios donde se editan créditos: ProjectEditor, EditPostModal y
// CreatePostPage. Antes era un único campo "Nombre o @usuario" y no quedaba
// claro si había que poner el usuario de THEFOLDER, el de Instagram o una
// web. Ahora el paso es explícito:
//   1. Un buscador: usuario de THEFOLDER o nombre.
//   2. La lista separa "En THEFOLDER" (personas con su @usuario) de la
//      opción, siempre al final, "Añadir «nombre» · no está en THEFOLDER".
//   3. Elegida la persona queda como tarjeta (foto/inicial + nombre + si
//      está o no en THEFOLDER) con "Cambiar". Solo si NO está en THEFOLDER
//      se pide su Instagram, con su nombre en la etiqueta.
// Si se escribe un nombre y se sale del campo sin elegir, se guarda como
// persona fuera de THEFOLDER (como antes: no se pierde lo escrito).
//
// Mismos campos de siempre en `person` (name, username, avatar,
// isRegistered, instagram, socialUrl): el backend no cambia. El rol va
// aparte, en cada formulario.
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Search, UserPlus } from "lucide-react";
import api from "../../services/api";
import { clImg } from "../../utils/optimizeImage";
import "./CreditPersonField.css";

const toTitleCase = (text) => {
  const raw = String(text || "").trim();
  if (!raw) return "";
  return raw.replace(/\s+/g, " ").split(" ").map((w) => {
    const l = w.toLowerCase();
    return ["de", "del", "la", "las", "el", "los", "y", "e"].includes(l)
      ? l
      : l.charAt(0).toUpperCase() + l.slice(1);
  }).join(" ");
};

// "instagram.com/ana.lopez/?hl=es", "@ana.lopez" o " ana.lopez " → "ana.lopez"
export const cleanInstagram = (value) => {
  let v = String(value || "").trim();
  const m = v.match(/instagram\.com\/([^/?#\s]+)/i);
  if (m) v = m[1];
  return v.replace(/^@+/, "").replace(/\s+/g, "");
};

const EMPTY = { name: "", username: "", avatar: "", isRegistered: false, instagram: "", socialUrl: "" };

export default function CreditPersonField({ person, onChange, inputClassName = "" }) {
  const { t } = useTranslation("common");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const hintRef = useRef(null);
  const focusAfterClear = useRef(false);
  // Ya se eligió a alguien (de la lista o "añadir"): el guardado al salir
  // del campo no debe pisar esa elección.
  const committed = useRef(false);

  const name = String(person?.name || "").trim();
  const hasPerson = !!name || !!person?.isRegistered;
  const q = query.trim();

  // Búsqueda en THEFOLDER (mismo endpoint que antes), con un pequeño retardo.
  useEffect(() => {
    if (!open || q.replace(/^@/, "").length < 2) { setUsers([]); setLoading(false); return undefined; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/api/users/searchUsers?term=${encodeURIComponent(q.replace(/^@/, ""))}`);
        setUsers(res.data?.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [q, open]);

  // Texto de ayuda del buscador ("Busca su @usuario…"): es largo y en campos
  // estrechos se corta (y el × de la fila tapa el final). Se pinta encima del
  // input (.cpf-hint) en vez de como placeholder nativo para poder moverlo:
  // al hacer clic en el campo vacío se desliza a la izquierda hasta enseñar
  // el final y vuelve, en bucle, hasta que se escribe. Aquí se mide cuánto
  // sobra (--cpf-hint-shift) y se copia el padding/tamaño de letra del input
  // de cada formulario.
  useEffect(() => {
    const input = inputRef.current;
    const hint = hintRef.current;
    if (!input || !hint) return undefined;
    const measure = () => {
      const cs = getComputedStyle(input);
      hint.style.left = cs.paddingLeft;
      hint.style.right = cs.paddingRight;
      hint.style.fontSize = cs.fontSize;
      const shift = Math.max(0, hint.scrollWidth - hint.clientWidth);
      hint.style.setProperty("--cpf-hint-shift", `${shift}px`);
      hint.style.setProperty("--cpf-hint-dur", `${Math.max(2, shift / 30).toFixed(1)}s`);
    };
    measure();
    // La fuente (Inter Tight) puede llegar después y cambiar el ancho.
    document.fonts?.ready.then(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(input);
    return () => ro.disconnect();
  }, [hasPerson, query === ""]);

  // Tras "Cambiar", el foco vuelve al buscador.
  useEffect(() => {
    if (!hasPerson && focusAfterClear.current) {
      focusAfterClear.current = false;
      inputRef.current?.focus();
    }
  }, [hasPerson]);

  const pickUser = (user) => {
    const clean = String(user?.username || "").trim().replace(/^@/, "");
    const fullName = String(user?.fullName || user?.companyName || user?.name || "").trim();
    committed.current = true;
    onChange({
      ...EMPTY,
      name: fullName || toTitleCase(clean),
      username: clean,
      avatar: user?.profile?.profilePicture || "",
      isRegistered: true,
    });
    setQuery("");
    setOpen(false);
  };

  // Persona fuera de THEFOLDER. Si escribió "@algo", se toma como su
  // Instagram y de nombre ese mismo usuario (lo puede cambiar después).
  const addExternal = (raw = q) => {
    const text = String(raw || "").trim();
    if (!text || committed.current) return;
    committed.current = true;
    const isHandle = text.startsWith("@");
    const handle = cleanInstagram(text);
    onChange({
      ...EMPTY,
      name: isHandle ? handle : toTitleCase(text),
      instagram: isHandle ? handle : "",
    });
    setQuery("");
    setOpen(false);
  };

  const clear = () => {
    focusAfterClear.current = true;
    committed.current = false;
    onChange({ ...EMPTY });
  };

  // ── Persona ya elegida: tarjeta + (si no está en THEFOLDER) su Instagram ──
  if (hasPerson) {
    const initial = (name || person?.username || "?").charAt(0).toUpperCase();
    const firstName = name.split(" ")[0] || name;
    const avatar = person?.isRegistered && person?.avatar ? clImg.avatar(person.avatar) : null;
    return (
      <div className="cpf">
        <div className={`cpf-chip${person?.isRegistered ? " is-registered" : ""}`}>
          {avatar
            ? <img src={avatar} alt="" className="cpf-avatar" />
            : <span className="cpf-avatar cpf-avatar--initial" aria-hidden="true">{initial}</span>}
          <span className="cpf-chip-text">
            <span className="cpf-chip-name">{name || `@${person?.username}`}</span>
            <span className="cpf-chip-sub">
              {person?.isRegistered
                ? t("credits.onTheFolder", { username: person?.username })
                : t("credits.notOnTheFolder")}
            </span>
          </span>
          <button type="button" className="cpf-change" onClick={clear}>
            {t("credits.change")}
          </button>
        </div>

        {!person?.isRegistered && (
          <label className="cpf-ig">
            <span className="cpf-ig-label">{t("credits.instagramLabel", { name: firstName })}</span>
            <span className="cpf-ig-field">
              <span className="cpf-ig-at" aria-hidden="true">@</span>
              <input
                className={`${inputClassName} cpf-ig-input`.trim()}
                value={person?.instagram || ""}
                onChange={(e) => onChange({ instagram: cleanInstagram(e.target.value) })}
                placeholder={t("credits.instagramPlaceholder")}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                onMouseDown={(e) => e.stopPropagation()}
              />
            </span>
            <span className="cpf-ig-hint">{t("credits.instagramHint")}</span>
          </label>
        )}
      </div>
    );
  }

  // ── Buscador ───────────────────────────────────────────────────────────
  const showMenu = open && q.replace(/^@/, "").length >= 2;
  return (
    <div className="cpf">
      <span className="cpf-search">
        <Search size={14} strokeWidth={1.8} className="cpf-search-icon" aria-hidden="true" />
        <input
          ref={inputRef}
          className={`${inputClassName} cpf-search-input`.trim()}
          value={query}
          onChange={(e) => { committed.current = false; setQuery(e.target.value); setOpen(true); }}
          onFocus={() => { committed.current = false; setOpen(true); }}
          onBlur={() => {
            // Deja tiempo al clic en una opción; si no eligió nada, lo
            // escrito se guarda como persona fuera de THEFOLDER.
            setTimeout(() => {
              setOpen(false);
              if (query.trim()) addExternal(query);
            }, 150);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); addExternal(); }
            if (e.key === "Escape") setOpen(false);
          }}
          placeholder={t("credits.searchPlaceholder")}
          aria-label={t("credits.searchLabel")}
          autoComplete="off"
          onMouseDown={(e) => e.stopPropagation()}
        />
        {!query && (
          <span ref={hintRef} className="cpf-hint" aria-hidden="true">
            <span className="cpf-hint-text">{t("credits.searchPlaceholder")}</span>
          </span>
        )}
      </span>

      {showMenu && (
        <div className="cpf-menu" role="listbox" onMouseDown={(e) => e.preventDefault()}>
          <p className="cpf-menu-title">{t("credits.onTheFolderTitle")}</p>
          {loading ? (
            <p className="cpf-menu-msg">{t("credits.searching")}</p>
          ) : users.length ? (
            users.slice(0, 6).map((u) => (
              <button
                key={u._id || u.username}
                type="button"
                role="option"
                aria-selected="false"
                className="cpf-option"
                onClick={() => pickUser(u)}
              >
                <img
                  src={clImg.avatar(u.profile?.profilePicture) || "/multimedia/usuarioDefault.jpg"}
                  alt=""
                  className="cpf-avatar"
                />
                <span className="cpf-option-text">
                  <span className="cpf-option-name">{u.fullName || u.companyName || u.name || u.username}</span>
                  <span className="cpf-option-sub">@{u.username}</span>
                </span>
              </button>
            ))
          ) : (
            <p className="cpf-menu-msg">{t("credits.noMatches")}</p>
          )}

          <button
            type="button"
            role="option"
            aria-selected="false"
            className="cpf-option cpf-option--external"
            onClick={() => addExternal()}
          >
            <span className="cpf-avatar cpf-avatar--icon" aria-hidden="true">
              <UserPlus size={14} strokeWidth={1.8} />
            </span>
            <span className="cpf-option-text">
              <span className="cpf-option-name">{t("credits.addExternal", { name: q.startsWith("@") ? cleanInstagram(q) : toTitleCase(q) })}</span>
              <span className="cpf-option-sub">{t("credits.addExternalSub")}</span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
