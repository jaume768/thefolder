// Resumen (/): la foto general de la plataforma en el periodo elegido —
// cuántas personas hay y entran, qué suben, qué se guarda y qué queda
// pendiente de revisar. El detalle de visitas está en Tráfico y navegación
// y el de contenido/usuarios en Actividad. Datos: GET /api/admin/insights.
import {
  useInsights, PageHead, StatStrip, Block, Bars, RankRows, Delta, Loading, ErrorNote, fmtNum, pct,
} from '../components/insights/Insights';

const dayLabel = (d) => new Date(`${d.date}T00:00:00`).getDate();
const dayTip = (d) => new Date(`${d.date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

const TYPE_NAMES = { creative: 'Creativos', industry: 'Industria', guest: 'Invitados' };
const LEVEL_NAMES = { 1: 'Nivel 1', 2: 'Nivel 2', 3: 'Nivel 3', 4: 'Nivel 4 (profesional)', 5: 'Nivel 5' };

const DashboardPage = () => {
  const { days, setDays, data, error, loading } = useInsights();

  if (loading) return <Loading />;
  if (error) return <div className="ai-page"><ErrorNote text={error} /></div>;

  const { users, traffic, content, offers, moderation } = data;
  const typeRows = Object.entries(users.byType)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => ({ key: k, label: TYPE_NAMES[k] || 'Sin tipo', count: n }))
    .sort((a, b) => b.count - a.count);
  const apps = offers.applications;
  const appsTotal = apps.pending + apps.reviewed + apps.accepted + apps.rejected;

  return (
    <div className="ai-page">
      <PageHead
        title="Resumen"
        subtitle="Cómo va THEFOLDER en el periodo elegido, comparado con el periodo anterior de la misma duración."
        days={days}
        setDays={setDays}
      />

      {/* Lo principal del periodo */}
      <StatStrip
        items={[
          { label: 'visitas', value: fmtNum(traffic.visits), to: '/trafico', extra: <Delta now={traffic.visits} prev={traffic.visitsPrev} /> },
          { label: 'usuarios nuevos', value: fmtNum(users.new), to: '/usuarios', extra: <Delta now={users.new} prev={users.newPrev} /> },
          { label: 'proyectos subidos', value: fmtNum(content.postsNew), to: '/actividad', extra: <Delta now={content.postsNew} prev={content.postsNewPrev} /> },
          { label: 'imágenes guardadas', value: fmtNum(content.saves), to: '/actividad', extra: <Delta now={content.saves} prev={content.savesPrev} /> },
        ]}
      />

      <div className="ai-cols-2">
        <Block title="Visitas por día" aside={fmtNum(traffic.visits)}>
          <Bars data={traffic.series} labelFor={dayLabel} tipFor={dayTip} />
        </Block>
        <Block title="Usuarios nuevos por día" aside={fmtNum(users.new)}>
          <Bars data={users.newSeries} labelFor={dayLabel} tipFor={dayTip} />
        </Block>
      </div>

      {/* Comunidad: tamaño y calidad de los perfiles (totales, no del periodo) */}
      <h2 className="ai-section-title">Comunidad</h2>
      <StatStrip
        items={[
          { label: 'usuarios en total', value: fmtNum(users.total), to: '/usuarios' },
          { label: 'han entrado en el periodo', value: `${pct(users.activeInRange, users.total)}%`, extra: <span className="ai-delta">{fmtNum(users.activeInRange)} personas</span> },
          { label: 'con algún proyecto', value: `${pct(users.withProjects, users.total)}%`, extra: <span className="ai-delta">{fmtNum(users.withProjects)} personas</span> },
          { label: 'perfil completo', value: `${pct(users.profileCompleted, users.total)}%`, extra: <span className="ai-delta">{fmtNum(users.verified)} con email verificado</span> },
        ]}
      />

      <div className="ai-cols-3">
        <Block title="Tipo de cuenta" aside={fmtNum(users.total)}>
          <RankRows rows={typeRows} total={users.total} />
        </Block>
        <Block title="Nivel de los creativos">
          <RankRows
            rows={users.creativeLevels.map((l) => ({ key: String(l.level), label: LEVEL_NAMES[l.level] || 'Sin nivel', count: l.count }))}
            total={users.byType.creative}
          />
        </Block>
        <Block title="Ciudades con más usuarios">
          <RankRows rows={users.topCities.map((c) => ({ label: c.city, count: c.count }))} total={users.total} />
        </Block>
      </div>

      {/* Ofertas y lo pendiente de revisar */}
      <h2 className="ai-section-title">Ofertas y moderación</h2>
      <StatStrip
        items={[
          { label: 'ofertas de empleo nuevas', value: fmtNum(offers.new), to: '/ofertas', extra: <span className="ai-delta">{fmtNum(offers.total)} en total</span> },
          { label: 'candidaturas en el periodo', value: fmtNum(appsTotal), to: '/ofertas', extra: <span className="ai-delta">{fmtNum(apps.accepted)} aceptadas</span> },
          { label: 'reportes pendientes', value: fmtNum(moderation.reportsPending), to: '/reportes' },
          { label: 'validaciones pendientes', value: fmtNum(moderation.pendingValidation), to: '/validacion' },
        ]}
      />
    </div>
  );
};

export default DashboardPage;
