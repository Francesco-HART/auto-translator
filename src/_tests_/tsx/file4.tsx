import React, { useState } from "react";
import type { FC } from "react";

export const EdgeCases: FC = () => {
  // "Should not detect" => just a comment, not code
  const T = t; // Suppose qu'on fait un alias => T("some.key")
  const [count, setCount] = useState(0);

  return (
    <>
      {/* Hard-coded multi-lignes => should detect */}
      Hello world again
      {/* Should ignore => T(...) or t(...) */}
      <div>
        {T("alias.translation")}
        {t("normal.translation")}
      </div>
      {/* Self-closing => text inside? */}
      <img alt="logo" src="/images/logo.png" />
    </>
  );
};
