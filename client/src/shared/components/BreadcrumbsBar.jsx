// client/src/shared/components/BreadcrumbsBar.jsx
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
} from "@fluentui/react-components";
import { useLocation, useNavigate } from "react-router-dom";

const labels = {
  "/": "Home",
  "/experiments": "Experimentos",
  "/experiments/bernoulli": "Bernoulli",
  "/experiments/spring": "Spring",
  "/experiments/spring/mas": "MAS",
};

export default function BreadcrumbsBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segs = pathname.split("/").filter(Boolean);
  const paths = segs.map((_, i) => "/" + segs.slice(0, i + 1).join("/"));
  const crumbs = ["/", ...paths.filter((p) => p !== "/")];

  return (
    <div className="glass-soft" style={{ padding: "6px 10px", margin: "8px 0 10px" }}>
      <Breadcrumb size="small">
        {crumbs.map((p, idx) => {
          const isLast = idx === crumbs.length - 1;
          return (
            <React.Fragment key={p}>
              <BreadcrumbItem>
                <BreadcrumbButton current={isLast} onClick={() => !isLast && navigate(p)}>
                  {labels[p] ?? p}
                </BreadcrumbButton>
              </BreadcrumbItem>
              {!isLast && <BreadcrumbDivider />}
            </React.Fragment>
          );
        })}
      </Breadcrumb>
    </div>
  );
}
