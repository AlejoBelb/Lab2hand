// client/src/teacher/guides/components/sections/AttachmentsSection.jsx
import { Button, Card } from "@fluentui/react-components";

function createAttachment(file) {
  return {
    id: crypto.randomUUID(),
    filename: file.name,
    type: file.type || "application/octet-stream",
    url: URL.createObjectURL(file), // mock local preview
  };
}

export default function AttachmentsSection({ files, onChange }) {
  function handleFileSelect(event) {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const newAttachments = selectedFiles.map(createAttachment);
    onChange([...files, ...newAttachments]);

    // reset input so the same file can be selected again if needed
    event.target.value = "";
  }

  function removeAttachment(index) {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <Card className="glass" style={{ padding: 16 }}>
      <h3>Archivos adjuntos</h3>

      <p style={{ opacity: 0.7, marginBottom: 8 }}>
        Puedes adjuntar PDFs, imágenes u otros documentos de apoyo.
        Estos archivos complementan la guía, pero no la reemplazan.
      </p>

      <div style={{ marginBottom: 12 }}>
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          style={{ display: "none" }}
          id="attachments-input"
        />
        <label htmlFor="attachments-input">
          <Button as="span">Agregar archivos</Button>
        </label>
      </div>

      {files.length === 0 && (
        <p style={{ opacity: 0.6 }}>
          No se han agregado archivos adjuntos.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {files.map((file, index) => (
          <div
            key={file.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 8,
            }}
          >
            <div>
              <strong>{file.filename}</strong>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {file.type}
              </div>
            </div>

            <Button
              appearance="subtle"
              onClick={() => removeAttachment(index)}
            >
              Eliminar
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
