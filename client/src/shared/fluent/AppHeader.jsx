// client/src/shared/components/fluent/AppHeader.jsx
import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Toolbar,
  Button,
  Link,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Beaker24Regular, Home24Regular, Person24Regular } from "@fluentui/react-icons";

// Estilos sobrios para barra superior corporativa
const useStyles = makeStyles({
  root: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  bar: {
    maxWidth: "1200px",
    margin: "0 auto",
    width: "100%",
    padding: "8px 12px",
    display: "flex",
    gap: "8px",
  },
  grow: { flexGrow: 1 },
  brand: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: 700,
    color: tokens.colorNeutralForeground1,
    textDecoration: "none",
  },
  navLinks: {
    display: "inline-flex",
    alignItems: "center",
    gap: "12px",
  },
});

export default function AppHeader() {
  const s = useStyles();
  const navigate = useNavigate();

  return (
    <div className={s.root}>
      <Toolbar className={s.bar}>
        <Link as={RouterLink} to="/" className={s.brand} aria-label="Lab2hand, ir al menú">
          <Beaker24Regular />
          <span>Lab2hand</span>
        </Link>

        <div className={s.navLinks}>
          <Link as={RouterLink} to="/" appearance="subtle" aria-label="Menú principal">
            <Home24Regular style={{ verticalAlign: "text-bottom" }} /> Menú
          </Link>
          <Link as={RouterLink} to="/experiments/bernoulli" appearance="subtle">
            Bernoulli
          </Link>
          <Link as={RouterLink} to="/experiments/spring" appearance="subtle">
            Spring
          </Link>
        </div>

        <div className={s.grow} />

        <Button
          appearance="primary"
          icon={<Person24Regular />}
          onClick={() => navigate("/login")}
          aria-label="Iniciar sesión"
        >
          Iniciar sesión
        </Button>
      </Toolbar>
    </div>
  );
}
