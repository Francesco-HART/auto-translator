import React from "react";
import { Title } from "@/components";

export function NestedComponents() {
  return (
    <div>
      {/* Visible text => detect */}
      <Title>Hard-coded Title</Title>

      {/* Partly translated, partly hard-coded => detect "I am hard-coded" */}
      <p>
        {t("myTranslation.key")}
        {" - I am hard-coded"}
      </p>

      {/* JSX attribute => ignore */}
      <button aria-label="Close popup">X</button>
    </div>
  );
}
