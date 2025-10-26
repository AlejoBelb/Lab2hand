// client/src/pages/HomeMenu.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  Button,
  Subtitle2,
  Title2,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { Beaker24Regular, Line24Regular } from "@fluentui/react-icons";

export default function HomeMenu() {
  const navigate = useNavigate();

  return (
    <div className="container-max" style={{ paddingBlock: 8 }}>
      <header style={{ textAlign: "center", margin: "6px 0 12px" }}>
        <Title2>Experimentos de Física</Title2>
        <div style={{ marginTop: 6, color: "#94A3B8" }}>
          El experimento de <strong>MAS</strong> está incluido dentro de <strong>Spring</strong>.
        </div>
      </header>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
          gap: 14,
        }}
      >
        {/* Bernoulli */}
        <Card className="glass-card" appearance="filled-alternative" orientation="vertical">
          <CardHeader
            header={<Subtitle2>Bernoulli</Subtitle2>}
            description="Flujo de fluidos y principio de Bernoulli."
            image={<Beaker24Regular />}
          />
          <CardPreview />
          <CardFooter>
            <Button appearance="primary" onClick={() => navigate("/experiments/bernoulli")}>
              Abrir
            </Button>
          </CardFooter>
        </Card>

        {/* Spring (+MAS) */}
        <Card className="glass-card" appearance="filled-alternative" orientation="vertical">
          <CardHeader
            header={
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Subtitle2>Spring</Subtitle2>
                <span className="chip-info" aria-label="Incluye Movimiento Armónico Simple">Incluye MAS</span>
              </div>
            }
            description="Ley de Hooke y oscilaciones. MAS se ejecuta dentro de este módulo."
            image={<Line24Regular />}
          />
          <CardPreview />
          <CardFooter>
            <Button appearance="primary" onClick={() => navigate("/experiments/spring")}>
              Abrir
            </Button>
          </CardFooter>
        </Card>
      </section>
    </div>
  );
}
