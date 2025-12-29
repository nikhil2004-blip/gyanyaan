// This file is INTENTIONALLY bad to test your GitHub CI workflows.
// It contains ESLint errors and Formatting issues.

import React from "react";

const LintTest = () => {
  // ESLint Error: no-unused-vars
  const unusedVar = "I am not used";

  // ESLint Warning/Error: eqeqeq (using == instead of ===)
  if (1 == "1") {
    console.log("This is bad comparison");
  }

  // Formatting Issue: Bad indentation
  const badIndentation = "This looks messy";

  return (
    <div style={{ padding: "20px", border: "1px solid red" }}>
      <h1>Lint Test File</h1>
      <p>{badIndentation}</p>
    </div>
  );
};

export default LintTest;
