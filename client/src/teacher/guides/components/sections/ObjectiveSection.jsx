// client/src/teacher/guides/components/sections/ObjectiveSection.jsx
import { Textarea, Card, Badge, Tooltip } from "@fluentui/react-components";

export default function ObjectiveSection({ value, onChange, complete }) {
  return (
    <Card className="glass" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <h3>Objetivo del experimento</h3>

        <Tooltip
          content={
            complete
              ? "El objetivo cumple los criterios mínimos."
              : "El objetivo es obligatorio y debe ser descriptivo."
          }
          relationship="label"
        >
          <Badge appearance={complete ? "filled" : "outline"}>
            {complete ? "Completo" : "Incompleto"}
          </Badge>
        </Tooltip>
      </div>

      <Textarea
        placeholder="Describe el objetivo del experimento"
        value={value}
        resize="vertical"
        onChange={(e) => onChange(e.target.value)}
      />
    </Card>
  );
}
