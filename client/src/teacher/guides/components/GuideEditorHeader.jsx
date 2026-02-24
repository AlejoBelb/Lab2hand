// client/src/teacher/guides/components/GuideEditorHeader.jsx
import { Input, Button, Badge } from "@fluentui/react-components";

export default function GuideEditorHeader({
  title,
  courseName,
  experimentName,
  status,
  canPublish,
  onTitleChange,
  onSaveDraft,
  onPublish,
  onPreview,
}) {
  return (
    <div className="glass" style={{ padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Input
          value={title}
          placeholder="Título de la guía"
          onChange={(e) => onTitleChange(e.target.value)}
          style={{ flex: 1 }}
        />

        <Badge appearance="filled">{status}</Badge>

        <Button onClick={onPreview}>Previsualizar</Button>
        <Button onClick={onSaveDraft}>Guardar</Button>
        <Button
          appearance="primary"
          onClick={onPublish}
          disabled={!canPublish}
        >
          Publicar
        </Button>
      </div>

      <div style={{ marginTop: 8, opacity: 0.8 }}>
        Curso: {courseName} | Experimento: {experimentName}
      </div>

      {!canPublish && (
        <div
          style={{
            marginTop: 8,
            fontSize: 12,
            color: "#fbbf24",
          }}
        >
          Para publicar debes completar: título, objetivo, procedimiento
          y al menos una actividad o pregunta.
        </div>
      )}
    </div>
  );
}
