// client/src/teacher/guides/components/GuidePreviewContent.jsx
import { Card } from "@fluentui/react-components";

export default function GuidePreviewContent({ guide }) {
  const { title, course, experiment, content } = guide;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card className="glass" style={{ padding: 16 }}>
        <h2 style={{ marginBottom: 8 }}>{title}</h2>
        <div style={{ opacity: 0.8 }}>
          Curso: {course.name} | Experimento: {experiment.name}
        </div>
      </Card>

      {/* Objetivo */}
      {content.objective.text && (
        <Card className="glass" style={{ padding: 16 }}>
          <h3>Objetivo</h3>
          <p>{content.objective.text}</p>
        </Card>
      )}

      {/* Materiales */}
      {content.materials.length > 0 && (
        <Card className="glass" style={{ padding: 16 }}>
          <h3>Materiales</h3>
          <ul>
            {content.materials.map((m) => (
              <li key={m.id}>
                {m.name}
                {m.quantity && ` (${m.quantity})`}
                {m.notes && ` – ${m.notes}`}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Procedimiento */}
      {content.procedure.length > 0 && (
        <Card className="glass" style={{ padding: 16 }}>
          <h3>Procedimiento</h3>
          <ol>
            {content.procedure.map((step) => (
              <li key={step.id} style={{ marginBottom: 8 }}>
                {step.text}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Actividades */}
      {content.activities.length > 0 && (
        <Card className="glass" style={{ padding: 16 }}>
          <h3>Actividades</h3>
          <ol>
            {content.activities.map((a) => (
              <li key={a.id} style={{ marginBottom: 8 }}>
                {a.text}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Preguntas de análisis */}
      {content.analysisQuestions.length > 0 && (
        <Card className="glass" style={{ padding: 16 }}>
          <h3>Preguntas de análisis</h3>
          <ol>
            {content.analysisQuestions.map((q) => (
              <li key={q.id} style={{ marginBottom: 8 }}>
                {q.text}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {/* Archivos adjuntos */}
      {content.attachments.length > 0 && (
        <Card className="glass" style={{ padding: 16 }}>
          <h3>Archivos adjuntos</h3>
          <ul>
            {content.attachments.map((f) => (
              <li key={f.id}>
                <a href={f.url} target="_blank" rel="noreferrer">
                  {f.filename}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
