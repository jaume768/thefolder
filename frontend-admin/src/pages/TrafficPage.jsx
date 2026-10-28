// Tráfico y navegación (/trafico): quién entra, desde dónde, con qué
// pantalla, a qué horas y cómo se mueve por la web. Datos: GET
// /api/admin/insights (traffic + navigation). Dispositivo, página de
// entrada y navegación se registran desde oct 2026 (Visit.device /
// landingPath, PageView); las visitas anteriores salen como "sin dato".
import {
  useInsights, PageHead, StatStrip, Block, Bars, RankRows, FlowRows, Heatmap, Delta,
  Loading, ErrorNote, fmtNum, pageName,
} from '../components/insights/Insights';

const dayLabel = (d) => new Date(`${d.date}T00:00:00`).getDate();
const dayTip = (d) => new Date(`${d.date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

const DEVICE_NAMES = { mobile: 'Móvil', tablet: 'Tablet', desktop: 'Ordenador', unknown: 'Sin dato (antes de oct 2026)' };
const SOURCE_NAMES = {
  instagram: 'Instagram', tiktok: 'TikTok', twitter: 'X / Twitter', google: 'Google',
  email: 'Email', direct: 'Directo', other: 'Otras webs',
};

const toRows = (obj, names) => Object.entries(obj)
  .filter(([, n]) => n > 0)
  .map(([k, n]) => ({ key: k, label: names[k] || k, count: n }))
  .sort((a, b) => b.count - a.count);

const TrafficPage = () => {
  const { days, setDays, data, error, loading } = useInsights();

  if (loading) return <Loading />;
  if (error) return <div className="ai-page"><ErrorNote text={error} /></div>;

  const { traffic, navigation: nav } = data;
  const peakHour = traffic.byHour.reduce((a, b) => (b.count > a.count ? b : a), { hour: 0, count: 0 });
  const known = traffic.devices.mobile + traffic.devices.tablet + traffic.devices.desktop;

  return (
    <div className="ai-page">
      <PageHead
        title="Tráfico y navegación"
        subtitle="Visitas a la web, desde dónde llegan, con qué pantalla, a qué horas y qué páginas recorren."
        days={days}
        setDays={setDays}
      />

      <StatStrip
        items={[
          { label: 'visitas', value: fmtNum(traffic.visits), extra: <Delta now={traffic.visits} prev={traffic.visitsPrev} /> },
          { label: 'usuarios registrados', value: fmtNum(traffic.visitorsLoggedIn), extra: <span className="ai-delta">distintos, con sesión iniciada</span> },
          { label: 'visitas sin sesión', value: fmtNum(traffic.visitorsAnonymous), extra: <span className="ai-delta">pestañas distintas</span> },
          { label: 'minutos de media', value: fmtNum(traffic.avgMinutesPerVisit), extra: <span className="ai-delta">por visita</span> },
        ]}
      />

      <Block title="Visitas por día" aside={fmtNum(traffic.visits)}>
        <Bars data={traffic.series} labelFor={dayLabel} tipFor={dayTip} />
      </Block>

      <div className="ai-cols-2">
        <Block
          title="Dispositivo"
          hint={known ? `${Math.round((traffic.devices.mobile / known) * 100)}% desde el móvil (de las visitas con dato)` : undefined}
        >
          <RankRows rows={toRows(traffic.devices, DEVICE_NAMES)} total={traffic.visits} />
        </Block>
        <Block title="Desde dónde llegan">
          <RankRows rows={toRows(traffic.sources, SOURCE_NAMES)} total={traffic.visits} />
        </Block>
      </div>

      {/* Horas: hora de España */}
      <h2 className="ai-section-title">Cuándo entran</h2>
      <div className="ai-cols-wide">
        <Block
          title="Visitas por hora del día"
          hint={peakHour.count ? `Hora con más visitas: de ${peakHour.hour}:00 a ${peakHour.hour + 1}:00 (hora de España)` : 'Hora de España'}
        >
          <Bars
            data={traffic.byHour}
            highlight={peakHour.count ? peakHour.hour : -1}
            labelFor={(d) => (d.hour % 3 === 0 ? d.hour : '')}
            tipFor={(d) => `${d.hour}:00 a ${d.hour + 1}:00`}
          />
        </Block>
        <Block title="Día y hora" hint="Más oscuro, más visitas">
          <Heatmap matrix={traffic.heatmap} />
        </Block>
      </div>

      {/* Navegación (PageView) */}
      <h2 className="ai-section-title">Cómo navegan</h2>
      <StatStrip
        items={[
          { label: 'páginas vistas', value: fmtNum(nav.pageviews) },
          { label: 'páginas por visita', value: fmtNum(nav.pagesPerSession) },
          { label: 'se van tras una sola página', value: `${nav.bounceRate}%` },
          { label: 'visitas con navegación', value: fmtNum(nav.sessions), extra: <span className="ai-delta">registradas desde oct 2026</span> },
        ]}
      />

      <div className="ai-cols-wide">
        <Block title="Páginas más vistas" hint="En % del total de páginas vistas">
          <RankRows
            rows={nav.topPages.map((p) => ({ key: p.path, label: pageName(p.path), count: p.views }))}
            total={nav.pageviews}
          />
        </Block>
        <Block title="Recorridos más comunes" hint="De qué página a cuál pasan">
          <FlowRows rows={nav.transitions} labelFor={pageName} />
        </Block>
      </div>

      <div className="ai-cols-2">
        <Block title="Por dónde entran" hint="Primera página de cada visita">
          <RankRows rows={traffic.landingPages.map((p) => ({ key: p.path, label: pageName(p.path), count: p.count }))} total={traffic.visits} />
        </Block>
        <Block title="Dónde se van" hint="Última página de cada visita">
          <RankRows rows={nav.exitPages.map((p) => ({ key: p.path, label: pageName(p.path), count: p.count }))} total={nav.sessions} />
        </Block>
      </div>

      <p className="ai-note">
        Todo es anónimo y agregado: no se guarda qué persona hace cada visita ni qué perfil o proyecto concreto se abre, solo el tipo de página. Dispositivo, horas de entrada por página y navegación se registran desde octubre de 2026.
      </p>
    </div>
  );
};

export default TrafficPage;
