// client/src/teacher/guides/components/sections/ActivitiesSection.jsx
import { Button, Textarea, Card } from "@fluentui/react-components";

function createEmptyActivity() {
  return {
    id: crypto.randomUUID(),
    text: "",
  };
}

export default function ActivitiesSection({ activities, onChange }) {
  function addActivity() {
    const updated = [...activities, createEmptyActivity()];
    onChange(updated);
  }

  function updateActivity(index, value) {
    const updated = activities.map((a, i) =>
      i === index ? { ...a, ...value } : a
    );
    onChange(updated);
  }

  function removeActivity(index) {
    const updated = activities.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <Card className="glass" style={{ padding: 16 }}>
      <h3>Actividades</h3>

      {activities.length === 0 && (
        <p style={{ opacity: 0.7 }}>
          Agrega al menos una actividad para que el estudiante interactúe
          con el experimento.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {activities.map((activity, index) => (
          <div
            key={activity.id}
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
              <strong>Actividad {index + 1}</strong>

              <Button
                appearance="subtle"
                onClick={() => removeActivity(index)}
              >
                Eliminar
              </Button>
            </div>

            <Textarea
              placeholder="Describe la actividad que debe realizar el estudiante"
              value={activity.text}
              resize="vertical"
              onChange={(e) =>
                updateActivity(index, { text: e.target.value })
              }
            />

            {activity.text.trim().length > 0 &&
              activity.text.trim().length < 10 && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#fbbf24",
                  }}
                >
                  Se recomienda una descripción más detallada.
                </div>
              )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={addActivity}>Agregar actividad</Button>
      </div>
    </Card>
  );
}
