// client/src/pages/HomeMenu.jsx
import React from "react";
import {
  Card,
  CardHeader,
  CardPreview,
  CardFooter,
  Button,
  Subtitle2,
  Title1,
  Title3,
  Badge,
  Text,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import { Beaker24Regular, Line24Regular, ArrowRight24Regular, Video24Regular } from "@fluentui/react-icons";

export default function HomeMenu() {
  const navigate = useNavigate();

  return (
    <>
      <style>
        {`
          .glass-card {
            background: rgba(30, 30, 40, 0.6) !important;
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;
            overflow: hidden;
          }
          .glass-card:hover {
            transform: translateY(-4px);
            border-color: rgba(64, 128, 255, 0.5);
            box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.5), 
                        0 0 20px rgba(64, 128, 255, 0.15);
          }
          .icon-glow {
            color: #60a5fa;
            filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.4));
          }
          .hero-text {
            background: linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .video-responsive {
            position: relative;
            padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
            height: 0;
            overflow: hidden;
          }
          .video-responsive iframe {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 0;
          }
        `}
      </style>

      <div className="container-max" style={{ paddingBlock: 40, maxWidth: 1000, margin: "0 auto", padding: "0 20px" }}>
        
        {/* HERO SECTION */}
        <header style={{ textAlign: "center", marginBottom: 60, marginTop: 40 }}>
          <Title1 className="hero-text" style={{ fontSize: "3rem", fontWeight: 800, letterSpacing: "-1px" }}>
            Experimentos de Física
          </Title1>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
            <Text size={400} style={{ color: "#94A3B8", maxWidth: 600 }}>
              Explora simulaciones interactivas. El módulo de{" "}
              <strong style={{ color: "#fff" }}>MAS</strong> se encuentra dentro de <strong style={{ color: "#fff" }}>Spring</strong>.
            </Text>
          </div>
        </header>

        {/* GRID DE EXPERIMENTOS */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
            gap: 24,
            marginBottom: 60
          }}
        >
          {/* Bernoulli */}
          <Card className="glass-card" onClick={() => navigate("/experiments/bernoulli")} style={{ cursor: "pointer", padding: 0 }}>
            <CardHeader
              header={<Subtitle2 style={{ fontSize: "1.2rem" }}>Bernoulli</Subtitle2>}
              description={<Text style={{ color: "#94a3b8" }}>Dinámica de fluidos</Text>}
              style={{ padding: "20px 20px 0 20px" }}
            />
            <CardPreview style={{ padding: "30px 0", background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(59, 130, 246, 0.05) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Beaker24Regular style={{ fontSize: 80 }} className="icon-glow" />
              </div>
            </CardPreview>
            <div style={{ padding: "0 20px 20px 20px" }}>
              <CardFooter style={{ padding: 0 }}>
                <Button appearance="primary" icon={<ArrowRight24Regular />} iconPosition="after" style={{ width: "100%", background: "linear-gradient(90deg, #2563eb, #1d4ed8)", border: "none" }}>Abrir</Button>
              </CardFooter>
            </div>
          </Card>

          {/* Spring */}
          <Card className="glass-card" onClick={() => navigate("/experiments/spring")} style={{ cursor: "pointer", padding: 0 }}>
            <CardHeader
              header={
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Subtitle2 style={{ fontSize: "1.2rem" }}>Spring</Subtitle2>
                  <Badge appearance="tint" color="success" shape="rounded">Incluye MAS</Badge>
                </div>
              }
              description={<Text style={{ color: "#94a3b8" }}>Oscilaciones</Text>}
              style={{ padding: "20px 20px 0 20px" }}
            />
            <CardPreview style={{ padding: "30px 0", background: "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(16, 185, 129, 0.05) 100%)" }}>
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Line24Regular style={{ fontSize: 80, color: "#34d399", transform: "rotate(-45deg)" }} className="icon-glow" />
              </div>
            </CardPreview>
            <div style={{ padding: "0 20px 20px 20px" }}>
              <CardFooter style={{ padding: 0 }}>
                <Button appearance="primary" icon={<ArrowRight24Regular />} iconPosition="after" style={{ width: "100%", background: "linear-gradient(90deg, #2563eb, #1d4ed8)", border: "none" }}>Abrir</Button>
              </CardFooter>
            </div>
          </Card>
        </section>

        {/* SECCIÓN DE VIDEO */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <Video24Regular style={{ color: "#cbd5e1" }} />
            <Title3 style={{ color: "#fff", fontSize: "1.5rem" }}>Introducción / Tutorial</Title3>
          </div>

          <Card className="glass-card" style={{ padding: 0, border: "none" }}>
            <div className="video-responsive">
              {/* RECUERDA: CAMBIA EL SRC POR TU VIDEO */}
              <iframe 
                src="https://www.youtube.com/embed/lxI1L1Qh8s4?si=demo" 
                title="Video explicativo" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
            
            <div style={{ padding: 20 }}>
              <Text style={{ color: "#94a3b8" }}>
                Breve explicación sobre cómo utilizar los módulos de simulación y recolectar datos.
              </Text>
            </div>
          </Card>
        </section>

        {/* HE ELIMINADO EL FOOTER DE AQUÍ PARA EVITAR DUPLICADOS */}

      </div>
    </>
  );
}