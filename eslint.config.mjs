import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    // Generated screenshots and local browser downloads.
    ".preview/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Vendored Claude skill assets — not our source, not our rules.
    ".claude/**",
  ]),
]);

export default eslintConfig;
