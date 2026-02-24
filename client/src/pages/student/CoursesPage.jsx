// client/src/pages/student/CoursesPage.jsx

import { useEffect, useState } from 'react';
import { getMyCourses, getCourseGuides } from '../../lib/api/student.js';

const EXPERIMENT_ROUTES = {
  'bernoulli': '/experiments/bernoulli',
  'spring':    '/experiments/spring',
  'mas':       '/experiments/spring/mas',
};

const BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:4001';

function ExperimentBadge({ name }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px', borderRadius: 20,
      fontSize: 11.5, fontWeight: 500,
      background: 'rgba(124,58,237,0.08)',
      color: '#a78bfa',
      border: '1px solid rgba(124,58,237,0.18)',
      marginRight: 6, marginBottom: 4,
    }}>{name}</span>
  );
}

function ExperimentLink({ exp }) {
  const route = EXPERIMENT_ROUTES[exp.slug];

  if (!route) return <ExperimentBadge name={exp.name} />;

  return (
    <a
      href={route}
      target="_blank"
      rel="noreferrer"
      onClick={e => e.stopPropagation()} // evita que abra/cierre la card
      style={{ textDecoration: 'none', display: 'inline-block', marginRight: 6, marginBottom: 4 }}
    >
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '3px 10px', borderRadius: 20,
        fontSize: 11.5, fontWeight: 500,
        background: 'rgba(124,58,237,0.08)',
        color: '#a78bfa',
        border: '1px solid rgba(124,58,237,0.18)',
        cursor: 'pointer', transition: 'background 0.15s, border-color 0.15s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(124,58,237,0.18)';
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.35)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(124,58,237,0.08)';
          e.currentTarget.style.borderColor = 'rgba(124,58,237,0.18)';
        }}
      >
        <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
        {exp.name}
      </span>
    </a>
  );
}

function GuideRow({ guide }) {
  const pdfUrl = `${BASE_URL}/${guide.fileUrl}`;
  const author = guide.createdBy
    ? `${guide.createdBy.firstName || ''} ${guide.createdBy.lastName || ''}`.trim()
    : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: 10, marginBottom: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: '#f1f5f9' }}>
          {guide.title}
        </div>
        <div style={{ fontSize: 12, color: '#475569', marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {guide.experiment && (
            <span style={{ color: '#7c3aed' }}>{guide.experiment.name}</span>
          )}
          {author && <span>Por {author}</span>}
          <span>{new Date(guide.createdAt).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        </div>
        {guide.description && (
          <div style={{ fontSize: 12, color: '#334155', marginTop: 4 }}>
            {guide.description}
          </div>
        )}
      </div>
      <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', marginLeft: 16 }}>
        <button style={{
          display: 'flex', alignItems: 'center', gap: 7,
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 8, padding: '7px 14px',
          color: '#a78bfa', fontSize: 13, fontWeight: 600,
          fontFamily: 'inherit', cursor: 'pointer',
          whiteSpace: 'nowrap', transition: 'background 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,58,237,0.12)'}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Descargar PDF
        </button>
      </a>
    </div>
  );
}

function CourseCard({ course }) {
  const [open, setOpen] = useState(false);
  const [guides, setGuides] = useState([]);
  const [loadingGuides, setLoadingGuides] = useState(false);
  const [guidesError, setGuidesError] = useState('');

  async function handleOpen() {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (guides.length > 0) return;
    setLoadingGuides(true); setGuidesError('');
    try {
      const data = await getCourseGuides(course.id);
      setGuides(data.guides || []);
    } catch (e) { setGuidesError(e.message); }
    finally { setLoadingGuides(false); }
  }

  const experiments = course.experiments?.map(e => e.experiment) || [];

  return (
    <div style={{
      background: 'rgba(13,20,33,0.75)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 14,
      overflow: 'hidden',
      marginBottom: 16,
      transition: 'border-color 0.2s',
    }}>
      {/* Header de la card */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', cursor: 'pointer',
      }} onClick={handleOpen}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
            {course.name}
          </div>
          <div style={{ fontSize: 12.5, color: '#475569', marginBottom: 8 }}>
            {course.grade} · Grupo {course.group} · {course.academicYear}
          </div>

          {/* Experimentos — clicables si tienen ruta */}
          <div>
            {experiments.length === 0 ? (
              <span style={{ fontSize: 12, color: '#334155' }}>Sin experimentos asignados</span>
            ) : (
              experiments.map(exp => (
                <ExperimentLink key={exp.id} exp={exp} />
              ))
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 16 }}>
          <div style={{
            textAlign: 'center',
            padding: '6px 12px',
            background: 'rgba(124,58,237,0.08)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: 8,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#a78bfa' }}>
              {course._count?.guides ?? 0}
            </div>
            <div style={{ fontSize: 10.5, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Guías
            </div>
          </div>

          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>

      {/* Guías expandibles */}
      {open && (
        <div style={{
          padding: '0 20px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '12px 0 10px' }}>
            Guías publicadas
          </div>

          {loadingGuides ? (
            <div style={{ color: '#475569', fontSize: 13, padding: '12px 0' }}>Cargando guías...</div>
          ) : guidesError ? (
            <div style={{ color: '#f87171', fontSize: 13 }}>{guidesError}</div>
          ) : guides.length === 0 ? (
            <div style={{ color: '#334155', fontSize: 13, padding: '8px 0' }}>
              No hay guías publicadas en este curso todavía.
            </div>
          ) : (
            guides.map(g => <GuideRow key={g.id} guide={g} />)
          )}
        </div>
      )}
    </div>
  );
}

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getMyCourses();
        setCourses(data.courses || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div>
      <style>{`
        .scp-head { margin-bottom: 28px; }
        .scp-title { font-size: 1.4rem; font-weight: 700; color: #f1f5f9; margin: 0 0 4px; }
        .scp-sub { font-size: 13px; color: #475569; margin: 0; }
        .scp-error { padding: 12px 16px; margin-bottom: 16px; background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.15); border-radius: 10px; color: #f87171; font-size: 13px; }
        .scp-state { padding: 60px 0; text-align: center; color: #475569; font-size: 13px; }
        .scp-empty-icon { width: 48px; height: 48px; margin: 0 auto 12px; opacity: 0.2; }
      `}</style>

      <div className="scp-head">
        <h1 className="scp-title">Mis cursos</h1>
        <p className="scp-sub">Accede a los experimentos y guías de laboratorio de tus cursos.</p>
      </div>

      {error && <div className="scp-error">{error}</div>}

      {loading ? (
        <div className="scp-state">Cargando tus cursos...</div>
      ) : courses.length === 0 ? (
        <div className="scp-state">
          <svg className="scp-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <path d="M8 21h8M12 17v4"/>
          </svg>
          No estás inscrito en ningún curso todavía.
        </div>
      ) : (
        courses.map(c => <CourseCard key={c.id} course={c} />)
      )}
    </div>
  );
}