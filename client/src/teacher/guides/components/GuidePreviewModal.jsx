// client/src/teacher/guides/components/GuidePreviewModal.jsx
import { Dialog, DialogSurface, DialogBody, DialogTitle, Button } from "@fluentui/react-components";
import GuidePreviewContent from "./GuidePreviewContent";

export default function GuidePreviewModal({ open, onClose, guide }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(_, data) => !data.open && onClose()}>
      <DialogSurface style={{ maxWidth: 900 }}>
        <DialogBody>
          <DialogTitle>Vista previa – Estudiante</DialogTitle>

          <div
            style={{
              maxHeight: "70vh",
              overflowY: "auto",
              marginTop: 16,
            }}
          >
            <GuidePreviewContent guide={guide} />
          </div>

          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
}
