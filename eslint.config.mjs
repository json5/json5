import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import nodePlugin from "eslint-plugin-n";

export default defineConfig([
  {
    ignores: [
      "node_modules/**",
      "coverage/**",
      "lib/unicode.js",
      "eslint.config.mjs",
    ],
  },
  {
    plugins: {
      n: nodePlugin,
    },
  },
  js.configs.recommended,
  nodePlugin.configs["flat/recommended"],
  {
    rules: {
      "no-unused-vars": [
        "error",
        {
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    files: ["**/*.cjs"],
    languageOptions: {
      globals: {
        require: "readonly",
      },
    },
  },
]);
