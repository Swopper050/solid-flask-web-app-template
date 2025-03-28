import globals from "globals";
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import solid from "eslint-plugin-solid/configs/typescript";
import * as tsParser from "@typescript-eslint/parser";

export default [
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    ...solid,
    languageOptions: {
      globals: {
        ...globals.browser
      },
      parser: tsParser,
      parserOptions: {
        project: "tsconfig.json",
      },
    },
  },
  {
    ignores: ["**/*.css"]
  }
];
