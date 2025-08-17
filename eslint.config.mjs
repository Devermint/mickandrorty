// eslint.config.mjs — minimal, no hard stops
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true }
        // NOTE: no `project: [...]` here => avoids type-aware strictness
      }
    },
    plugins: {
      "@typescript-eslint": tsPlugin
    },
    rules: {
      // keep everything chill
      "no-console": "off",
      "no-debugger": "off",

      // TS noise off
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
];
