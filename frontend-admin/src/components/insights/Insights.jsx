// Piezas comunes de las páginas de estadísticas del admin (Resumen,
// Tráfico y navegación, Actividad). Mismo lenguaje que Estadísticas del
// panel de usuario (InsightsTab de la web): Inter Tight, bloques gris
// tenue, números en #111 y etiquetas en #555, barras grises con la
// destacada en negro, tooltips negros rectos. Monocromo a propósito: cada
// gráfica es una sola serie o filas con su etiqueta, así que el color
// nunca es lo único que identifica algo. Sin "·" como separador.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import '../../styles/Insights.css';

export const PERIODS = [
  { days: 7, label: '7 días' },
  { days: 30, label: '30 días' },
  { days: 90, label: '90 días' },
  { days: 365, label: '12 meses' },
];

const PERIOD_KEY = 'admin:insightsDays';

// GET /api/admin/insights?days=N. El periodo elegido se recuerda entre
// páginas y visitas (solo comodidad del navegador del admin).
export function useInsights() {
  const [days, setDaysState] = useState(() => {
    try { return Number(localStorage.getItem(PERIOD_KEY)) || 30; } catch { return 30; }
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setError(null);
    api.get(`/api/admin/insights?days=${days}`)
      .then((r) => { if (alive) setData(r.data); })
      .catch(() => { if (alive) setError('No se pudieron cargar las estadísticas.'); });
    return () => { alive = false; };
  }, [days]);

  const setDays = (d) => {
    setDaysState(d);
    try { localStorage.setItem(PERIOD_KEY, String(d)); } catch { /* sin storage */ }
  };

  return { days, setDays, data, error, loading: !data && !error };
}

export const fmtNum = (n) => (n ?? 0).toLocaleString('es-ES');
export const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0);

// Variación respecto al periodo anterior: "+12% vs. periodo anterior".
export function Delta({ now, prev }) {
  if (!prev && !now) return null;
  if (!prev) return <span className="ai-delta">nuevo en este periodo</span>;
  const diff = Math.round(((now - prev) / prev) * 100);
  const cls = diff > 0 ? ' is-up' : diff < 0 ? ' is-down' : '';
  return (
    <span className={`ai-delta${cls}`}>
      {diff > 0 ? '+' : ''}{diff}% vs. periodo anterior
    </span>
  );
}

// Cabecera de página: título + subtítulo a la izquierda, periodo a la derecha.
export function PageHead({ title, subtitle, days, setDays }) {
  return (
    <header className="ai-head">
      <div className="ai-head-text">
        <h1 className="ai-title">{title}</h1>
        {subtitle && <p className="ai-subtitle">{subtitle}</p>}
      </div>
      {setDays && (
        <div className="ai-period" role="group" aria-label="Periodo">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              type="button"
              className={`ai-period-btn${days === p.days ? ' is-on' : ''}`}
              aria-pressed={days === p.days}
              onClick={() => setDays(p.days)}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

// Franja de métricas: una fila gris, una columna por dato.
export function StatStrip({ items }) {
  return (
    <div className="ai-strip" style={{ '--ai-cols': items.length }}>
      {items.map((it) => {
        const inner = (
          <>
            <span className="ai-stat-num">{it.value}</span>
            <span className="ai-stat-label">
              {it.label}
              {it.to && <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" className="ai-stat-arrow" />}
            </span>
            {it.extra}
          </>
        );
        return it.to ? (
          <Link key={it.label} to={it.to} className="ai-stat ai-stat--link">{inner}</Link>
        ) : (
          <div key={it.label} className="ai-stat">{inner}</div>
        );
      })}
    </div>
  );
}

// Bloque gris con título (y total o nota a la derecha).
export function Block({ title, aside, hint, children, className = '' }) {
  return (
    <section className={`ai-block ${className}`.trim()}>
      {(title || aside) && (
        <div className="ai-block-head">
          <div className="ai-block-heading">
            {title && <h2 className="ai-block-title">{title}</h2>}
            {hint && <p className="ai-block-hint">{hint}</p>}
          </div>
          {aside != null && <span className="ai-block-aside">{aside}</span>}
        </div>
      )}
      {children}
    </section>
  );
}

// Barras verticales (una serie). La última, o `highlight`, en negro.
// Tooltip por barra al hover/foco. Con muchas barras solo se etiqueta una
// de cada `labelEvery`.
export function Bars({ data, labelFor, tipFor, highlight, height = 160 }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const hi = highlight ?? data.length - 1;
  const labelEvery = data.length > 60 ? 30 : data.length > 31 ? 7 : data.length > 14 ? 5 : 1;
  return (
    <div className="ai-bars" style={{ height }}>
      {data.map((d, i) => (
        <div key={i} className={`ai-bar-col${i === hi ? ' is-current' : ''}`} tabIndex={0}>
          <div className="ai-bar-track">
            <div className="ai-bar" style={{ height: `${Math.max(1.5, (d.count / max) * 100)}%` }} />
            <span className="ai-tip">
              <span>{tipFor(d)}</span>
              <span className="ai-tip-value">{fmtNum(d.count)}</span>
            </span>
          </div>
          <span className="ai-bar-label">
            {(i % labelEvery === 0 || i === data.length - 1) ? labelFor(d, i) : ''}
          </span>
        </div>
      ))}
    </div>
  );
}

// Filas con barra horizontal: etiqueta, número y % del total. Sirve de
// tabla y de gráfica a la vez (cada fila lleva su nombre).
export function RankRows({ rows, total, empty = 'Sin datos en este periodo.' }) {
  if (!rows.length) return <p className="ai-empty">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <ol className="ai-rows">
      {rows.map((r) => (
        <li key={r.key ?? r.label} className="ai-row">
          <div className="ai-row-line">
            <span className="ai-row-label">{r.label}</span>
            <span className="ai-row-values">
              <span className="ai-row-count">{fmtNum(r.count)}</span>
              {total != null && <span className="ai-row-pct">{pct(r.count, total)}%</span>}
            </span>
          </div>
          <div className="ai-row-track">
            <div className="ai-row-bar" style={{ width: `${(r.count / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ol>
  );
}

// Paso de una página a otra: "origen → destino".
export function FlowRows({ rows, labelFor }) {
  if (!rows.length) return <p className="ai-empty">Sin datos en este periodo.</p>;
  return (
    <ol className="ai-flows">
      {rows.map((r) => (
        <li key={`${r.from}>${r.to}`} className="ai-flow">
          <span className="ai-flow-path">
            <span>{labelFor(r.from)}</span>
            <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            <span>{labelFor(r.to)}</span>
          </span>
          <span className="ai-row-count">{fmtNum(r.count)}</span>
        </li>
      ))}
    </ol>
  );
}

const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// Día de la semana × hora (hora de España). Una sola escala de gris a negro
// (más oscuro = más visitas), con tooltip por celda y leyenda debajo.
export function Heatmap({ matrix }) {
  const max = Math.max(1, ...matrix.flat());
  const shade = (v) => (v === 0 ? 0 : 0.08 + 0.92 * (v / max));
  return (
    <div className="ai-heat">
      <div className="ai-heat-grid">
        <span />
        {Array.from({ length: 24 }, (_, h) => (
          <span key={h} className="ai-heat-hour">{h % 3 === 0 ? h : ''}</span>
        ))}
        {matrix.map((row, d) => (
          <div key={d} className="ai-heat-row">
            <span className="ai-heat-day">{WEEKDAYS[d]}</span>
            {row.map((v, h) => (
              <span key={h} className="ai-heat-cell" tabIndex={0} style={{ '--a': shade(v) }}>
                <span className="ai-tip">
                  <span>{WEEKDAYS[d]} {h}:00</span>
                  <span className="ai-tip-value">{fmtNum(v)}</span>
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
      <div className="ai-heat-legend">
        <span>Menos</span>
        {[0.08, 0.3, 0.55, 0.8, 1].map((a) => (
          <span key={a} className="ai-heat-swatch" style={{ '--a': a }} />
        ))}
        <span>Más</span>
      </div>
    </div>
  );
}

export function Loading() {
  return (
    <div className="ai-page" aria-busy="true">
      <span className="ai-skel" style={{ height: 56, width: 280 }} />
      <span className="ai-skel" style={{ height: 96 }} />
      <div className="ai-cols-2">
        <span className="ai-skel" style={{ height: 240 }} />
        <span className="ai-skel" style={{ height: 240 }} />
      </div>
    </div>
  );
}

export function ErrorNote({ text }) {
  return <p className="ai-error">{text}</p>;
}

// Nombres legibles de los patrones de ruta de la web (PageView.path).
const PAGE_NAMES = {
  '/': 'Landing',
  '/explorer': 'Explorador',
  '/tags/:tag': 'Etiqueta',
  '/post/:id': 'Proyecto',
  '/offers': 'Ofertas',
  '/offers/:offerId': 'Oferta',
  '/JobOfferDetail/:offerId': 'Oferta de empleo',
  '/EducationalOfferDetail/:offerId': 'Oferta de formación',
  '/creatives': 'Creativos',
  '/industry': 'Industria',
  '/fashion': 'Moda',
  '/blog': 'Blog',
  '/magazine': 'Revista',
  '/article/:id': 'Artículo',
  '/templates': 'Plantillas',
  '/login': 'Inicio de sesión',
  '/register': 'Registro',
  '/complete-registration': 'Completar registro',
  '/createPost': 'Subir proyecto',
  '/profile/:username': 'Perfil',
  '/:username': 'Portfolio',
  '/:username/:pageSlug': 'Portfolio: página',
  '/:username/project/:projectSlug': 'Portfolio: proyecto',
  '/:username/about': 'Portfolio: sobre mí',
  '/:username/contact': 'Portfolio: contacto',
  '/myprofile': 'Panel',
  '/myprofile/edit/home': 'Panel: inicio',
  '/myprofile/edit/insights': 'Panel: estadísticas',
  '/myprofile/edit/templates': 'Panel: plantillas',
  '/myprofile/edit/profile-info': 'Panel: info de perfil',
  '/myprofile/saved': 'Guardados',
  '/myprofile/community': 'Comunidad',
  '/myprofile/projects': 'Tus proyectos',
  '/myprofile/settings': 'Ajustes',
  '/otros': 'Otras',
};

export const pageName = (path) => {
  if (!path) return '-';
  if (PAGE_NAMES[path]) return PAGE_NAMES[path];
  const m = path.match(/^\/myprofile\/(edit|projects)\/(.+)$/);
  if (m) return `Panel: ${m[2]}`;
  return path;
};
