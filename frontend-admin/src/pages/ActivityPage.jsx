// Actividad (/actividad): qué hacen las personas dentro de la web — cuánto
// suben, quién sube más, qué se guarda, qué campos del perfil editan — y la
// lista de usuarios con su última edición y su último acceso.
// Datos: GET /api/admin/insights (content), /api/admin/traffic-stats
// (campos editados, últimos 30 días) y /api/admin/user-activity (tabla).
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import {
  useInsights, PageHead, StatStrip, Block, Bars, RankRows, Delta, Loading, ErrorNote, fmtNum, pct,
} from '../components/insights/Insights';

// timeZone explícito: sin esto, las fechas saldrían en la zona horaria del
// navegador del admin y no en la de España.
const MADRID_TZ = 'Europe/Madrid';
const fmt = (d) => (d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: MADRID_TZ }) : null);
const fmtDateTime = (d) => (d ? new Date(d).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: MADRID_TZ }) : null);
const daysSince = (d) => (d ? Math.floor((Date.now() - new Date(d).getTime()) / 86400000) : null);

const dayLabel = (d) => new Date(`${d.date}T00:00:00`).getDate();
const dayTip = (d) => new Date(`${d.date}T00:00:00`).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });

const ActivityPage = () => {
  const { days, setDays, data, error, loading } = useInsights();
  const [people, setPeople] = useState(null);
  const [fields, setFields] = useState([]);

  useEffect(() => {
    api.get('/api/admin/user-activity').then((r) => setPeople(r.data)).catch(() => setPeople({ users: [] }));
    api.get('/api/admin/traffic-stats').then((r) => setFields(r.data.topEditedFields || [])).catch(() => {});
  }, []);

  if (loading) return <Loading />;
  if (error) return <div className="ai-page"><ErrorNote text={error} /></div>;

  const { content, users } = data;

  return (
    <div className="ai-page">
      <PageHead
        title="Actividad"
        subtitle="Qué suben y guardan las personas, quién está más activo y cuándo editaron su perfil por última vez."
        days={days}
        setDays={setDays}
      />

      <StatStrip
        items={[
          { label: 'proyectos subidos', value: fmtNum(content.postsNew), to: '/posts', extra: <Delta now={content.postsNew} prev={content.postsNewPrev} /> },
          { label: 'personas que han subido', value: fmtNum(content.creatorsInRange), extra: <span className="ai-delta">{pct(content.creatorsInRange, users.total)}% de los usuarios</span> },
          { label: 'imágenes guardadas', value: fmtNum(content.saves), extra: <Delta now={content.saves} prev={content.savesPrev} /> },
          { label: 'imágenes por proyecto', value: fmtNum(content.avgImagesPerPost), extra: <span className="ai-delta">de media, {fmtNum(content.postsTotal)} proyectos en total</span> },
        ]}
      />

      <Block title="Proyectos subidos por día" aside={fmtNum(content.postsNew)}>
        <Bars data={content.series} labelFor={dayLabel} tipFor={dayTip} />
      </Block>

      <div className="ai-cols-3">
        <Block title="Quién sube más" hint="Proyectos en el periodo">
          <RankRows
            rows={content.topUploaders.map((u) => ({ key: u.username, label: u.fullName || `@${u.username}`, count: u.count }))}
            total={content.postsNew}
          />
        </Block>

        <Block title="Proyectos más guardados" hint="Imágenes guardadas en el periodo">
          {content.topSaved.length ? (
            <ol className="ai-list">
              {content.topSaved.map((p) => (
                <li key={p.postId} className="ai-list-item">
                  {p.image ? <img className="ai-list-thumb" src={p.image} alt="" loading="lazy" /> : <span className="ai-list-thumb" />}
                  <span className="ai-list-text">
                    <Link to={`/posts/${p.postId}`} className="ai-list-title">{p.title?.trim() || 'Sin título'}</Link>
                    {p.username && <span className="ai-list-sub">@{p.username}</span>}
                  </span>
                  <span className="ai-row-count">{fmtNum(p.count)}</span>
                </li>
              ))}
            </ol>
          ) : <p className="ai-empty">Nadie ha guardado imágenes en este periodo.</p>}
        </Block>

        <Block title="Campos del perfil más editados" hint="Últimos 30 días">
          <RankRows rows={fields.map((f) => ({ label: f.field, count: f.count }))} />
        </Block>
      </div>

      <StatStrip
        items={[
          { label: 'carpetas de guardados', value: fmtNum(content.foldersTotal) },
          { label: 'staff picks', value: fmtNum(content.staffPicks), to: '/posts' },
          { label: 'han editado su perfil', value: people ? `${people.retentionPct ?? 0}%` : '-', extra: people && <span className="ai-delta">{fmtNum(people.edited)} de {fmtNum(people.total)}</span> },
        ]}
      />

      {/* Usuarios: los 100 con edición más reciente */}
      <Block title="Usuarios" hint="Los 100 con la edición de perfil más reciente. Fechas y horas de España.">
        <div className="ai-table-wrap">
          <table className="ai-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Registro</th>
                <th>Última edición</th>
                <th>Último acceso</th>
              </tr>
            </thead>
            <tbody>
              {(people?.users || []).map((u) => {
                const dias = daysSince(u.lastProfileEditAt);
                return (
                  <tr key={u._id}>
                    <td><Link to={`/usuarios/${u._id}`}>{u.fullName || '-'}</Link></td>
                    <td>{u.email}</td>
                    <td>{fmt(u.createdAt) || '-'}</td>
                    <td className={u.lastProfileEditAt ? '' : 'is-muted'}>
                      {u.lastProfileEditAt ? `${fmt(u.lastProfileEditAt)}  (${dias === 0 ? 'hoy' : `hace ${dias} d`})` : 'Sin editar'}
                    </td>
                    <td className={u.lastLoginAt ? '' : 'is-muted'}>{fmtDateTime(u.lastLoginAt) || 'Nunca'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Block>
    </div>
  );
};

export default ActivityPage;
