import { Button, Textarea, Card } from "@fluentui/react-components";

function createEmptyStep(order) {
  return {
    id: crypto.randomUUID(),
    stepNumber: order + 1,
    text: "",
    imageUrl: null,
  };
}

export default function ProcedureSection({ steps, onChange }) {
  function addStep() {
    const updated = [...steps, createEmptyStep(steps.length)];
    onChange(updated);
  }

  function updateStep(index, value) {
    const updated = steps.map((step, i) =>
      i === index ? { ...step, ...value } : step
    );
    onChange(updated);
  }

  function removeStep(index) {
    const updated = steps.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <Card className="glass" style={{ padding: 16 }}>
      <h3>Procedimiento</h3>

      {steps.length === 0 && (
        <p style={{ opacity: 0.7 }}>
          Aún no has agregado pasos al procedimiento.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {steps.map((step, index) => (
          <div
            key={step.id}
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
              <strong>Paso {index + 1}</strong>

              <Button
                appearance="subtle"
                onClick={() => removeStep(index)}
              >
                Eliminar
              </Button>
            </div>

            <Textarea
              placeholder="Describe el paso del experimento"
              value={step.text}
              resize="vertical"
              onChange={(e) =>
                updateStep(index, { text: e.target.value })
              }
            />

            {/* Placeholder futuro para imagen */}
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                opacity: 0.6,
              }}
            >
              Imagen del paso (próximamente)
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={addStep}>Agregar paso</Button>
      </div>
    </Card>
  );
}
