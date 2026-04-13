import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clImg } from "../../utils/optimizeImage";

const Industry = () => {
  const navigate = useNavigate();


  // ====== DATA (desde panel/backend) ======
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setLoadError("");

        // ✅ Cambia esto por tu endpoint real
        const res = await fetch("http://localhost:5000/api/industry");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();

        const raw =
        Array.isArray(data) ? data :
        Array.isArray(data.industries) ? data.industries :
        Array.isArray(data.industry) ? data.industry :
        [];

        const normalized = raw.map((x) => ({
        id: x._id ?? x.id ?? crypto.randomUUID(),
        name: x.name ?? "",
        city: x.city ?? "",
        country: x.country ?? "",
        category: x.category ? [x.category] : [],
        imageUrl: x.image ?? x.imageUrl ?? "",      // 👈 en tu DB es "image"
        websiteUrl: x.link ?? x.websiteUrl ?? "",   // 👈 en tu DB es "link"
        profileUrl: x.profileUrl ?? "",
        }));

        setItems(normalized);
      } catch (e) {
        if (!mounted) return;
        setLoadError(
          "No se pudieron cargar los perfiles de industria. Revisa el endpoint /api/industry.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  // ====== FILTROS estilo tags ======
  const [tagFilters, setTagFilters] = useState({
    search: "",
    country: [],
    city: [],
    category: [],
  });

  const [openSections, setOpenSections] = useState({
    country: false,
    city: false,
    category: false,
  });

  const toggleSection = (key) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const toggleTag = (key, tag) => {
    setTagFilters((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(tag);
      const next = exists ? current.filter((t) => t !== tag) : [...current, tag];
      return { ...prev, [key]: next };
    });
  };

  const removeTag = (key, tag) => {
    setTagFilters((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((t) => t !== tag),
    }));
  };

  const clearAll = () => {
    setTagFilters({ search: "", country: [], city: [], category: [] });
    setOpenSections({ country: false, city: false, category: false });
  };

  // ✅ Opciones derivadas de los items cargados
  const FILTER_OPTIONS = useMemo(() => {
    const uniq = (arr) => Array.from(new Set(arr.filter(Boolean))).sort();

    return {
      country: uniq(items.map((x) => x.country)),
      city: uniq(items.map((x) => x.city)),
      category: uniq(items.flatMap((x) => x.category || [])),
    };
  }, [items]);

  const activeChips = [
    ...(tagFilters.country || []).map((v) => ({ key: "country", label: v })),
    ...(tagFilters.city || []).map((v) => ({ key: "city", label: v })),
    ...(tagFilters.category || []).map((v) => ({ key: "category", label: v })),
  ];

  const hasActiveFilters = useMemo(() => {
    return (
      String(tagFilters.search || "").trim().length > 0 ||
      activeChips.length > 0
    );
  }, [tagFilters.search, activeChips.length]);

  const renderTagSection = (key, label) => {
    const selectedCount = (tagFilters[key] || []).length;
    const isSelected = selectedCount > 0;
    const isOpen = !!openSections[key];
    const indicator = isOpen ? "/" : "+";

    const cls = (base) =>
      [base, isOpen ? "is-open" : "", isSelected ? "has-selection" : ""]
        .filter(Boolean)
        .join(" ");

    return (
      <div className="filter-section">
        <button
          type="button"
          className={cls("filter-section-trigger")}
          onClick={() => toggleSection(key)}
          aria-expanded={isOpen}
        >
          <span className={cls("filter-section-label")}>
            {label}
            {isSelected && ` (${selectedCount})`}
          </span>
          <span className={cls("filter-section-indicator")}>{indicator}</span>
        </button>
      </div>
    );
  };

  const renderFilterTriggersRow = () => (
    <div className="filters-triggers-row">
      {renderTagSection("country", "País")}
      {renderTagSection("city", "Ciudad")}
      {renderTagSection("category", "Categoría")}
    </div>
  );

  const renderOpenTagsArea = () => {
    const keys = ["country", "city", "category"];
    const openKeys = keys.filter((k) => openSections[k]);
    if (openKeys.length === 0) return null;

    return (
      <div className="filters-open-area">
        {openKeys.map((key, idx) => {
          const tags = (FILTER_OPTIONS[key] || []).filter(Boolean);
          return (
            <React.Fragment key={key}>
              {idx > 0 && <span className="filters-open-separator">/</span>}
              <div className={`filters-open-block filters-open-block--${key}`}>
                <div className="filters-open-tags">
                  {tags.map((tag) => {
                    const selected = (tagFilters[key] || []).includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        className={`filter-tag ${selected ? "selected" : ""}`}
                        onClick={() => toggleTag(key, tag)}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // ✅ Filtrado
  const filteredItems = useMemo(() => {
    const search = String(tagFilters.search || "").trim().toLowerCase();

    const matchAny = (selected = [], valueOrArray) => {
      if (!selected.length) return true;
      if (Array.isArray(valueOrArray)) {
        return valueOrArray.some((v) => selected.includes(v));
      }
      return selected.includes(valueOrArray);
    };

    return items.filter((x) => {
      const hay = `${x.name} ${x.city} ${x.country} ${(x.category || []).join(" ")}`.toLowerCase();
      if (search && !hay.includes(search)) return false;

      if (!matchAny(tagFilters.country, x.country)) return false;
      if (!matchAny(tagFilters.city, x.city)) return false;
      if (!matchAny(tagFilters.category, x.category)) return false;

      return true;
    });
  }, [items, tagFilters]);

  // ✅ Click: redirige al perfil (externo o interno)
  const handleCardClick = (item) => {
    // Si tienes perfil interno
    if (item.profileUrl) {
      navigate(item.profileUrl);
      return;
    }

    // Si es externo (web)
    if (item.websiteUrl) {
      window.open(item.websiteUrl, "_blank", "noopener,noreferrer");
      return;
    }

    // fallback
    navigate("/", { state: { showRegister: true } });
  };

  return (
    <div className="fashion-container">


      <main className="main-content">
        <p className="creatives-subtitle">
          Directorio de industria de la moda. Encuentra empresas y perfiles por
          país, ciudad y categoría. ¿Quieres aparecer aquí? Escríbenos a info@thefolder.es.
        </p>

        <div className="explorer-header">
          <h1 className="centerTitle">
            Industria{" "}
            <span className="creatives-count">
              [{loading ? "…" : filteredItems.length}]
            </span>
          </h1>
        </div>

        {/* Search input (si lo quieres igual que otras páginas) */}
        <div className="explorer-search">
          <input
            value={tagFilters.search}
            onChange={(e) =>
              setTagFilters((p) => ({ ...p, search: e.target.value }))
            }
            placeholder="Buscar por nombre, ciudad, país o categoría…"
          />
        </div>

        {renderFilterTriggersRow()}
        <div className="creatives-toolbar">{renderOpenTagsArea()}</div>

        {loadError && (
          <div style={{ padding: 12 }}>
            <p>{loadError}</p>
          </div>
        )}

        {/* ✅ Grid */}
        <div className="explorer-content">
          <div className="explorer-grid">
            {!loading &&
              filteredItems.map((item) => (
                <article
                  key={item.id}
                  className="masonry-item"
                  onClick={() => handleCardClick(item)}
                  role="button"
                  tabIndex={0}
                >
                  {!!item.imageUrl && (
                    <img
                      src={clImg.post(item.imageUrl)}
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}

                  <div className="user-profile-hover">
                    <div className="user-info-hover">
                      <span className="masonry-caption">
                        {item.city}, {item.country} /
                      </span>
                      <div className="masonry-caption">{item.name}</div>
                    </div>

                    {item.category?.length ? (
                      <p className="masonry-caption mono">{`[${item.category.join(", ")}]`}</p>
                    ) : null}
                  </div>
                </article>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Industry;