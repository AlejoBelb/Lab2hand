// client/src/pages/teacher/StudentsPage.jsx

import { useEffect, useState, useCallback } from "react";
import {
  listStudents,
  approveStudent,
  rejectStudent,
  enrollStudent,
  unenrollStudent,
} from "../../lib/api/teacherStudents.js";
import { getMyCourses } from "../../lib/api/teacherGuides.js";

function StatusBadge({ isActive, pendingApproval }) {
  const s = pendingApproval
    ? {
        bg: "rgba(245,158,11,0.08)",
        color: "#fbbf24",
        border: "rgba(245,158,11,0.2)",
        label: "Pendiente",
      }
    : isActive
      ? {
          bg: "rgba(16,185,129,0.08)",
          color: "#34d399",
          border: "rgba(16,185,129,0.18)",
          label: "Aprobado",
        }
      : {
          bg: "rgba(239,68,68,0.08)",
          color: "#f87171",
          border: "rgba(239,68,68,0.15)",
          label: "Rechazado",
        };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11.5,
        fontWeight: 500,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: "currentColor",
        }}
      />
      {s.label}
    </span>
  );
}

// â”€â”€ Modal para asignar/gestionar cursos de un estudiante â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EnrollModal({ student, courses, onClose, onSaved }) {
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  // Estado local de inscripciones para reflejar cambios sin cerrar el modal
  const [enrolledIds, setEnrolledIds] = useState(
    new Set(student.enrolledCourses?.map((sc) => sc.course.id) || []),
  );

  async function handleEnroll(courseId) {
    setActionLoading(courseId);
    setError("");
    try {
      await enrollStudent(student.id, courseId);
      setEnrolledIds((prev) => new Set([...prev, courseId]));
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUnenroll(courseId) {
    setActionLoading(courseId);
    setError("");
    try {
      await unenrollStudent(student.id, courseId);
      setEnrolledIds((prev) => {
        const next = new Set(prev);
        next.delete(courseId);
        return next;
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(5px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#0f1520",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          width: "100%",
          maxWidth: 460,
          padding: 28,
          boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          style={{
            color: "#f1f5f9",
            margin: "0 0 4px",
            fontSize: "1.05rem",
            fontWeight: 700,
          }}
        >
          Cursos de {student.firstName || student.email}
        </h3>
        <p style={{ color: "#475569", fontSize: 12.5, margin: "0 0 20px" }}>
          Asigna o remueve al estudiante de tus cursos.
        </p>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              marginBottom: 14,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.15)",
              borderRadius: 8,
              color: "#f87171",
              fontSize: 12.5,
            }}
          >
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div style={{ color: "#334155", fontSize: 13 }}>
            No tienes cursos activos.
          </div>
        ) : (
          courses.map((c) => {
            const enrolled = enrolledIds.has(c.id);
            return (
              <div
                key={c.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: 9,
                  marginBottom: 8,
                  background: enrolled
                    ? "rgba(5,150,105,0.06)"
                    : "rgba(255,255,255,0.02)",
                  border: `1px solid ${enrolled ? "rgba(5,150,105,0.2)" : "rgba(255,255,255,0.05)"}`,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "#f1f5f9",
                      fontWeight: 500,
                    }}
                  >
                    {c.name}
                  </div>
                  <div style={{ fontSize: 12, color: "#475569" }}>
                    {c.grade} Â· Grupo {c.group}
                  </div>
                </div>
                <button
                  disabled={actionLoading === c.id}
                  onClick={() =>
                    enrolled ? handleUnenroll(c.id) : handleEnroll(c.id)
                  }
                  style={{
                    background: enrolled
                      ? "rgba(239,68,68,0.1)"
                      : "rgba(5,150,105,0.12)",
                    border: `1px solid ${enrolled ? "rgba(239,68,68,0.2)" : "rgba(5,150,105,0.25)"}`,
                    borderRadius: 7,
                    padding: "6px 14px",
                    color: enrolled ? "#f87171" : "#34d399",
                    fontSize: 12.5,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    opacity: actionLoading === c.id ? 0.5 : 1,
                  }}
                >
                  {actionLoading === c.id
                    ? "..."
                    : enrolled
                      ? "Remover"
                      : "Inscribir"}
                </button>
              </div>
            );
          })
        )}

        <div
          style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}
        >
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8,
              padding: "8px 18px",
              color: "#94a3b8",
              fontSize: 13.5,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// â”€â”€ PÃ¡gina principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [enrollModal, setEnrollModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [sData, cData] = await Promise.all([
        listStudents({ status: filterStatus, search: search || undefined }),
        getMyCourses(),
      ]);
      setStudents(sData.students || []);
      setCourses(cData.courses || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleApprove(student) {
    setActionLoading(student.id);
    try {
      await approveStudent(student.id);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(student) {
    if (!confirm(`Â¿Rechazar a ${student.firstName || student.email}?`)) return;
    setActionLoading(student.id);
    try {
      await rejectStudent(student.id);
      load();
    } catch (e) {
      alert(e.message);
    } finally {
      setActionLoading(null);
    }
  }

  const pendingCount = students.filter((s) => s.pendingApproval).length;

  return (
    <div>
      <style>{`
        .sp-head { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
        .sp-title { font-size:1.4rem; font-weight:700; color:#f1f5f9; margin:0 0 4px; }
        .sp-sub { font-size:13px; color:#475569; margin:0; }
        .sp-filters { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:16px; }
        .sp-search-wrap { position:relative; flex:1; min-width:180px; max-width:280px; }
        .sp-search-icon { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:#475569; pointer-events:none; }
        .sp-search { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px 8px 32px; color:#e2e8f0; font-size:13.5px; font-family:inherit; outline:none; }
        .sp-select { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:8px; padding:8px 12px; color:#e2e8f0; font-size:13px; font-family:inherit; outline:none; cursor:pointer; color-scheme:dark; }
        .sp-select option { background:#0f1520; color:#e2e8f0; }
        .sp-card { background:rgba(13,20,33,0.75); border:1px solid rgba(255,255,255,0.08); border-radius:14px; overflow:hidden; }
        .sp-table { width:100%; border-collapse:collapse; }
        .sp-table th { padding:11px 16px; text-align:left; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01); }
        .sp-table td { padding:12px 16px; font-size:13.5px; color:#cbd5e1; border-bottom:1px solid rgba(255,255,255,0.04); vertical-align:middle; }
        .sp-table tr:last-child td { border-bottom:none; }
        .sp-table tr:hover td { background:rgba(255,255,255,0.015); }
        .sp-name { font-weight:500; color:#f1f5f9; }
        .sp-email { font-size:12px; color:#475569; margin-top:2px; }
        .sp-actions { display:flex; gap:6px; flex-wrap:wrap; }
        .sp-btn { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:6px; padding:5px 11px; font-size:12px; color:#94a3b8; font-family:inherit; cursor:pointer; transition:background 0.15s,color 0.15s; white-space:nowrap; }
        .sp-btn:disabled { opacity:0.4; cursor:not-allowed; }
        .sp-btn.approve { color:#34d399; border-color:rgba(16,185,129,0.2); }
        .sp-btn.approve:hover { background:rgba(16,185,129,0.1); }
        .sp-btn.reject { color:#f87171; border-color:rgba(239,68,68,0.2); }
        .sp-btn.reject:hover { background:rgba(239,68,68,0.1); }
        .sp-btn.enroll { color:#a78bfa; border-color:rgba(124,58,237,0.2); }
        .sp-btn.enroll:hover { background:rgba(124,58,237,0.1); }
        .sp-state { padding:48px 0; text-align:center; color:#475569; font-size:13px; }
        .sp-error { padding:12px 16px; margin-bottom:16px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); border-radius:10px; color:#f87171; font-size:13px; }
        .sp-pending-badge { display:inline-flex; align-items:center; gap:5px; padding:3px 10px; border-radius:20px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); color:#fbbf24; font-size:12px; font-weight:600; }
        .sp-course-pill { display:inline-flex; align-items:center; padding:2px 8px; border-radius:5px; font-size:11px; background:rgba(124,58,237,0.08); color:#a78bfa; border:1px solid rgba(124,58,237,0.15); margin-right:4px; margin-bottom:2px; }
      `}</style>

      <div className="sp-head">
        <div>
          <h1 className="sp-title">Estudiantes</h1>
          <p className="sp-sub">
            Aprueba y asigna estudiantes de tu institución a tus cursos.
          </p>
        </div>
        {pendingCount > 0 && (
          <span className="sp-pending-badge">
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#fbbf24",
              }}
            />
            {pendingCount} pendiente{pendingCount !== 1 ? "s" : ""} de
            aprobación
          </span>
        )}
      </div>

      {/* Filtros */}
      <div className="sp-filters">
        <div className="sp-search-wrap">
          <span className="sp-search-icon">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            className="sp-search"
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="sp-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
        </select>
      </div>

      {error && <div className="sp-error">{error}</div>}

      <div className="sp-card">
        {loading ? (
          <div className="sp-state">Cargando...</div>
        ) : students.length === 0 ? (
          <div className="sp-state">
            {filterStatus === "pending"
              ? "No hay estudiantes pendientes de aprobación."
              : "No hay estudiantes en tu institución todavía."}
          </div>
        ) : (
          <table className="sp-table">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>Estado</th>
                <th>Cursos inscritos</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="sp-name">
                      {s.firstName || s.lastName
                        ? `${s.firstName || ""} ${s.lastName || ""}`.trim()
                        : s.email}
                    </div>
                    <div className="sp-email">{s.email}</div>
                  </td>
                  <td>
                    <StatusBadge
                      isActive={s.isActive}
                      pendingApproval={s.pendingApproval}
                    />
                  </td>
                  <td>
                    {s.enrolledCourses?.length === 0 ? (
                      <span style={{ fontSize: 12, color: "#334155" }}>
                        Sin cursos
                      </span>
                    ) : (
                      s.enrolledCourses?.map((sc) => (
                        <span key={sc.course.id} className="sp-course-pill">
                          {sc.course.name}
                        </span>
                      ))
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: "#475569" }}>
                    {new Date(s.createdAt).toLocaleDateString("es-CO", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td>
                    <div className="sp-actions">
                      {s.pendingApproval && (
                        <button
                          className="sp-btn approve"
                          disabled={actionLoading === s.id}
                          onClick={() => handleApprove(s)}
                        >
                          {actionLoading === s.id ? "..." : "Aprobar"}
                        </button>
                      )}
                      {s.pendingApproval && (
                        <button
                          className="sp-btn reject"
                          disabled={actionLoading === s.id}
                          onClick={() => handleReject(s)}
                        >
                          Rechazar
                        </button>
                      )}
                      {s.isActive && !s.pendingApproval && (
                        <button
                          className="sp-btn enroll"
                          onClick={() => setEnrollModal(s)}
                        >
                          Gestionar cursos
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {enrollModal && (
        <EnrollModal
          student={enrollModal}
          courses={courses}
          onClose={() => setEnrollModal(null)}
          onSaved={() => {
            load();
          }}
        />
      )}
    </div>
  );
}
