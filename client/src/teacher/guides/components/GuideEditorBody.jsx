// client/src/teacher/guides/components/GuideEditorBody.jsx
import ObjectiveSection from "./sections/ObjectiveSection";
import MaterialsSection from "./sections/MaterialsSection";
import ProcedureSection from "./sections/ProcedureSection";
import ActivitiesSection from "./sections/ActivitiesSection";
import AnalysisQuestionsSection from "./sections/AnalysisQuestionsSection";
import AttachmentsSection from "./sections/AttachmentsSection";

export default function GuideEditorBody({ guide, sectionStatus, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div id="section-objective">
        <ObjectiveSection
          value={guide.content.objective.text}
          complete={sectionStatus.objective}
          onChange={(v) => onChange(["content", "objective", "text"], v)}
        />
      </div>

      <div id="section-materials">
        <MaterialsSection
          items={guide.content.materials}
          complete={sectionStatus.materials}
          onChange={(v) => onChange(["content", "materials"], v)}
        />
      </div>

      <div id="section-procedure">
        <ProcedureSection
          steps={guide.content.procedure}
          complete={sectionStatus.procedure}
          onChange={(v) => onChange(["content", "procedure"], v)}
        />
      </div>

      <div id="section-activities">
        <ActivitiesSection
          activities={guide.content.activities}
          complete={sectionStatus.activities}
          onChange={(v) => onChange(["content", "activities"], v)}
        />
      </div>

      <div id="section-analysis-questions">
        <AnalysisQuestionsSection
          questions={guide.content.analysisQuestions}
          complete={sectionStatus.analysisQuestions}
          onChange={(v) =>
            onChange(["content", "analysisQuestions"], v)
          }
        />
      </div>

      <div id="section-attachments">
        <AttachmentsSection
          files={guide.content.attachments}
          complete={sectionStatus.attachments}
          onChange={(v) => onChange(["content", "attachments"], v)}
        />
      </div>
    </div>
  );
}
