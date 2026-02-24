// client/src/teacher/guides/pages/TeacherGuideEditorPage.jsx
import { useState, useMemo, useEffect } from "react";
import { mockGuide } from "../mock/guide.mock";
import GuideEditorHeader from "../components/GuideEditorHeader";
import GuideEditorBody from "../components/GuideEditorBody";
import GuideEditorFooterActions from "../components/GuideEditorFooterActions";
import GuidePreviewModal from "../components/GuidePreviewModal";
import ConfirmPublishModal from "../components/ConfirmPublishModal";

export default function TeacherGuideEditorPage() {
  const [guide, setGuide] = useState(mockGuide);
  const [hasChanges, setHasChanges] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function updateGuide(path, value) {
    setGuide((prev) => {
      const updated = structuredClone(prev);
      let ref = updated;
      for (let i = 0; i < path.length - 1; i++) ref = ref[path[i]];
      ref[path[path.length - 1]] = value;
      return updated;
    });
    setHasChanges(true);
  }

  const sectionStatus = useMemo(() => {
    const objective = guide.content.objective.text.trim().length > 10;
    const procedure =
      guide.content.procedure.length > 0 &&
      guide.content.procedure.every((s) => s.text.trim().length > 5);
    const activities =
      guide.content.activities.length > 0 &&
      guide.content.activities.every((a) => a.text.trim().length > 5);
    const analysis =
      guide.content.analysisQuestions.length > 0 &&
      guide.content.analysisQuestions.every((q) => q.text.trim().length > 5);

    return { objective, procedure, activities, analysis };
  }, [guide]);

  const canPublish = useMemo(() => {
    return (
      guide.title.trim().length > 5 &&
      sectionStatus.objective &&
      sectionStatus.procedure &&
      (sectionStatus.activities || sectionStatus.analysis)
    );
  }, [guide, sectionStatus]);

  function tryPublish() {
    if (!canPublish) {
      scrollToFirstIncomplete();
      return;
    }
    setIsConfirmOpen(true);
  }

  function confirmPublish() {
    console.log("Publicar guía", guide);
    setHasChanges(false);
    setIsConfirmOpen(false);
  }

  function scrollToFirstIncomplete() {
    const ids = [
      { ok: sectionStatus.objective, id: "section-objective" },
      { ok: sectionStatus.procedure, id: "section-procedure" },
      {
        ok: sectionStatus.activities || sectionStatus.analysis,
        id: "section-activities",
      },
    ];
    const first = ids.find((s) => !s.ok);
    if (!first) return;
    const el = document.getElementById(first.id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  // AUTOSAVE (cada 30s si hay cambios)
  useEffect(() => {
    if (!hasChanges) return;
    const id = setInterval(() => {
      console.log("Autosave borrador", guide);
      setHasChanges(false);
    }, 30000);
    return () => clearInterval(id);
  }, [hasChanges, guide]);

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <GuideEditorHeader
        title={guide.title}
        courseName={guide.course.name}
        experimentName={guide.experiment.name}
        status={guide.status}
        canPublish={canPublish}
        onTitleChange={(v) => updateGuide(["title"], v)}
        onSaveDraft={() => setHasChanges(false)}
        onPublish={tryPublish}
        onPreview={() => setIsPreviewOpen(true)}
      />

      <GuideEditorBody
        guide={guide}
        sectionStatus={sectionStatus}
        onChange={updateGuide}
      />

      <GuideEditorFooterActions
        visible={hasChanges}
        canPublish={canPublish}
        onSaveDraft={() => setHasChanges(false)}
        onPublish={tryPublish}
      />

      <GuidePreviewModal
        open={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        guide={guide}
      />

      <ConfirmPublishModal
        open={isConfirmOpen}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={confirmPublish}
      />
    </div>
  );
}
