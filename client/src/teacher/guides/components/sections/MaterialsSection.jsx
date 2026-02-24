// client/src/teacher/guides/components/sections/MaterialsSection.jsx
import { Button, Input, Card } from "@fluentui/react-components";

function createEmptyMaterial() {
  return {
    id: crypto.randomUUID(),
    name: "",
    quantity: "",
    notes: "",
  };
}

export default function MaterialsSection({ items, onChange }) {
  function addMaterial() {
    const updated = [...items, createEmptyMaterial()];
    onChange(updated);
  }

  function updateMaterial(index, value) {
    const updated = items.map((m, i) =>
      i === index ? { ...m, ...value } : m
    );
    onChange(updated);
  }

  function removeMaterial(index) {
    const updated = items.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <Card className="glass" style={{ padding: 16 }}>
      <h3>Materiales</h3>

      {items.length === 0 && (
        <p style={{ opacity: 0.7 }}>
          Define los materiales necesarios para realizar el experimento.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((material, index) => (
          <div
            key={material.id}
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 2fr auto",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Input
                placeholder="Material"
                value={material.name}
                onChange={(e) =>
                  updateMaterial(index, { name: e.target.value })
                }
              />

              <Input
                placeholder="Cantidad"
                value={material.quantity}
                onChange={(e) =>
                  updateMaterial(index, { quantity: e.target.value })
                }
              />

              <Input
                placeholder="Observaciones (opcional)"
                value={material.notes}
                onChange={(e) =>
                  updateMaterial(index, { notes: e.target.value })
                }
              />

              <Button
                appearance="subtle"
                onClick={() => removeMaterial(index)}
              >
                Eliminar
              </Button>
            </div>

            {material.name.trim().length > 0 &&
              material.name.trim().length < 3 && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "#fbbf24",
                  }}
                >
                  El nombre del material parece muy corto.
                </div>
              )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 16 }}>
        <Button onClick={addMaterial}>Agregar material</Button>
      </div>
    </Card>
  );
}
