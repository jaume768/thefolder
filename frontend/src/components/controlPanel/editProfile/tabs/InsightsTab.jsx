// components/controlPanel/editProfile/tabs/InsightsTab.jsx
// Página completa de métricas del perfil (/myprofile/edit/insights) — la
// tarjeta "Perspectivas" de HomeTab.jsx se queda solo con el número de
// visitas de este mes + un link aquí; el desglose por origen (instagram/
// directo/otro) no se muestra en ningún sitio a propósito (el backend lo
// sigue guardando por si hace falta más adelante, pero no aporta nada al
// usuario hoy). GET /api/analytics/profile-stats es la misma fuente que ya
// usaba HomeTab.jsx.
//
// Periodo: "Todo" o uno de los últimos 12 meses. Se elige con el selector
// de arriba a la izquierda del bloque principal o pulsando una barra de
// "Visitas por mes" (dentro del mismo bloque). Todo lo de la página sigue
// al periodo: el número grande, la franja de métricas y la gráfica diaria.
// Los seguidores no tienen fecha en el modelo, así que siempre son el total.
//
// Mismo lenguaje que el home (HomeTab.css) e Info de perfil (ProfileInfo.css):
// solo Inter Tight, jerarquía por tamaño/peso, texto #111/#555, bloques gris
// tenue sin bordes ni sombras, esquinas rectas y negro solo para lo que se
// destaca (el periodo elegido). Sin "·" como separador: dos datos seguidos
// van en elementos distintos con gap.
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../../../services/api";
import "./InsightsTab.css";

// Barras en divs (no SVG) — más simple de maquetar/responsive que un chart
// "de verdad" para series pequeñas de una sola medida (visitas). Altura de
// cada barra en % del máximo de la serie, con un mínimo de 2px para que las
// barras en 0 sigan siendo visibles/hoverables. `highlightIndex` va en
// negro; el resto en gris, y en negro al hover/foco. Con `onSelect`, cada
// barra es un botón (elegir mes).
function InsightsBarChart({ title, hint, data, labelFor, tooltipFor, highlightIndex, onSelect, className = "" }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);
  const Col = onSelect ? "button" : "div";
  return (
    <section className={`ins-chart ${className}`.trim()}>
      <div className="ins-chart-head">
        <div className="ins-chart-heading">
          <h2 className="ins-chart-title">{title}</h2>
          {hint && <p className="ins-chart-hint">{hint}</p>}
        </div>
        <span className="ins-chart-total">{total}</span>
      </div>
      <div className="ins-chart-bars">
        {data.map((d, i) => {
          const tip = tooltipFor(d);
          return (
            <Col
              className={`ins-chart-bar-col${i === highlightIndex ? " is-current" : ""}${onSelect ? " is-selectable" : ""}`}
              key={i}
              {...(onSelect
                ? { type: "button", onClick: () => onSelect(i), "aria-pressed": i === highlightIndex }
                : { tabIndex: 0 })}
            >
              <div className="ins-chart-bar-track">
                <div
                  className="ins-chart-bar"
                  style={{ height: `${Math.max(2, (d.count / max) * 100)}%` }}
                />
                <span className="ins-chart-tooltip">
                  <span>{tip.label}</span>
                  <span className="ins-chart-tooltip-value">{tip.value}</span>
                </span>
              </div>
              <span className="ins-chart-bar-label">{labelFor(d)}</span>
            </Col>
          );
        })}
      </div>
    </section>
  );
}

const pad2 = (n) => String(n).padStart(2, "0");

export default function InsightsTab({ draft }) {
  const { t, i18n } = useTranslation("profile");
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  // null = todo; si no, "YYYY-MM" (uno de stats.viewsByMonth).
  const [period, setPeriod] = useState(null);

  useEffect(() => {
    if (!draft?.username) return;
    api.get("/api/analytics/profile-stats")
      .then((r) => setStats(r.data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [draft?.username]);

  const months = stats?.viewsByMonth || [];
  const periodIndex = period ? months.findIndex((m) => m.month === period) : -1;

  const monthName = (key, opts = { month: "long", year: "numeric" }) =>
    new Date(`${key}-01T00:00:00`).toLocaleDateString(i18n.language, opts);

  // Gráfica diaria: con "Todo", los últimos 14 días; con un mes, todos sus
  // días (hasta hoy si es el mes en curso), de viewsDaily.
  const dailyData = useMemo(() => {
    if (!period) return stats?.viewsByDay || [];
    const byDate = new Map((stats?.viewsDaily || []).map((d) => [d.date, d.count]));
    const [y, m] = period.split("-").map(Number);
    const now = new Date();
    const isCurrent = y === now.getFullYear() && m === now.getMonth() + 1;
    const lastDay = isCurrent ? now.getDate() : new Date(y, m, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => {
      const date = `${period}-${pad2(i + 1)}`;
      return { date, count: byDate.get(date) || 0 };
    });
  }, [period, stats]);

  if (loading) {
    return (
      <div className="ins-root" aria-busy="true">
        <span className="ins-skel ins-skel--hero-block" />
        <div className="ins-grid">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="ins-stat">
              <span className="ins-skel ins-skel--num" />
              <span className="ins-skel ins-skel--line" />
            </div>
          ))}
        </div>
        <span className="ins-skel ins-skel--chart" />
      </div>
    );
  }

  const hasNoViews = !stats || stats.totalViews === 0;
  const countIn = (series) => series?.find((m) => m.month === period)?.count ?? 0;

  // Dato principal del periodo + comparación con el mes anterior.
  const heroValue = period ? months[periodIndex]?.count ?? 0 : stats?.totalViews ?? 0;
  const heroLabel = period
    ? t("editProfile.insights.viewsInMonth", { month: monthName(period) })
    : t("editProfile.homeTab.totalViews");
  let delta = null;
  if (period && periodIndex > 0) {
    const prev = months[periodIndex - 1];
    const diff = heroValue - prev.count;
    const month = monthName(prev.month, { month: "long" });
    delta = diff === 0
      ? t("editProfile.insights.vsPrevSame", { month })
      : t(diff > 0 ? "editProfile.insights.vsPrevUp" : "editProfile.insights.vsPrevDown", { diff: Math.abs(diff), month });
  }

  // Media diaria del mes elegido: entre los días que lleva (mes en curso)
  // o todos los del mes.
  const dailyAvg = dailyData.length
    ? Math.round((heroValue / dailyData.length) * 10) / 10
    : 0;

  const savesLink = "/myprofile/edit/insights-saves";
  const projectsLink = "/myprofile/projects/unassigned";
  const metrics = period
    ? [
        // Mes elegido: lo que pasó en ese mes. Seguidores, siempre total.
        // Mismo orden de columnas que con "Todo".
        { key: "avg", value: dailyAvg.toLocaleString(i18n.language), label: t("editProfile.insights.dailyAvg") },
        { key: "followers", value: stats?.followersCount, label: t("editProfile.insights.followersTotal"), to: "/myprofile/community" },
        { key: "saves", value: countIn(stats?.savesByMonth), label: t("editProfile.insights.savesInMonth"), to: savesLink },
        { key: "projects", value: countIn(stats?.postsByMonth), label: t("editProfile.insights.postsInMonth"), to: projectsLink },
      ]
    : [
        // Todo: visitas de este mes sin enlace (el detalle es esta misma
        // página); el resto lleva a su página: seguidores → Comunidad;
        // guardados → Imágenes guardadas; proyectos → Tus proyectos.
        // Etiquetas con la misma forma que las del mes (minúscula, "… en
        // total" / "… publicados") para que al cambiar de periodo solo
        // cambie lo que de verdad cambia.
        { key: "month", value: stats?.profileViewsThisMonth, label: t("editProfile.homeTab.viewsThisMonth") },
        { key: "followers", value: stats?.followersCount, label: t("editProfile.insights.followersTotal"), to: "/myprofile/community" },
        { key: "saves", value: stats?.totalSaves, label: t("editProfile.insights.savesTotal"), to: savesLink },
        { key: "projects", value: stats?.totalPosts, label: t("editProfile.insights.postsInMonth"), to: projectsLink },
      ];

  // Selector de periodo: "Todo" + mes anterior/siguiente. Desde "Todo", ‹
  // entra en el mes en curso (el último de la serie).
  const lastIndex = months.length - 1;
  const goPrev = () => {
    if (!period) setPeriod(months[lastIndex]?.month ?? null);
    else if (periodIndex > 0) setPeriod(months[periodIndex - 1].month);
  };
  const goNext = () => {
    if (period && periodIndex < lastIndex) setPeriod(months[periodIndex + 1].month);
  };
  // Pulsar la barra del mes ya elegido vuelve a "Todo".
  const selectMonth = (i) => setPeriod((p) => (p === months[i].month ? null : months[i].month));

  return (
    <div className="ins-root">
      {/* Bloque principal: periodo arriba a la izquierda, el dato del
          periodo a la derecha y, debajo, las visitas por mes (pulsar una
          barra = elegir ese mes). */}
      <section className="ins-hero">
        <div className="ins-hero-top">
          <div className="ins-period" role="group" aria-label={t("editProfile.nav.insights")}>
            <button
              type="button"
              className={`ins-period-btn${period ? "" : " is-on"}`}
              onClick={() => setPeriod(null)}
              aria-pressed={!period}
            >
              {t("editProfile.insights.periodAll")}
            </button>
            <div className={`ins-period-step${period ? " is-on" : ""}`}>
              <button
                type="button"
                className="ins-period-arrow"
                onClick={goPrev}
                disabled={!!period && periodIndex <= 0}
                aria-label={t("editProfile.insights.prevMonth")}
              >
                <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
              <span className="ins-period-label">
                {period ? monthName(period) : t("editProfile.insights.allTime")}
              </span>
              <button
                type="button"
                className="ins-period-arrow"
                onClick={goNext}
                disabled={!period || periodIndex >= lastIndex}
                aria-label={t("editProfile.insights.nextMonth")}
              >
                <ChevronRight size={16} strokeWidth={1.8} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="ins-hero-num">
            <span className="ins-hero-value">{heroValue}</span>
            <span className="ins-hero-label">{heroLabel}</span>
            {delta && <span className="ins-hero-delta">{delta}</span>}
            {hasNoViews && (
              <p className="ins-hero-hint">
                {t("editProfile.homeTab.shareLinkToStart")}{" "}
                <span className="ins-hero-link">thefolder.es/{draft?.username}</span>
              </p>
            )}
          </div>
        </div>

        <InsightsBarChart
          className="ins-chart--in-hero"
          title={t("editProfile.insights.viewsByMonthTitle")}
          hint={t("editProfile.insights.pickMonthHint")}
          data={months}
          highlightIndex={periodIndex}
          onSelect={selectMonth}
          labelFor={(d) => monthName(d.month, { month: "short" })}
          tooltipFor={(d) => ({ label: monthName(d.month), value: d.count })}
        />
      </section>

      {/* Métricas secundarias del periodo: una sola franja gris (como
          .ht-stats--strip del home), sin una tarjeta por dato. */}
      <div className="ins-grid">
        {metrics.map((m) => {
          const content = (
            <>
              <span className="ins-stat-num">{m.value ?? 0}</span>
              <span className="ins-stat-label">
                {m.label}
                {m.to && <ArrowUpRight className="ins-stat-arrow" size={14} strokeWidth={1.8} aria-hidden="true" />}
              </span>
            </>
          );
          return m.to ? (
            <button key={m.key} type="button" className="ins-stat ins-stat--link" onClick={() => navigate(m.to)}>
              {content}
            </button>
          ) : (
            <div key={m.key} className="ins-stat">{content}</div>
          );
        })}
      </div>

      {/* Visitas por día: últimos 14 días, o los días del mes elegido. */}
      <InsightsBarChart
        title={period
          ? t("editProfile.insights.viewsByDayInMonth", { month: monthName(period) })
          : t("editProfile.homeTab.viewsByDayTitle")}
        data={dailyData}
        // Hoy en negro, tanto en "Todo" como en el mes en curso (en meses
        // pasados no sale hoy, así que ninguna).
        highlightIndex={!period || period === months[lastIndex]?.month ? dailyData.length - 1 : -1}
        labelFor={(d) => new Date(`${d.date}T00:00:00`).getDate()}
        tooltipFor={(d) => ({
          label: new Date(`${d.date}T00:00:00`).toLocaleDateString(i18n.language, { day: "numeric", month: "short" }),
          value: d.count,
        })}
      />
    </div>
  );
}
