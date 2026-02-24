// client/src/teacher/guides/components/sections/AnalysisQuestionsSection.jsx
import { Button, Textarea, Card } from "@fluentui/react-components";

function createEmptyQuestion() {
  return {
    id: crypto.randomUUID(),
    text: "",
  };
}

export default function AnalysisQuestionsSection({ questions, onChange }) {
  function addQuestion() {
    const updated = [...questions, createEmptyQuestion()];
    onChange(updated);
  }

  function updateQuestion(index, value) {
    const updated = questions.map((q, i) =>
      i === index ? { ...q, ...value } : q
    );
    onChange(updated);
  }

  function removeQuestion(index) {
    const updated = questions.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <Card className="glass" style={{ padding: 16 }}>
      <h3>Preguntas de análisis</h3>

      {questions.length === 0 && (
        <p style={{ opacity: 0.7 }}>
          Agrega preguntas que ayuden al estudiante a reflexionar sobre
          los resultados del experimento.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {questions.map((question, index) => (
          <div
            key={question.id}
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <strong>Pregunta {index + 1}</strong>

              <Button
                appearance="subtle"
                onClick={() => removeQuestion(index)}
              >
                Eliminar
              </Button>
            </div>

            <Textarea
              placeholder="Escribe la pregunta de análisis"
              value={question.text}
              resize="vertical"
              onChange={(e) =>
                updateQuestion(index, { text: e.target.value })
              }
            />

            {question.text.trim().length > 0 &&
              question.text.trim().length < 10 && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#fbbf24",
                  }}
                >
                  Se recomienda formular una pregunta más específica.
                </div>
              )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={addQuestion}>Agregar pregunta</Button>
      </div>
    </Card>
  );
}
