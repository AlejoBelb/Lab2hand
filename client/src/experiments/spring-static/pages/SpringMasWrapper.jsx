// client/src/experiments/spring-static/pages/SpringMasWrapper.jsx

import React from "react";
import HookeMAS from "./HookeMAS.jsx";


export default function SpringMasWrapper() {
  return (
    <HookeMAS
      open={true}
      onClose={() => {}}
      onEditParams={() => {}}
      params={{}}
    />
  );
}