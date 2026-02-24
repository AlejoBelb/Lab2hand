// client/src/teacher/guides/components/GuideEditorFooterActions.jsx
import { Button } from "@fluentui/react-components";

export default function GuideEditorFooterActions({
  visible,
  canPublish,
  onSaveDraft,
  onPublish,
}) {
  if (!visible) return null;

  return (
    <div
      className="glass-soft"
      style={{
        position: "sticky",
        bottom: 0,
        padding: 12,
        marginTop: 24,
        display: "flex",
        justifyContent: "flex-end",
        gap: 12,
      }}
    >
      <Button onClick={onSaveDraft}>Guardar borrador</Button>
      <Button
        appearance="primary"
        onClick={onPublish}
        disabled={!canPublish}
      >
        Publicar
      </Button>
    </div>
  );
}
