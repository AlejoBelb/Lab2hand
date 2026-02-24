// client/src/teacher/guides/components/ConfirmPublishModal.jsx
import {
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  Button,
} from "@fluentui/react-components";

export default function ConfirmPublishModal({
  open,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(_, d) => !d.open && onCancel()}>
      <DialogSurface>
        <DialogBody>
          <DialogTitle>Confirmar publicación</DialogTitle>

          <p style={{ marginTop: 8 }}>
            Al publicar esta guía, estará disponible para los estudiantes.
            ¿Deseas continuar?
          </p>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
            }}
          >
            <Button onClick={onCancel}>Cancelar</Button>
            <Button appearance="primary" onClick={onConfirm}>
              Publicar
            </Button>
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
