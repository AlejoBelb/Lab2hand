// client/src/experiments/spring-static/pages/SpringTabs.jsx
import React from "react";
import { TabList, Tab, makeStyles } from "@fluentui/react-components";
import { useLocation, useNavigate } from "react-router-dom";
import HookeStatic from "./HookeStatic.jsx";
import HookeMAS from "./HookeMAS.jsx";

const useStyles = makeStyles({
  wrap: { maxWidth: "1360px", margin: "0 auto" },
  top: { marginBottom: "8px" },
  info: {
    background: "rgba(17, 24, 39, 0.40)",
    border: "1px solid rgba(148, 163, 184, 0.20)",
    borderRadius: "10px",
    padding: "8px 12px",
    color: "#94A3B8",
    marginBottom: "8px",
  },
  tabs: { marginBottom: "8px" },
  content: {},
});

export default function SpringTabs() {
  const s = useStyles();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const initialValue = pathname.endsWith("/mas") ? "mas" : "hooke";
  const [value, setValue] = React.useState(initialValue);

  React.useEffect(() => {
    if (value === "hooke" && pathname !== "/experiments/spring") {
      nav("/experiments/spring", { replace: true });
    }
    if (value === "mas" && pathname !== "/experiments/spring/mas") {
      nav("/experiments/spring/mas", { replace: true });
    }
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    const next = pathname.endsWith("/mas") ? "mas" : "hooke";
    if (next !== value) setValue(next);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={s.wrap}>
      <div className={s.top}>
        <div className={s.info}>
          El experimento de <strong>Movimiento Armónico Simple (MAS)</strong> se ejecuta dentro de
          <strong> Spring</strong>. Cambia de pestaña para alternar entre <em>Resorte (Hooke)</em> y <em>MAS</em>.
        </div>

        <TabList
          className={s.tabs}
          selectedValue={value}
          onTabSelect={(_, data) => setValue(data.value)}
          size="medium"
        >
          <Tab value="hooke">Resorte (Hooke)</Tab>
          <Tab value="mas">MAS (Movimiento Armónico Simple)</Tab>
        </TabList>
      </div>

      {/* Contenedor con clases de unificación visual para cualquier experimento */}
      <div className={`${s.content} exp-content`}>
        {value === "hooke" ? (
          <HookeStatic />
        ) : (
          <div className="exp-panel">
            <HookeMAS />
          </div>
        )}
      </div>
    </div>
  );
}
