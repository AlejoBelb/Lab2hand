// client/src/pages/teacher/CoursesPage.jsx

import { useEffect, useState } from 'react';
import { http } from '../../lib/api/http.js';
import { getExperimentGuide } from '../../lib/api/experiments.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const EXPERIMENT_ROUTES = {
  bernoulli: '/experiments/bernoulli',
  spring:    '/experiments/spring',
  mas:       '/experiments/spring/mas',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('es-CO', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ── Botón Ver guía ─────────────────────────────────────────────────────────────

function GuideButton({ slug }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleClick() {
    setLoading(true); setError('');
    try {
      const data = await getExperimentGuide(slug);
      if (!data.guide?.fileUrl) { setError('Sin archivo'); return; }
      const url = data.guide.fileUrl.startsWith('/') ? `${http.BASE_URL}${data.guide.fileUrl}` : data.guide.fileUrl;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <button onClick={handleClick} disabled={loading} style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '4px 10px',
        background: 'rgba(37,99,235,0.08)',
        border: '1px solid rgba(37,99,235,0.2)',
        borderRadius: 6, color: '#93c5fd',
        fontSize: 12, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1, transition: 'background 0.15s',
      }}
        onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(37,99,235,0.16)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(37,99,235,0.08)'; }}
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        {loading ? 'Cargando…' : 'Ver guía'}
      </button>
      {error && <span style={{ fontSize: 11, color: '#f87171' }}>{error}</span>}
    </span>
  );
}

// ── Tarjeta de experimento ─────────────────────────────────────────────────────

function ExperimentCard({ experiment }) {
  const route = EXPERIMENT_ROUTES[experiment.slug];

  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 10, padding: '12px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: 'linear-gradient(135deg,rgba(5,150,105,0.2),rgba(4,120,87,0.3))',
          border: '1px solid rgba(5,150,105,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/>
          </svg>
        </div>
        <span style={{ fontSize: 13.5, fontWeight: 500, color: '#e2e8f0' }}>
          {experiment.name}
        </span>
      </div>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
        <GuideButton slug={experiment.slug} />
        {route && (
          <a href={route} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px',
            background: 'rgba(5,150,105,0.08)',
            border: '1px solid rgba(5,150,105,0.2)',
            borderRadius: 6, color: '#34d399',
            fontSize: 12, textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(5,150,105,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(5,150,105,0.08)'; }}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"/>
            </svg>
            Abrir
          </a>
        )}
      </div>
    </div>
  );
}

// ── Tarjeta de curso ───────────────────────────────────────────────────────────

function CourseCard({ course }) {
  const [open, setOpen] = useState(false);
  const experiments = course.experiments?.map(e => e.experiment) || [];

  return (
    <div style={{
      background: 'rgba(13,18,30,0.8)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header del curso */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          padding: '18px 20px', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f1f5f9', marginBottom: 4 }}>
            {course.name}
          </div>
          <div style={{ fontSize: 12, color: '#475569', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span>{course.grade} · Grupo {course.group}</span>
            <span>{course.academicYear}</span>
            <span style={{ color: '#334155' }}>
              {experiments.length} experimento{experiments.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      {/* Experimentos */}
      {open && (
        <div style={{
          padding: '0 20px 20px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          {experiments.length === 0 ? (
            <p style={{ fontSize: 13, color: '#475569', margin: '16px 0 0', textAlign: 'center' }}>
              Este curso no tiene experimentos asignados.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 16 }}>
              {experiments.map(exp => (
                <ExperimentCard key={exp.id} experiment={exp} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true); setError('');
      try {
        const res  = await http.get('/api/teacher/courses');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al cargar cursos');
        setCourses(data.courses || []);
      } catch (e) { setError(e.message); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f1f5f9', margin: '0 0 4px' }}>
          Mis cursos
        </h1>
        <p style={{ fontSize: 13, color: '#475569', margin: 0 }}>
          Cursos asignados a ti. Despliega cada uno para ver sus experimentos y guías.
        </p>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', marginBottom: 20,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 10, color: '#f87171', fontSize: 13,
        }}>{error}</div>
      )}

      {loading ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#475569', fontSize: 13 }}>
          Cargando cursos...
        </div>
      ) : courses.length === 0 ? (
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#475569', fontSize: 13 }}>
          <div style={{ fontSize: '2rem', marginBottom: 10 }}>📚</div>
          No tienes cursos asignados aún.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {courses.map(course => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
