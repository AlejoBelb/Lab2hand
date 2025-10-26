// client/src/shared/components/AppHeader.jsx
import React from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Toolbar, Button, Link, makeStyles } from "@fluentui/react-components";
import { Home24Regular, Person24Regular } from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: {
    position: "sticky",
    top: 0,
    zIndex: 10,
    backgroundColor: "rgba(16, 24, 40, 0.55)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(148,163,184,.25)",
  },
  bar: {
    maxWidth: "1360px",
    margin: "0 auto",
    width: "100%",
    padding: "6px 10px",
    display: "flex",
    gap: "8px",
  },
  grow: { flexGrow: 1 },
  home: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    textDecoration: "none",
  },
});

export default function AppHeader() {
  const s = useStyles();
  const navigate = useNavigate();

  return (
    <div className={s.root}>
      <Toolbar className={s.bar}>
        <Link as={RouterLink} to="/" className={s.home} aria-label="Ir a Home">
          <Home24Regular />
          <span>Home</span>
        </Link>

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
