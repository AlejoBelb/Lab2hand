// client/src/pages/admin/CourseDetailPanel.jsx

import { useEffect, useState } from 'react';
import { getCourse, addTeacher, removeTeacher, addStudent, removeStudent, addExperiment, removeExperiment } from '../../lib/api/courses.js';
import { listUsers } from '../../lib/api/users.js';
import { http } from '../../lib/api/http.js';

const TEACHER_ROLE_LABELS = { OWNER: 'Propietario', EDITOR: 'Editor', VIEWER: 'Lector' };

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{
        fontSize: 11, fontWeight: 600, color: '#475569',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        marginBottom: 10,
      }}>{title}</div>
      {children}
    </div>
  );
}

function MemberRow({ name, sub, badge, onRemove, removing }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', borderRadius: 8,
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.05)',
      marginBottom: 6,
    }}>
      <div>
        <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{name}</div>
        {sub && <div style={{ fontSize: 11.5, color: '#475569', marginTop: 1 }}>{sub}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {badge}
        <button onClick={onRemove} disabled={removing} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#475569', padding: 4, borderRadius: 5,
          transition: 'color 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
          title="Remover"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function CourseDetailPanel({ courseId, onClose, onUpdated }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('teachers'); // teachers | students | experiments

  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [experiments, setExperiments] = useState([]);

  const [addTeacherId, setAddTeacherId] = useState('');
  const [addTeacherRole, setAddTeacherRole] = useState('OWNER');
  const [addStudentId, setAddStudentId] = useState('');
  const [addExpId, setAddExpId] = useState('');

  const [adding, setAdding] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [addError, setAddError] = useState('');

  async function loadCourse() {
    setLoading(true); setError('');
    try {
      const data = await getCourse(courseId);
      setCourse(data.course);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function loadMembers() {
    try {
      const [t, s] = await Promise.all([
        listUsers({ role: 'TEACHER', pageSize: 100 }),
        listUsers({ role: 'STUDENT', pageSize: 100 }),
      ]);
      setAvailableTeachers(t.items || []);
      setAvailableStudents(s.items || []);
    } catch {}
  }

  // FIX: usar http.get en lugar de fetch directo
  async function loadExperiments() {
  try {
    const res = await http.get('/api/admin/courses/experiments/all');
    const data = await res.json();
    setExperiments(data.experiments || []);
  } catch {}
}

  useEffect(() => {
    loadCourse();
  }, [courseId]);

  useEffect(() => {
    loadMembers();
    loadExperiments();
  }, []);

  // â”€â”€ Acciones â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  async function handleAddTeacher(e) {
    e.preventDefault();
    if (!addTeacherId) return;
    setAdding(true); setAddError('');
    try {
      await addTeacher(courseId, { teacherId: addTeacherId, role: addTeacherRole });
      setAddTeacherId('');
      loadCourse();
    } catch (e) { setAddError(e.message); }
    finally { setAdding(false); }
  }

  async function handleRemoveTeacher(teacherId) {
    setRemovingId(teacherId);
    try { await removeTeacher(courseId, teacherId); loadCourse(); }
    catch (e) { alert(e.message); }
    finally { setRemovingId(null); }
  }

  async function handleAddStudent(e) {
    e.preventDefault();
    if (!addStudentId) return;
    setAdding(true); setAddError('');
    try {
      await addStudent(courseId, { studentId: addStudentId });
      setAddStudentId('');
      loadCourse();
    } catch (e) { setAddError(e.message); }
    finally { setAdding(false); }
  }

  async function handleRemoveStudent(studentId) {
    setRemovingId(studentId);
    try { await removeStudent(courseId, studentId); loadCourse(); }
    catch (e) { alert(e.message); }
    finally { setRemovingId(null); }
  }

  async function handleAddExperiment(e) {
    e.preventDefault();
    if (!addExpId) return;
    setAdding(true); setAddError('');
    try {
      await addExperiment(courseId, addExpId);
      setAddExpId('');
      loadCourse();
    } catch (e) { setAddError(e.message); }
    finally { setAdding(false); }
  }

  async function handleRemoveExperiment(experimentId) {
    setRemovingId(experimentId);
    try { await removeExperiment(courseId, experimentId); loadCourse(); }
    catch (e) { alert(e.message); }
    finally { setRemovingId(null); }
  }

  // â”€â”€ Estilos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const selectS = {
    width: '100%', boxSizing: 'border-box',
    background: '#0f1829',
    border: '1px solid rgba(255,255,255,0.09)',
    borderRadius: 8, padding: '8px 10px',
    color: '#e2e8f0', fontSize: 13, fontFamily: 'inherit',
    outline: 'none', cursor: 'pointer',
    colorScheme: 'dark',
  };
  const btnAdd = {
    background: 'rgba(37,99,235,0.15)',
    border: '1px solid rgba(37,99,235,0.25)',
    borderRadius: 8, padding: '8px 14px',
    color: '#60a5fa', fontSize: 13, fontWeight: 600,
    fontFamily: 'inherit', cursor: 'pointer', whiteSpace: 'nowrap',
    transition: 'background 0.15s',
  };

  const assignedTeacherIds = new Set(course?.teachers?.map(t => t.teacher.id) || []);
  const assignedStudentIds = new Set(course?.students?.map(s => s.student.id) || []);
  const assignedExpIds = new Set(course?.experiments?.map(e => e.experiment.id) || []);

  // FIX: contar experiments desde el array directamente
  const experimentCount = course?.experiments?.length ?? 0;

  return (
    <div style={{
      width: 340, flexShrink: 0,
      background: 'rgba(13,20,33,0.9)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: 20,
      position: 'sticky', top: 20,
      maxHeight: 'calc(100vh - 120px)',
      overflowY: 'auto',
    }}>
      <style>{`
        .cdp-tab { background:none; border:none; cursor:pointer; padding:6px 12px; border-radius:7px; font-size:12.5px; font-family:inherit; color:#475569; transition:background 0.15s,color 0.15s; }
        .cdp-tab:hover { color:#94a3b8; background:rgba(255,255,255,0.04); }
        .cdp-tab.active { background:rgba(37,99,235,0.12); color:#60a5fa; font-weight:600; }
        .cdp-add-err { font-size:12px; color:#f87171; margin-top:6px; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3 }}>
            {loading ? '...' : course?.name}
          </div>
          {course && (
            <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3 }}>
              {course.grade} Â· Grupo {course.group} Â· {course.academicYear}
            </div>
          )}
        </div>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#475569', padding: 4, borderRadius: 5,
        }}
          onMouseEnter={e => e.currentTarget.style.color = '#94a3b8'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {error && <div style={{ color: '#f87171', fontSize: 12.5, marginBottom: 12 }}>{error}</div>}

      {/* Tabs â€” FIX: contador de experimentos desde el array */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 16,
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 10, padding: 4,
      }}>
        {[
          { key: 'teachers',    label: `Docentes (${course?._count?.teachers ?? 0})` },
          { key: 'students',    label: `Estudiantes (${course?._count?.students ?? 0})` },
          { key: 'experiments', label: `Experimentos (${experimentCount})` },
        ].map(t => (
          <button key={t.key} className={`cdp-tab${tab === t.key ? ' active' : ''}`}
            onClick={() => { setTab(t.key); setAddError(''); }}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, padding: '24px 0' }}>
          Cargando...
        </div>
      ) : (
        <>
          {/* â”€â”€ Tab: Docentes â”€â”€ */}
          {tab === 'teachers' && (
            <div>
              <Section title="Docentes asignados">
                {course?.teachers?.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: '#334155', padding: '8px 0' }}>
                    Sin docentes asignados.
                  </div>
                ) : (
                  course?.teachers?.map(t => (
                    <MemberRow
                      key={t.teacher.id}
                      name={`${t.teacher.firstName || ''} ${t.teacher.lastName || ''}`.trim() || t.teacher.email}
                      sub={t.teacher.email}
                      badge={
                        <span style={{
                          fontSize: 10.5, color: '#7c3aed',
                          background: 'rgba(124,58,237,0.1)',
                          border: '1px solid rgba(124,58,237,0.2)',
                          borderRadius: 5, padding: '1px 7px',
                        }}>
                          {TEACHER_ROLE_LABELS[t.role] || t.role}
                        </span>
                      }
                      onRemove={() => handleRemoveTeacher(t.teacher.id)}
                      removing={removingId === t.teacher.id}
                    />
                  ))
                )}
              </Section>

              <Section title="Agregar docente">
                <form onSubmit={handleAddTeacher} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <select style={selectS} value={addTeacherId} onChange={e => setAddTeacherId(e.target.value)}>
                    <option value="">Seleccionar docente...</option>
                    {availableTeachers
                      .filter(t => !assignedTeacherIds.has(t.id))
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.firstName || t.lastName
                            ? `${t.firstName || ''} ${t.lastName || ''}`.trim()
                            : t.email}
                        </option>
                      ))
                    }
                  </select>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <select style={{ ...selectS, flex: 1 }} value={addTeacherRole}
                      onChange={e => setAddTeacherRole(e.target.value)}>
                      <option value="OWNER">Propietario</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Lector</option>
                    </select>
                    <button type="submit" style={btnAdd} disabled={adding || !addTeacherId}>
                      {adding ? '...' : 'Agregar'}
                    </button>
                  </div>
                  {addError && <div className="cdp-add-err">{addError}</div>}
                </form>
              </Section>
            </div>
          )}

          {/* â”€â”€ Tab: Estudiantes â”€â”€ */}
          {tab === 'students' && (
            <div>
              <Section title="Estudiantes inscritos">
                {course?.students?.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: '#334155', padding: '8px 0' }}>
                    Sin estudiantes inscritos.
                  </div>
                ) : (
                  course?.students?.map(s => (
                    <MemberRow
                      key={s.student.id}
                      name={`${s.student.firstName || ''} ${s.student.lastName || ''}`.trim() || s.student.email}
                      sub={s.student.email}
                      onRemove={() => handleRemoveStudent(s.student.id)}
                      removing={removingId === s.student.id}
                    />
                  ))
                )}
              </Section>

              <Section title="Agregar estudiante">
                <form onSubmit={handleAddStudent} style={{ display: 'flex', gap: 8 }}>
                  <select style={{ ...selectS, flex: 1 }} value={addStudentId}
                    onChange={e => setAddStudentId(e.target.value)}>
                    <option value="">Seleccionar estudiante...</option>
                    {availableStudents
                      .filter(s => !assignedStudentIds.has(s.id))
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.firstName || s.lastName
                            ? `${s.firstName || ''} ${s.lastName || ''}`.trim()
                            : s.email}
                        </option>
                      ))
                    }
                  </select>
                  <button type="submit" style={btnAdd} disabled={adding || !addStudentId}>
                    {adding ? '...' : 'Agregar'}
                  </button>
                </form>
                {addError && <div className="cdp-add-err">{addError}</div>}
              </Section>
            </div>
          )}

          {/* â”€â”€ Tab: Experimentos â”€â”€ */}
          {tab === 'experiments' && (
            <div>
              <Section title="Experimentos asignados">
                {course?.experiments?.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: '#334155', padding: '8px 0' }}>
                    Sin experimentos asignados.
                  </div>
                ) : (
                  course?.experiments?.map(e => (
                    <MemberRow
                      key={e.experiment.id}
                      name={e.experiment.name}
                      sub={e.experiment.slug}
                      onRemove={() => handleRemoveExperiment(e.experiment.id)}
                      removing={removingId === e.experiment.id}
                    />
                  ))
                )}
              </Section>

              <Section title="Agregar experimento">
                <form onSubmit={handleAddExperiment} style={{ display: 'flex', gap: 8 }}>
                  <select style={{ ...selectS, flex: 1 }} value={addExpId}
                    onChange={e => setAddExpId(e.target.value)}>
                    <option value="">Seleccionar experimento...</option>
                    {experiments
                      .filter(e => !assignedExpIds.has(e.id))
                      .map(e => (
                        <option key={e.id} value={e.id}>{e.name}</option>
                      ))
                    }
                  </select>
                  <button type="submit" style={btnAdd} disabled={adding || !addExpId}>
                    {adding ? '...' : 'Agregar'}
                  </button>
                </form>
                {addError && <div className="cdp-add-err">{addError}</div>}
              </Section>
            </div>
          )}
        </>
      )}
    </div>
  );
}
